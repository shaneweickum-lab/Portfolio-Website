import { CELL_COUNT, getCellPaletteIndex, setCellPaletteIndex } from "./optical-layout";
import { FRAME_BYTES } from "./fountain";

let failures = 0;

function check(label: string, condition: boolean, detail?: string) {
  const status = condition ? "PASS" : "FAIL";
  console.log(`[${status}] ${label}${!condition && detail ? ` -- ${detail}` : ""}`);
  if (!condition) failures++;
}

// Every cell, every possible palette value, round-trips through a single byte array.
{
  const frame = new Uint8Array(FRAME_BYTES);
  const expected: number[] = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    const value = i % 4;
    expected.push(value);
    setCellPaletteIndex(frame, i, value);
  }

  let allMatch = true;
  for (let i = 0; i < CELL_COUNT; i++) {
    if (getCellPaletteIndex(frame, i) !== expected[i]) allMatch = false;
  }
  check("all 64 cells round-trip through packed bytes without cross-talk", allMatch);
}

// Setting one cell must not disturb its neighbors sharing the same byte.
{
  const frame = new Uint8Array(FRAME_BYTES);
  setCellPaletteIndex(frame, 0, 3);
  setCellPaletteIndex(frame, 1, 1);
  setCellPaletteIndex(frame, 2, 2);
  setCellPaletteIndex(frame, 3, 0);
  check(
    "4 cells packed into a single byte don't clobber each other",
    getCellPaletteIndex(frame, 0) === 3 &&
      getCellPaletteIndex(frame, 1) === 1 &&
      getCellPaletteIndex(frame, 2) === 2 &&
      getCellPaletteIndex(frame, 3) === 0,
  );
}

if (failures > 0) {
  console.log(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll optical-layout.ts checks passed.");
