/**
 * The receiver's per-camera-frame pipeline: locate the fiducials, solve
 * and validate a homography, sample colors with live calibration
 * correction, classify cells, debounce against the previous frame's
 * content, and hand a CRC-valid frame to the caller for fountain
 * decoding (see fountain.ts).
 *
 * Known limitation (documented, not silently ignored): fiducial detection
 * scans the *entire* frame for dark blobs on every call, with no
 * region-of-interest restriction once tracking is established. A dark
 * object elsewhere in the camera's view (clothing, shadows, a monitor
 * bezel) can in principle produce a false blob. A production version
 * would constrain the search to the area predicted by the previous
 * frame's homography once tracking is established; that's a deliberate
 * scope cut for this phase, not an oversight.
 */

import { applyHomography, solveHomography, type Mat3, type Point } from "./homography";
import { FRAME_BYTES, decodeFrame, type DecodedFrame } from "./fountain";
import {
  CALIBRATION_SWATCHES,
  CELL_COUNT,
  FIDUCIALS,
  VALIDATION_MARKER,
  circularDistanceDegrees,
  dataCellRegion,
  rgbToHue,
  setCellPaletteIndex,
} from "./optical-layout";

export interface Blob {
  x: number;
  y: number;
  area: number;
}

export interface OpticalDiagnostics {
  blobsFound: number;
  fiducialsAssigned: boolean;
  homographyOk: boolean;
  reprojectionError: number | null;
  debounceMatched: boolean;
  frameAccepted: boolean;
  decodedType: "metadata" | "data" | null;
}

const DARK_LUMA_THRESHOLD = 70;
const REPROJECTION_ERROR_FRACTION = 0.03; // of frame width
const SAMPLE_RADIUS = 4;
// True area ratio between a fiducial and the (deliberately smaller)
// validation marker is ~2:1 (see FIDUCIAL_SIZE vs VALIDATION_MARKER in
// optical-layout.ts); this threshold leaves generous slack for
// quantization noise while still rejecting a genuine tie.
const MIN_FIDUCIAL_VALIDATION_AREA_RATIO = 1.2;

function luma(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Coarse-grid flood-fill blob detection: cheap enough to run every frame
 * without a Worker, since our targets are large, high-contrast, compact
 * regions rather than fine detail. */
export function findDarkBlobs(imageData: ImageData): Blob[] {
  const { width, height, data } = imageData;
  const bucketSize = Math.max(4, Math.round(width / 120));
  const cols = Math.ceil(width / bucketSize);
  const rows = Math.ceil(height / bucketSize);
  const dark = new Uint8Array(cols * rows);

  for (let by = 0; by < rows; by++) {
    for (let bx = 0; bx < cols; bx++) {
      const x0 = bx * bucketSize;
      const y0 = by * bucketSize;
      const x1 = Math.min(x0 + bucketSize, width);
      const y1 = Math.min(y0 + bucketSize, height);
      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * width + x) * 4;
          sum += luma(data[i], data[i + 1], data[i + 2]);
          count++;
        }
      }
      dark[by * cols + bx] = count > 0 && sum / count < DARK_LUMA_THRESHOLD ? 1 : 0;
    }
  }

  const visited = new Uint8Array(cols * rows);
  const blobs: Blob[] = [];

  for (let start = 0; start < cols * rows; start++) {
    if (!dark[start] || visited[start]) continue;

    const stack = [start];
    visited[start] = 1;
    let sumX = 0;
    let sumY = 0;
    let count = 0;

    while (stack.length > 0) {
      const index = stack.pop()!;
      const bx = index % cols;
      const by = Math.floor(index / cols);
      sumX += bx;
      sumY += by;
      count++;

      const neighbors = [
        [bx + 1, by],
        [bx - 1, by],
        [bx, by + 1],
        [bx, by - 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const nIndex = ny * cols + nx;
        if (dark[nIndex] && !visited[nIndex]) {
          visited[nIndex] = 1;
          stack.push(nIndex);
        }
      }
    }

    blobs.push({
      x: (sumX / count + 0.5) * bucketSize,
      y: (sumY / count + 0.5) * bucketSize,
      area: count * bucketSize * bucketSize,
    });
  }

  return blobs;
}

const CANONICAL_CORNER_ANGLES = [-135, -45, 45, 135]; // TL, TR, BR, BL -- matches FIDUCIALS order

/** Assigns 4 detected blobs to TL/TR/BR/BL by nearest angle-from-centroid.
 * Tolerant of moderate in-plane rotation (roughly up to +-40 degrees);
 * returns null on any role collision, which signals either excessive
 * rotation or a bad detection rather than guessing. */
export function assignFiducialRoles(blobs: Blob[]): Blob[] | null {
  if (blobs.length !== 4) return null;

  const cx = blobs.reduce((sum, b) => sum + b.x, 0) / 4;
  const cy = blobs.reduce((sum, b) => sum + b.y, 0) / 4;

  const assigned: (Blob | null)[] = [null, null, null, null];
  for (const blob of blobs) {
    const angle = (Math.atan2(blob.y - cy, blob.x - cx) * 180) / Math.PI;
    let bestRole = -1;
    let bestDistance = Infinity;
    for (let role = 0; role < 4; role++) {
      const distance = circularDistanceDegrees(angle, CANONICAL_CORNER_ANGLES[role]);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestRole = role;
      }
    }
    if (assigned[bestRole] !== null) return null; // collision: too much rotation or a bad detection
    assigned[bestRole] = blob;
  }

  return assigned as Blob[];
}

function sampleAverageColor(imageData: ImageData, point: Point): [number, number, number] {
  const { width, height, data } = imageData;
  const cx = Math.round(point.x);
  const cy = Math.round(point.y);
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let dy = -SAMPLE_RADIUS; dy <= SAMPLE_RADIUS; dy++) {
    for (let dx = -SAMPLE_RADIUS; dx <= SAMPLE_RADIUS; dx++) {
      const x = cx + dx;
      const y = cy + dy;
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      const i = (y * width + x) * 4;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }

  if (count === 0) return [0, 0, 0];
  return [r / count, g / count, b / count];
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export class OpticalReceiverPipeline {
  private previousRawBytes: Uint8Array | null = null;
  private lastAcceptedBytes: Uint8Array | null = null;

  processFrame(imageData: ImageData): { diagnostics: OpticalDiagnostics; decoded: DecodedFrame | null } {
    const diagnostics: OpticalDiagnostics = {
      blobsFound: 0,
      fiducialsAssigned: false,
      homographyOk: false,
      reprojectionError: null,
      debounceMatched: false,
      frameAccepted: false,
      decodedType: null,
    };

    const blobs = findDarkBlobs(imageData);
    diagnostics.blobsFound = blobs.length;
    if (blobs.length < 5) return { diagnostics, decoded: null };

    const sortedByArea = blobs.slice().sort((a, b) => b.area - a.area).slice(0, 5);
    const fiducialCandidates = sortedByArea.slice(0, 4);
    const validationBlob = sortedByArea[4];

    // The validation marker is deliberately smaller than the fiducials
    // (see optical-layout.ts), but coarse-grid area quantization can let
    // its measured area tie with a real fiducial's at unlucky bucket
    // alignments. Require a healthy relative gap between the 4th and 5th
    // blob before trusting the split -- otherwise reject rather than
    // silently risk mistaking the validation marker for a fiducial.
    if (sortedByArea[3].area < sortedByArea[4].area * MIN_FIDUCIAL_VALIDATION_AREA_RATIO) {
      return { diagnostics, decoded: null };
    }

    const roles = assignFiducialRoles(fiducialCandidates);
    if (!roles) return { diagnostics, decoded: null };
    diagnostics.fiducialsAssigned = true;

    let h: Mat3;
    try {
      h = solveHomography(
        FIDUCIALS.map((f) => f.center),
        roles.map((b) => ({ x: b.x, y: b.y })),
      );
    } catch {
      return { diagnostics, decoded: null };
    }

    const predictedValidation = applyHomography(h, VALIDATION_MARKER.center);
    const reprojectionError = Math.hypot(
      predictedValidation.x - validationBlob.x,
      predictedValidation.y - validationBlob.y,
    );
    diagnostics.reprojectionError = reprojectionError;
    if (reprojectionError > imageData.width * REPROJECTION_ERROR_FRACTION) {
      return { diagnostics, decoded: null };
    }
    diagnostics.homographyOk = true;

    // Live calibration: measure this frame's actual hue for each palette
    // color from the fixed reference swatches, rather than trusting fixed
    // absolute hue constants that drift with exposure/white-balance.
    const referenceHues = CALIBRATION_SWATCHES.map((swatch) => {
      const [r, g, b] = sampleAverageColor(imageData, applyHomography(h, swatch.center));
      return rgbToHue(r, g, b);
    });

    const rawBytes = new Uint8Array(FRAME_BYTES);
    for (let i = 0; i < CELL_COUNT; i++) {
      const [r, g, b] = sampleAverageColor(imageData, applyHomography(h, dataCellRegion(i).center));
      const hue = rgbToHue(r, g, b);

      let bestIndex = 0;
      let bestDistance = Infinity;
      for (let ref = 0; ref < referenceHues.length; ref++) {
        const distance = circularDistanceDegrees(hue, referenceHues[ref]);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = ref;
        }
      }
      setCellPaletteIndex(rawBytes, i, bestIndex);
    }

    // Content-based debounce: a symbol is held for several camera frames
    // (dwell time >> one camera frame), so only accept once the same raw
    // decode has appeared on two consecutive frames -- this is the real
    // defense against a frame captured mid-transition, not the sync region.
    const matchesPrevious =
      this.previousRawBytes !== null && bytesEqual(rawBytes, this.previousRawBytes);
    diagnostics.debounceMatched = matchesPrevious;
    const isNewContent = this.lastAcceptedBytes === null || !bytesEqual(rawBytes, this.lastAcceptedBytes);
    this.previousRawBytes = rawBytes;

    if (!matchesPrevious || !isNewContent) {
      return { diagnostics, decoded: null };
    }

    const decoded = decodeFrame(rawBytes);
    diagnostics.frameAccepted = decoded !== null;
    diagnostics.decodedType = decoded?.type ?? null;
    if (decoded) this.lastAcceptedBytes = rawBytes;

    return { diagnostics, decoded };
  }

  reset(): void {
    this.previousRawBytes = null;
    this.lastAcceptedBytes = null;
  }
}
