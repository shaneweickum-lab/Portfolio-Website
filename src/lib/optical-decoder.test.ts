import { FountainEncoder, decodeFrame } from "./fountain";
import { applyHomography, type Mat3 } from "./homography";
import {
  CALIBRATION_SWATCHES,
  CELL_COUNT,
  FIDUCIALS,
  VALIDATION_MARKER,
  dataCellRegion,
  paletteRgb,
} from "./optical-layout";
import { OpticalReceiverPipeline, assignFiducialRoles, findDarkBlobs } from "./optical-decoder";

let failures = 0;

function check(label: string, condition: boolean, detail?: string) {
  const status = condition ? "PASS" : "FAIL";
  console.log(`[${status}] ${label}${!condition && detail ? ` -- ${detail}` : ""}`);
  if (!condition) failures++;
}

interface FakeImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

function makeBlankFrame(width: number, height: number): FakeImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = 255;
  }
  return { width, height, data };
}

function stampSquare(
  frame: FakeImageData,
  center: { x: number; y: number },
  halfSize: number,
  color: [number, number, number],
) {
  const x0 = Math.round(center.x - halfSize);
  const x1 = Math.round(center.x + halfSize);
  const y0 = Math.round(center.y - halfSize);
  const y1 = Math.round(center.y + halfSize);
  for (let y = Math.max(0, y0); y < Math.min(frame.height, y1); y++) {
    for (let x = Math.max(0, x0); x < Math.min(frame.width, x1); x++) {
      const i = (y * frame.width + x) * 4;
      frame.data[i] = color[0];
      frame.data[i + 1] = color[1];
      frame.data[i + 2] = color[2];
      frame.data[i + 3] = 255;
    }
  }
}

/** Renders a synthetic "camera frame" by projecting each layout region's
 * known center through `h` and stamping a fixed-size colored square there.
 * This deliberately doesn't simulate perspective-correct region *shapes*
 * (only positions) -- that fidelity is covered separately by the real
 * canvas-based integration test. This test is about the algorithm: blob
 * detection, role assignment under real rotation/skew, homography solve,
 * hue classification, debounce, and CRC/fountain decode. */
function renderSyntheticFrame(width: number, height: number, h: Mat3, frameBytes: Uint8Array): FakeImageData {
  const frame = makeBlankFrame(width, height);
  const dark: [number, number, number] = [10, 10, 10];

  // Sized well above the blob detector's bucket granularity so area
  // quantization noise doesn't swamp the (realistic, ~2:1) true area
  // ratio between a fiducial and the smaller validation marker -- a
  // too-small stamp size here is a test-fidelity issue, not something
  // that reflects a real camera frame at any normal demo distance.
  for (const fiducial of FIDUCIALS) stampSquare(frame, applyHomography(h, fiducial.center), 30, dark);
  stampSquare(frame, applyHomography(h, VALIDATION_MARKER.center), 20, dark);

  for (const swatch of CALIBRATION_SWATCHES) {
    stampSquare(frame, applyHomography(h, swatch.center), 12, paletteRgb(swatch.paletteIndex));
  }

  for (let i = 0; i < CELL_COUNT; i++) {
    const byteIndex = Math.floor(i / 4);
    const shift = 6 - (i % 4) * 2;
    const value = (frameBytes[byteIndex] >> shift) & 0b11;
    stampSquare(frame, applyHomography(h, dataCellRegion(i).center), 10, paletteRgb(value));
  }

  return frame;
}

function runPipelineTest(label: string, h: Mat3) {
  const data = new TextEncoder().encode("hello air-gapped world, this is a test payload!");
  const encoder = new FountainEncoder(data);
  const frameBytes = encoder.dataFrame(0);
  const expectedDecoded = decodeFrame(frameBytes);
  check(`${label}: source frame encodes/decodes cleanly before rendering`, expectedDecoded?.type === "data");

  const width = 1280;
  const height = 960;
  const camFrame1 = renderSyntheticFrame(width, height, h, frameBytes) as unknown as ImageData;
  const camFrame2 = renderSyntheticFrame(width, height, h, frameBytes) as unknown as ImageData;

  const blobs = findDarkBlobs(camFrame1);
  check(`${label}: exactly 5 dark blobs detected (4 fiducials + validation)`, blobs.length === 5, `found ${blobs.length}`);

  const pipeline = new OpticalReceiverPipeline();
  const first = pipeline.processFrame(camFrame1);
  check(`${label}: first frame is not accepted yet (debounce requires 2 consecutive matches)`, first.decoded === null);

  const second = pipeline.processFrame(camFrame2);
  check(`${label}: second identical frame is accepted`, second.decoded !== null, JSON.stringify(second.diagnostics));

  if (second.decoded?.type === "data") {
    check(
      `${label}: decoded symbolIndex matches`,
      second.decoded.symbolIndex === 0,
    );
    const payloadMatches =
      expectedDecoded?.type === "data" &&
      second.decoded.payload.length === expectedDecoded.payload.length &&
      second.decoded.payload.every((byte, i) => byte === expectedDecoded.payload[i]);
    check(`${label}: decoded payload matches the original bytes exactly`, !!payloadMatches);
  } else {
    check(`${label}: decoded frame has type "data"`, false, JSON.stringify(second));
  }
}

// Identity-ish homography: simple scale + translate, no rotation/skew.
// (Scale/offset chosen so the full 0..1000 virtual square lands inside
// the 1280x960 test canvas -- otherwise corners clip off-frame.)
runPipelineTest("no distortion", [0.85, 0, 100, 0, 0.85, 50, 0, 0, 1]);

// A real perspective transform: rotated, scaled, translated, and skewed --
// exercises assignFiducialRoles' angle-based tolerance, not just a happy path.
runPipelineTest("rotated + skewed", [1.05, 0.22, 160, -0.18, 0.95, 110, 0.00025, 0.00015, 1]);

// assignFiducialRoles should reject blobs that don't cleanly map to distinct corners.
{
  const collidingBlobs = [
    { x: 100, y: 100, area: 100 },
    { x: 105, y: 100, area: 100 }, // basically on top of the first -- same angle bucket
    { x: 900, y: 900, area: 100 },
    { x: 100, y: 900, area: 100 },
  ];
  check(
    "assignFiducialRoles rejects a role collision instead of guessing",
    assignFiducialRoles(collidingBlobs) === null,
  );
}

if (failures > 0) {
  console.log(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll optical-decoder.ts checks passed.");
