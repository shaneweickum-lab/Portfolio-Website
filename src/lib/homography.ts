/**
 * 4-point planar homography: maps points in the sender's known "screen
 * space" (where each grid cell/fiducial lives at a fixed coordinate) to
 * the receiver's camera pixel space, so grid cells can be sampled
 * correctly even when the camera isn't perfectly fronto-parallel.
 *
 * With exactly 4 correspondences this is an exact 8x8 linear solve, not a
 * least-squares fit.
 */

export interface Point {
  x: number;
  y: number;
}

/** Row-major 3x3 matrix, flattened: [h11,h12,h13, h21,h22,h23, h31,h32,h33]. */
export type Mat3 = [number, number, number, number, number, number, number, number, number];

/** Solves Ax = b via Gaussian elimination with partial pivoting. Mutates nothing. */
function solveLinearSystem(a: number[][], b: number[]): number[] {
  const n = b.length;
  const m = a.map((row) => row.slice());
  const rhs = b.slice();

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    let pivotMagnitude = Math.abs(m[col][col]);
    for (let row = col + 1; row < n; row++) {
      const magnitude = Math.abs(m[row][col]);
      if (magnitude > pivotMagnitude) {
        pivotRow = row;
        pivotMagnitude = magnitude;
      }
    }
    if (pivotMagnitude < 1e-12) {
      throw new Error("Homography system is singular (degenerate point correspondences)");
    }
    if (pivotRow !== col) {
      [m[col], m[pivotRow]] = [m[pivotRow], m[col]];
      [rhs[col], rhs[pivotRow]] = [rhs[pivotRow], rhs[col]];
    }

    const pivotValue = m[col][col];
    for (let row = col + 1; row < n; row++) {
      const factor = m[row][col] / pivotValue;
      if (factor === 0) continue;
      for (let k = col; k < n; k++) m[row][k] -= factor * m[col][k];
      rhs[row] -= factor * rhs[col];
    }
  }

  const solution = new Array(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = rhs[row];
    for (let col = row + 1; col < n; col++) sum -= m[row][col] * solution[col];
    solution[row] = sum / m[row][row];
  }
  return solution;
}

/**
 * Solves for the homography H such that H * screenPoint ~ cameraPoint,
 * given exactly 4 correspondences (screenPoints[i] <-> cameraPoints[i]).
 */
export function solveHomography(screenPoints: Point[], cameraPoints: Point[]): Mat3 {
  if (screenPoints.length !== 4 || cameraPoints.length !== 4) {
    throw new Error("solveHomography requires exactly 4 point correspondences");
  }

  const a: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < 4; i++) {
    const { x, y } = screenPoints[i];
    const { x: xp, y: yp } = cameraPoints[i];

    a.push([x, y, 1, 0, 0, 0, -x * xp, -y * xp]);
    b.push(xp);

    a.push([0, 0, 0, x, y, 1, -x * yp, -y * yp]);
    b.push(yp);
  }

  const [h11, h12, h13, h21, h22, h23, h31, h32] = solveLinearSystem(a, b);
  return [h11, h12, h13, h21, h22, h23, h31, h32, 1];
}

export function applyHomography(h: Mat3, point: Point): Point {
  const denom = h[6] * point.x + h[7] * point.y + h[8];
  return {
    x: (h[0] * point.x + h[1] * point.y + h[2]) / denom,
    y: (h[3] * point.x + h[4] * point.y + h[5]) / denom,
  };
}

/** Euclidean distance (in camera pixels) between where `screenPoint` is
 * predicted to land and where it was actually detected — a large value
 * means the solved homography (or the fiducial detections that produced
 * it) shouldn't be trusted for this frame. */
export function reprojectionError(
  h: Mat3,
  screenPoint: Point,
  detectedCameraPoint: Point,
): number {
  const predicted = applyHomography(h, screenPoint);
  return Math.hypot(predicted.x - detectedCameraPoint.x, predicted.y - detectedCameraPoint.y);
}
