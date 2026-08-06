/**
 * Renders a single fountain-code frame (see fountain.ts) as the sender's
 * canvas state: the data grid, fiducials, validation marker, calibration
 * swatches, and the sync region for the given toggle phase. Pure
 * rendering -- all scheduling/dwell-timing lives in the sender component.
 */

import { getCellPaletteIndex } from "./optical-layout";
import {
  CALIBRATION_SWATCHES,
  CELL_COUNT,
  FIDUCIAL_COLOR,
  FIDUCIALS,
  SYNC_COLOR_A,
  SYNC_COLOR_B,
  SYNC_REGION,
  VALIDATION_MARKER,
  VALIDATION_MARKER_COLOR,
  VIRTUAL_SIZE,
  dataCellRegion,
  paletteCss,
  type Region,
} from "./optical-layout";

function fillRegion(
  ctx: CanvasRenderingContext2D,
  region: Region,
  scale: number,
  color: string,
): void {
  const half = (region.size * scale) / 2;
  ctx.fillStyle = color;
  ctx.fillRect(region.center.x * scale - half, region.center.y * scale - half, half * 2, half * 2);
}

/**
 * Draws one frame's worth of canvas state. `canvasSize` is the pixel
 * width/height of a square canvas; the virtual 0..1000 layout is scaled
 * to fit it exactly.
 */
export function renderOpticalFrame(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  frame: Uint8Array,
  syncToggle: boolean,
): void {
  const scale = canvasSize / VIRTUAL_SIZE;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  for (const fiducial of FIDUCIALS) fillRegion(ctx, fiducial, scale, FIDUCIAL_COLOR);
  fillRegion(ctx, VALIDATION_MARKER, scale, VALIDATION_MARKER_COLOR);
  fillRegion(ctx, SYNC_REGION, scale, syncToggle ? SYNC_COLOR_A : SYNC_COLOR_B);
  for (const swatch of CALIBRATION_SWATCHES) {
    fillRegion(ctx, swatch, scale, paletteCss(swatch.paletteIndex));
  }

  for (let i = 0; i < CELL_COUNT; i++) {
    const value = getCellPaletteIndex(frame, i);
    fillRegion(ctx, dataCellRegion(i), scale, paletteCss(value));
  }
}

/** A fixed calibration-only frame (no data grid content lit meaningfully --
 * all cells set to palette 0) for the pre-transfer alignment step, so the
 * receiver can validate its homography/color calibration before any real
 * data starts flowing. */
export function renderCalibrationFrame(ctx: CanvasRenderingContext2D, canvasSize: number): void {
  const blank = new Uint8Array(Math.ceil((CELL_COUNT * 2) / 8));
  renderOpticalFrame(ctx, canvasSize, blank, true);
}
