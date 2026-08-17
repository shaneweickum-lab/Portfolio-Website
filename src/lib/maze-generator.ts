/**
 * Perfect-maze generation (randomized iterative recursive backtracker) plus
 * a braiding pass that opens extra passages at dead ends to create loops.
 *
 * A "perfect maze" is a spanning tree over the grid graph: exactly one path
 * between any two cells, and a fixed wall count determined entirely by grid
 * size — (width-1)*(height-1) internal walls remain, no more, no fewer.
 * There is no way to add walls beyond that while keeping every cell
 * reachable. Braiding is the inverse: starting from that maximum-wall
 * perfect maze and removing some percentage of dead ends by opening one
 * more passage from them, which only ever adds connectivity — so a maze
 * generated at any braid percentage is guaranteed solvable.
 */

import { mulberry32 } from "./prng";

export const NORTH = 1;
export const SOUTH = 2;
export const EAST = 4;
export const WEST = 8;

export type Direction = typeof NORTH | typeof SOUTH | typeof EAST | typeof WEST;

export const ALL_DIRECTIONS: Direction[] = [NORTH, SOUTH, EAST, WEST];

const OPPOSITE: Record<Direction, Direction> = {
  [NORTH]: SOUTH,
  [SOUTH]: NORTH,
  [EAST]: WEST,
  [WEST]: EAST,
};

const DX: Record<Direction, number> = { [NORTH]: 0, [SOUTH]: 0, [EAST]: 1, [WEST]: -1 };
const DY: Record<Direction, number> = { [NORTH]: -1, [SOUTH]: 1, [EAST]: 0, [WEST]: 0 };

export interface Maze {
  width: number;
  height: number;
  /** cells[y * width + x] is a bitmask of OPEN passages from that cell. */
  cells: Uint8Array;
}

export interface MazeSizePreset {
  width: number;
  height: number;
  label: string;
}

export const MAZE_SIZES: Record<"small" | "medium" | "large", MazeSizePreset> = {
  small: { width: 16, height: 16, label: "Small — 16×16 (classic Micromouse spec)" },
  medium: { width: 24, height: 24, label: "Medium — 24×24" },
  large: { width: 32, height: 32, label: "Large — 32×32" },
};

export interface MazeDifficultyPreset {
  braidPercent: number;
  label: string;
}

export const MAZE_DIFFICULTIES: Record<"easy" | "medium" | "hard" | "expert", MazeDifficultyPreset> = {
  easy: { braidPercent: 35, label: "Easy" },
  medium: { braidPercent: 15, label: "Medium" },
  hard: { braidPercent: 5, label: "Hard" },
  expert: { braidPercent: 0, label: "Expert" },
};

export function cellIndex(maze: Pick<Maze, "width">, x: number, y: number): number {
  return y * maze.width + x;
}

export function inBounds(maze: Pick<Maze, "width" | "height">, x: number, y: number): boolean {
  return x >= 0 && x < maze.width && y >= 0 && y < maze.height;
}

export function isOpen(maze: Maze, x: number, y: number, dir: Direction): boolean {
  return (maze.cells[cellIndex(maze, x, y)] & dir) !== 0;
}

function popcount4(n: number): number {
  return ((n & 1) !== 0 ? 1 : 0) + ((n & 2) !== 0 ? 1 : 0) + ((n & 4) !== 0 ? 1 : 0) + ((n & 8) !== 0 ? 1 : 0);
}

/** Total internal walls a maze of this size could ever have (0% braid / a perfect maze). */
export function maxWallCount(width: number, height: number): number {
  return (width - 1) * (height - 1);
}

/** Internal walls actually standing in this maze right now. */
export function wallCount(maze: Maze): number {
  const totalInternalEdges = maze.height * (maze.width - 1) + maze.width * (maze.height - 1);
  let openPassageInstances = 0;
  for (let i = 0; i < maze.cells.length; i++) openPassageInstances += popcount4(maze.cells[i]);
  const openPassages = openPassageInstances / 2;
  return totalInternalEdges - openPassages;
}

function carve(maze: Maze, x: number, y: number, dir: Direction) {
  const nx = x + DX[dir];
  const ny = y + DY[dir];
  maze.cells[cellIndex(maze, x, y)] |= dir;
  maze.cells[cellIndex(maze, nx, ny)] |= OPPOSITE[dir];
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function carvePerfectMaze(width: number, height: number, rng: () => number, startX: number, startY: number): Maze {
  const maze: Maze = { width, height, cells: new Uint8Array(width * height) };
  const visited = new Uint8Array(width * height);
  const stack: number[] = [];

  let cx = startX;
  let cy = startY;
  visited[cellIndex(maze, cx, cy)] = 1;
  stack.push(cellIndex(maze, cx, cy));

  while (stack.length > 0) {
    cx = stack[stack.length - 1] % width;
    cy = Math.floor(stack[stack.length - 1] / width);

    const candidates = shuffle([...ALL_DIRECTIONS], rng).filter((dir) => {
      const nx = cx + DX[dir];
      const ny = cy + DY[dir];
      return inBounds(maze, nx, ny) && visited[cellIndex(maze, nx, ny)] === 0;
    });

    if (candidates.length === 0) {
      stack.pop();
      continue;
    }

    const dir = candidates[0];
    const nx = cx + DX[dir];
    const ny = cy + DY[dir];
    carve(maze, cx, cy, dir);
    visited[cellIndex(maze, nx, ny)] = 1;
    stack.push(cellIndex(maze, nx, ny));
  }

  return maze;
}

export function cloneMaze(maze: Maze): Maze {
  return { width: maze.width, height: maze.height, cells: maze.cells.slice() };
}

export function braid(maze: Maze, braidPercent: number, rng: () => number) {
  if (braidPercent <= 0) return;

  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      const idx = cellIndex(maze, x, y);
      if (popcount4(maze.cells[idx]) !== 1) continue; // not a dead end
      if (rng() * 100 >= braidPercent) continue;

      const closedWithNeighbor = ALL_DIRECTIONS.filter((dir) => {
        const nx = x + DX[dir];
        const ny = y + DY[dir];
        return inBounds(maze, nx, ny) && (maze.cells[idx] & dir) === 0;
      });
      if (closedWithNeighbor.length === 0) continue; // corner dead end, nothing to open

      const dir = closedWithNeighbor[Math.floor(rng() * closedWithNeighbor.length)];
      carve(maze, x, y, dir);
    }
  }
}

export function generateMaze(
  width: number,
  height: number,
  options: { braidPercent?: number; seed?: number; startX?: number; startY?: number } = {},
): Maze {
  const rng = mulberry32(options.seed ?? Date.now() ^ (Math.random() * 0xffffffff));
  const maze = carvePerfectMaze(width, height, rng, options.startX ?? 0, options.startY ?? 0);
  braid(maze, options.braidPercent ?? 0, rng);
  return maze;
}

const CLASSIC_START_RETRY_LIMIT = 50;

/**
 * The real Micromouse rule: the start cell is walled on three sides (a
 * single opening). A generated corner naturally ends up that way most of
 * the time but not always, so this retries generation (cheap — a 16x16
 * maze generates in well under a millisecond) until it does, falling back
 * to whatever it last generated if the cap is hit rather than looping
 * forever.
 */
export function generateClassicMaze(seed?: number): Maze {
  const baseSeed = seed ?? Date.now() ^ (Math.random() * 0xffffffff);
  let maze: Maze | null = null;

  for (let attempt = 0; attempt < CLASSIC_START_RETRY_LIMIT; attempt++) {
    maze = generateMaze(16, 16, { braidPercent: 0, seed: (baseSeed + attempt) >>> 0, startX: 0, startY: 0 });
    if (popcount4(maze.cells[cellIndex(maze, 0, 0)]) === 1) break;
  }

  return maze as Maze;
}
