/**
 * The physical layout both the sender (rendering to a <canvas>) and the
 * receiver (sampling from a camera frame, via a solved homography) must
 * agree on exactly. All coordinates are in a virtual 0..1000 square —
 * "screen space" — independent of actual pixel dimensions on either side.
 */

import { FRAME_BYTES } from "./fountain";

export interface Point {
  x: number;
  y: number;
}

export interface Region {
  center: Point;
  size: number;
}

export const VIRTUAL_SIZE = 1000;
export const GRID_SIZE = 8; // 8x8 = 64 cells
export const BITS_PER_CELL = 2; // log2(palette length) -- 4 colors
export const CELL_COUNT = GRID_SIZE * GRID_SIZE;

if (CELL_COUNT * BITS_PER_CELL !== FRAME_BYTES * 8) {
  throw new Error("optical-layout grid capacity must exactly match FRAME_BYTES");
}

// --- Palette: 4 hues 90 degrees apart, high saturation, mid lightness --
// (avoids black/white extremes -- see design notes on AE hunting and LCD
// gray-to-gray response time for those color pairs).

export const PALETTE_HSL: [number, number, number][] = [
  [0, 85, 50],
  [90, 85, 50],
  [180, 85, 50],
  [270, 85, 50],
];

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sFrac = s / 100;
  const lFrac = l / 100;
  const c = (1 - Math.abs(2 * lFrac - 1)) * sFrac;
  const hPrime = h / 60;
  const x = c * (1 - Math.abs((hPrime % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hPrime >= 0 && hPrime < 1) [r, g, b] = [c, x, 0];
  else if (hPrime < 2) [r, g, b] = [x, c, 0];
  else if (hPrime < 3) [r, g, b] = [0, c, x];
  else if (hPrime < 4) [r, g, b] = [0, x, c];
  else if (hPrime < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = lFrac - c / 2;
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/** Hue angle in degrees [0, 360). Used to classify a sampled cell color
 * against the (live-calibrated) palette hues, since exposure/gain drift
 * mostly affects perceived luminance while hue stays comparatively stable. */
export function rgbToHue(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;

  let hue: number;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  hue *= 60;
  return hue < 0 ? hue + 360 : hue;
}

/** Shortest distance between two angles in degrees, mod 360. Used both
 * for hue comparisons and for matching detected fiducial blobs to their
 * canonical corner roles by angle-from-centroid. */
export function circularDistanceDegrees(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export function paletteRgb(index: number): [number, number, number] {
  const [h, s, l] = PALETTE_HSL[index];
  return hslToRgb(h, s, l);
}

export function paletteCss(index: number): string {
  const [r, g, b] = paletteRgb(index);
  return `rgb(${r}, ${g}, ${b})`;
}

// --- Fiducials (4 corners, used to solve the homography) ---

export const FIDUCIAL_SIZE = 100;
export const FIDUCIAL_COLOR = "#0a0a0a";

export const FIDUCIALS: Region[] = [
  { center: { x: 70, y: 70 }, size: FIDUCIAL_SIZE }, // top-left
  { center: { x: 930, y: 70 }, size: FIDUCIAL_SIZE }, // top-right
  { center: { x: 930, y: 930 }, size: FIDUCIAL_SIZE }, // bottom-right
  { center: { x: 70, y: 930 }, size: FIDUCIAL_SIZE }, // bottom-left
];

// --- Validation marker: NOT used to solve the homography, only to check
// the solved transform's reprojection error before trusting a frame ---

export const VALIDATION_MARKER: Region = { center: { x: 710, y: 70 }, size: 70 };
export const VALIDATION_MARKER_COLOR = FIDUCIAL_COLOR;

// --- Sync/clock region: toggles between two mid-luminance colors every
// symbol transition, as a hint for roughly when to sample (not the sole
// authority -- the receiver debounces against the full grid content too) --

export const SYNC_REGION: Region = { center: { x: 500, y: 70 }, size: 90 };
export const SYNC_COLOR_A = "rgb(120, 90, 40)"; // mid-luminance amber
export const SYNC_COLOR_B = "rgb(40, 100, 110)"; // mid-luminance teal

// --- Calibration swatches: fixed, one per palette color, sampled every
// frame by the receiver to correct for auto-exposure/white-balance drift
// before classifying the (much smaller) data cells ---

export const CALIBRATION_SWATCHES: (Region & { paletteIndex: number })[] = [
  { center: { x: 260, y: 930 }, size: 70, paletteIndex: 0 },
  { center: { x: 420, y: 930 }, size: 70, paletteIndex: 1 },
  { center: { x: 580, y: 930 }, size: 70, paletteIndex: 2 },
  { center: { x: 740, y: 930 }, size: 70, paletteIndex: 3 },
];

// --- Data grid: 8x8 cells, row-major, index = row * GRID_SIZE + col ---

export const DATA_GRID_BOUNDS = { left: 180, top: 180, right: 820, bottom: 820 };

export function dataCellRegion(index: number): Region {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  const width = (DATA_GRID_BOUNDS.right - DATA_GRID_BOUNDS.left) / GRID_SIZE;
  const height = (DATA_GRID_BOUNDS.bottom - DATA_GRID_BOUNDS.top) / GRID_SIZE;
  return {
    center: {
      x: DATA_GRID_BOUNDS.left + col * width + width / 2,
      y: DATA_GRID_BOUNDS.top + row * height + height / 2,
    },
    size: Math.min(width, height) * 0.8, // slightly smaller than the cell to avoid edge bleed
  };
}

// --- Bit packing: 4 cells per byte, MSB-first, matches FRAME_BYTES exactly ---

export function getCellPaletteIndex(frame: Uint8Array, cellIndex: number): number {
  const byteIndex = Math.floor(cellIndex / 4);
  const shift = 6 - (cellIndex % 4) * 2;
  return (frame[byteIndex] >> shift) & 0b11;
}

export function setCellPaletteIndex(frame: Uint8Array, cellIndex: number, value: number): void {
  const byteIndex = Math.floor(cellIndex / 4);
  const shift = 6 - (cellIndex % 4) * 2;
  frame[byteIndex] &= ~(0b11 << shift);
  frame[byteIndex] |= (value & 0b11) << shift;
}
