import {
  generateMaze,
  generateClassicMaze,
  maxWallCount,
  wallCount,
  cellIndex,
  isOpen,
  ALL_DIRECTIONS,
  MAZE_SIZES,
  braid,
  cloneMaze,
} from "./maze-generator";
import { mulberry32 } from "./prng";

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else {
    failed++;
    console.log(`[FAIL] ${name}`);
  }
}

function isFullyConnected(width: number, height: number, maze: ReturnType<typeof generateMaze>): boolean {
  const visited = new Uint8Array(width * height);
  const stack = [0];
  visited[0] = 1;
  let count = 1;

  while (stack.length > 0) {
    const idx = stack.pop() as number;
    const x = idx % width;
    const y = Math.floor(idx / width);
    for (const dir of ALL_DIRECTIONS) {
      if (!isOpen(maze, x, y, dir)) continue;
      const dx = dir === 4 ? 1 : dir === 8 ? -1 : 0;
      const dy = dir === 1 ? -1 : dir === 2 ? 1 : 0;
      const nx = x + dx;
      const ny = y + dy;
      const nIdx = cellIndex(maze, nx, ny);
      if (visited[nIdx] === 0) {
        visited[nIdx] = 1;
        count++;
        stack.push(nIdx);
      }
    }
  }

  return count === width * height;
}

// --- Perfect maze (0% braid): wall count must exactly match the formula ---
for (const [name, { width, height }] of Object.entries(MAZE_SIZES)) {
  const maze = generateMaze(width, height, { braidPercent: 0, seed: 12345 });
  check(
    `${name} (${width}x${height}) perfect maze wall count matches formula`,
    wallCount(maze) === maxWallCount(width, height),
  );
  check(`${name} perfect maze is fully connected`, isFullyConnected(width, height, maze));
}

// --- Connectivity holds at every braid percentage, and applying more braid
// to the SAME base maze only ever removes walls (never adds them back) ---
const sizes = [16, 24, 32];
for (const size of sizes) {
  const baseMaze = generateMaze(size, size, { braidPercent: 0, seed: 999 });
  let prevWalls = maxWallCount(size, size) + 1;

  for (const percent of [0, 5, 15, 35, 60, 100]) {
    const maze = cloneMaze(baseMaze);
    braid(maze, percent, mulberry32(777));
    const walls = wallCount(maze);
    check(`${size}x${size} braid=${percent}% stays fully connected`, isFullyConnected(size, size, maze));
    check(`${size}x${size} braid=${percent}% wall count <= previous tier`, walls <= prevWalls);
    prevWalls = walls;
  }
}

// --- Same seed => identical maze (reproducibility) ---
const mazeA = generateMaze(16, 16, { braidPercent: 15, seed: 42 });
const mazeB = generateMaze(16, 16, { braidPercent: 15, seed: 42 });
check("same seed produces identical maze", mazeA.cells.join(",") === mazeB.cells.join(","));

const mazeC = generateMaze(16, 16, { braidPercent: 15, seed: 43 });
check("different seed produces a different maze", mazeA.cells.join(",") !== mazeC.cells.join(","));

// --- Classic Micromouse maze: 16x16, corner start walled on 3 sides (degree 1) ---
for (let i = 0; i < 20; i++) {
  const classic = generateClassicMaze(1000 + i);
  const startDegree = ALL_DIRECTIONS.filter((dir) => isOpen(classic, 0, 0, dir)).length;
  check(`classic maze #${i} is 16x16`, classic.width === 16 && classic.height === 16);
  check(`classic maze #${i} start cell has exactly one opening`, startDegree === 1);
  check(`classic maze #${i} is fully connected`, isFullyConnected(16, 16, classic));
}

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
