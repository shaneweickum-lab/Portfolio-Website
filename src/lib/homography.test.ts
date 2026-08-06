import { applyHomography, reprojectionError, solveHomography, type Mat3, type Point } from "./homography";

let failures = 0;

function check(label: string, condition: boolean, detail?: string) {
  const status = condition ? "PASS" : "FAIL";
  console.log(`[${status}] ${label}${!condition && detail ? ` -- ${detail}` : ""}`);
  if (!condition) failures++;
}

const screenPoints: Point[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

// A plausible perspective transform: the camera sees the rectangle
// rotated, scaled, translated, and slightly skewed — not just an affine map.
const trueH: Mat3 = [1.3, 0.15, 40, -0.1, 1.2, 25, 0.0007, 0.0004, 1];

const cameraPoints = screenPoints.map((p) => applyHomography(trueH, p));
const solved = solveHomography(screenPoints, cameraPoints);

let maxTrainingError = 0;
for (let i = 0; i < 4; i++) {
  maxTrainingError = Math.max(maxTrainingError, reprojectionError(solved, screenPoints[i], cameraPoints[i]));
}
check(
  "homography reprojects the 4 training points with near-zero error",
  maxTrainingError < 1e-6,
  `maxError=${maxTrainingError}`,
);

// A held-out point not used to solve H should also reproject correctly
// for a true perspective transform.
const heldOutScreen = { x: 50, y: 50 };
const heldOutCamera = applyHomography(trueH, heldOutScreen);
const heldOutError = reprojectionError(solved, heldOutScreen, heldOutCamera);
check("homography generalizes to a held-out point", heldOutError < 1e-6, `error=${heldOutError}`);

// A detection inconsistent with the transform should show up as a large
// reprojection error — this is exactly the check the receiver uses to
// discard a frame whose fiducial detection (or homography) can't be trusted.
const badDetection = { x: heldOutCamera.x + 40, y: heldOutCamera.y + 40 };
const badError = reprojectionError(solved, heldOutScreen, badDetection);
check("homography validation flags an inconsistent detection", badError > 10, `error=${badError}`);

// Degenerate input (3 collinear points) should fail loudly, not silently
// return a nonsense matrix.
try {
  solveHomography(
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
  );
  check("degenerate (collinear) points throw instead of returning garbage", false);
} catch {
  check("degenerate (collinear) points throw instead of returning garbage", true);
}

if (failures > 0) {
  console.log(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll homography.ts checks passed.");
