/**
 * Two families of maze solver, matching the real distinction that matters
 * for a Micromouse-style demo:
 *
 * - "God mode" (`solveGodMode`) — BFS, A*, DFS, and Flood Fill run against
 *   the fully-known maze, the way a graph-search algorithm normally
 *   assumes its input. Useful for comparison, but not how a real mouse
 *   operates.
 * - "Blind mode" (`solveBlindMode`) — Flood Fill and Wall-Follower only see
 *   the walls of the cell they're currently standing in (simulating a real
 *   sensor reading), have to explore to build their own map, and only
 *   attempt a timed "speed run" once they've reached the goal at least
 *   once — the actual two-phase structure real Micromouse competitions
 *   use. The graph-search algorithms (BFS, A-star, DFS) are deliberately
 *   NOT offered here: faking blind exploration with an algorithm that
 *   secretly already knows the answer would be exactly the kind of
 *   illegitimate shortcut this project exists to avoid.
 */

import {
  ALL_DIRECTIONS,
  cellIndex,
  type Direction,
  type Maze,
  NORTH,
  EAST,
  SOUTH,
  WEST,
} from "./maze-generator";

export interface Cell {
  x: number;
  y: number;
}

export interface SolveResult {
  path: Cell[];
  exploredOrder: Cell[];
  nodesExplored: number;
}

export type GodAlgorithm = "bfs" | "astar" | "dfs" | "floodfill";
export type BlindAlgorithm = "floodfill" | "wallfollower";

const OPPOSITE: Record<Direction, Direction> = {
  [NORTH]: SOUTH,
  [SOUTH]: NORTH,
  [EAST]: WEST,
  [WEST]: EAST,
};

const DX: Record<Direction, number> = { [NORTH]: 0, [SOUTH]: 0, [EAST]: 1, [WEST]: -1 };
const DY: Record<Direction, number> = { [NORTH]: -1, [SOUTH]: 1, [EAST]: 0, [WEST]: 0 };

function neighborsOf(maze: Maze, cell: Cell): { dir: Direction; cell: Cell }[] {
  const idx = cellIndex(maze, cell.x, cell.y);
  const bits = maze.cells[idx];
  const result: { dir: Direction; cell: Cell }[] = [];
  for (const dir of ALL_DIRECTIONS) {
    if ((bits & dir) === 0) continue;
    result.push({ dir, cell: { x: cell.x + DX[dir], y: cell.y + DY[dir] } });
  }
  return result;
}

function key(cell: Cell): number {
  return cell.y * 100000 + cell.x;
}

function reconstructPath(cameFrom: Map<number, Cell>, start: Cell, goal: Cell): Cell[] {
  const path: Cell[] = [goal];
  let cur = goal;
  while (key(cur) !== key(start)) {
    const prev = cameFrom.get(key(cur));
    if (!prev) break;
    path.push(prev);
    cur = prev;
  }
  return path.reverse();
}

// --- A minimal binary min-heap for A* ---
class MinHeap<T> {
  private items: { priority: number; value: T }[] = [];

  push(priority: number, value: T) {
    this.items.push({ priority, value });
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.items[parent].priority <= this.items[i].priority) break;
      [this.items[parent], this.items[i]] = [this.items[i], this.items[parent]];
      i = parent;
    }
  }

  pop(): T | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const last = this.items.pop() as { priority: number; value: T };
    if (this.items.length > 0) {
      this.items[0] = last;
      let i = 0;
      for (;;) {
        const left = i * 2 + 1;
        const right = i * 2 + 2;
        let smallest = i;
        if (left < this.items.length && this.items[left].priority < this.items[smallest].priority) smallest = left;
        if (right < this.items.length && this.items[right].priority < this.items[smallest].priority) smallest = right;
        if (smallest === i) break;
        [this.items[smallest], this.items[i]] = [this.items[i], this.items[smallest]];
        i = smallest;
      }
    }
    return top.value;
  }

  get size() {
    return this.items.length;
  }
}

function bfsFrom(maze: Maze, source: Cell): { dist: Map<number, number>; order: Cell[] } {
  const dist = new Map<number, number>();
  const order: Cell[] = [];
  dist.set(key(source), 0);
  const queue: Cell[] = [source];
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    order.push(cur);
    for (const { cell: next } of neighborsOf(maze, cur)) {
      if (dist.has(key(next))) continue;
      dist.set(key(next), (dist.get(key(cur)) as number) + 1);
      queue.push(next);
    }
  }
  return { dist, order };
}

function solveBFS(maze: Maze, start: Cell, goal: Cell): SolveResult {
  const cameFrom = new Map<number, Cell>();
  const visited = new Set<number>([key(start)]);
  const order: Cell[] = [];
  const queue: Cell[] = [start];
  let head = 0;

  while (head < queue.length) {
    const cur = queue[head++];
    order.push(cur);
    if (cur.x === goal.x && cur.y === goal.y) break;
    for (const { cell: next } of neighborsOf(maze, cur)) {
      if (visited.has(key(next))) continue;
      visited.add(key(next));
      cameFrom.set(key(next), cur);
      queue.push(next);
    }
  }

  return { path: reconstructPath(cameFrom, start, goal), exploredOrder: order, nodesExplored: order.length };
}

function solveDFS(maze: Maze, start: Cell, goal: Cell): SolveResult {
  const cameFrom = new Map<number, Cell>();
  const visited = new Set<number>([key(start)]);
  const order: Cell[] = [];
  const stack: Cell[] = [start];

  while (stack.length > 0) {
    const cur = stack.pop() as Cell;
    order.push(cur);
    if (cur.x === goal.x && cur.y === goal.y) break;
    for (const { cell: next } of neighborsOf(maze, cur)) {
      if (visited.has(key(next))) continue;
      visited.add(key(next));
      cameFrom.set(key(next), cur);
      stack.push(next);
    }
  }

  return { path: reconstructPath(cameFrom, start, goal), exploredOrder: order, nodesExplored: order.length };
}

function solveAStar(maze: Maze, start: Cell, goal: Cell): SolveResult {
  const manhattan = (c: Cell) => Math.abs(c.x - goal.x) + Math.abs(c.y - goal.y);
  const gScore = new Map<number, number>([[key(start), 0]]);
  const cameFrom = new Map<number, Cell>();
  const closed = new Set<number>();
  const order: Cell[] = [];

  const open = new MinHeap<Cell>();
  open.push(manhattan(start), start);

  while (open.size > 0) {
    const cur = open.pop() as Cell;
    if (closed.has(key(cur))) continue;
    closed.add(key(cur));
    order.push(cur);
    if (cur.x === goal.x && cur.y === goal.y) break;

    for (const { cell: next } of neighborsOf(maze, cur)) {
      const tentativeG = (gScore.get(key(cur)) as number) + 1;
      if (gScore.has(key(next)) && (gScore.get(key(next)) as number) <= tentativeG) continue;
      gScore.set(key(next), tentativeG);
      cameFrom.set(key(next), cur);
      open.push(tentativeG + manhattan(next), next);
    }
  }

  return { path: reconstructPath(cameFrom, start, goal), exploredOrder: order, nodesExplored: order.length };
}

function solveFloodFillGod(maze: Maze, start: Cell, goal: Cell): SolveResult {
  const { dist, order } = bfsFrom(maze, goal);
  const path: Cell[] = [start];
  let cur = start;

  while (!(cur.x === goal.x && cur.y === goal.y)) {
    const options = neighborsOf(maze, cur)
      .map(({ cell }) => ({ cell, d: dist.get(key(cell)) }))
      .filter((o): o is { cell: Cell; d: number } => o.d !== undefined);
    if (options.length === 0) break; // unreachable — shouldn't happen, maze is always connected
    options.sort((a, b) => a.d - b.d);
    cur = options[0].cell;
    path.push(cur);
  }

  return { path, exploredOrder: order, nodesExplored: order.length };
}

export function solveGodMode(maze: Maze, start: Cell, goal: Cell, algorithm: GodAlgorithm): SolveResult {
  switch (algorithm) {
    case "bfs":
      return solveBFS(maze, start, goal);
    case "dfs":
      return solveDFS(maze, start, goal);
    case "astar":
      return solveAStar(maze, start, goal);
    case "floodfill":
      return solveFloodFillGod(maze, start, goal);
  }
}

// --- Blind mode ---

export interface BlindSolveResult {
  explorePath: Cell[];
  speedRunPath: Cell[];
  exploreSteps: number;
  speedRunSteps: number;
  reachedGoal: boolean;
}

function trimLoops(cells: Cell[]): Cell[] {
  const lastSeenAt = new Map<number, number>();
  const out: Cell[] = [];

  for (const cell of cells) {
    const k = key(cell);
    const seenAt = lastSeenAt.get(k);
    if (seenAt !== undefined) {
      out.length = seenAt + 1;
      for (const [otherKey, otherIndex] of lastSeenAt) {
        if (otherIndex > seenAt) lastSeenAt.delete(otherKey);
      }
    } else {
      out.push(cell);
      lastSeenAt.set(k, out.length - 1);
    }
  }

  return out;
}

function distanceFieldFromKnowledge(
  maze: Maze,
  goal: Cell,
  sensed: Uint8Array,
  knownWalls: Uint8Array,
): Int32Array {
  const dist = new Int32Array(maze.width * maze.height).fill(-1);
  const goalIdx = cellIndex(maze, goal.x, goal.y);
  dist[goalIdx] = 0;
  const queue: number[] = [goalIdx];
  let head = 0;

  while (head < queue.length) {
    const idx = queue[head++];
    const x = idx % maze.width;
    const y = Math.floor(idx / maze.width);

    for (const dir of ALL_DIRECTIONS) {
      const nx = x + DX[dir];
      const ny = y + DY[dir];
      if (nx < 0 || nx >= maze.width || ny < 0 || ny >= maze.height) continue;
      const nIdx = cellIndex(maze, nx, ny);
      if (dist[nIdx] !== -1) continue;

      const edgeOpen = sensed[idx]
        ? (knownWalls[idx] & dir) !== 0
        : sensed[nIdx]
          ? (knownWalls[nIdx] & OPPOSITE[dir]) !== 0
          : true; // neither side sensed yet — optimistic, matches real flood fill

      if (!edgeOpen) continue;
      dist[nIdx] = dist[idx] + 1;
      queue.push(nIdx);
    }
  }

  return dist;
}

function solveFloodFillBlind(maze: Maze, start: Cell, goal: Cell, stepBudget: number): BlindSolveResult {
  const sensed = new Uint8Array(maze.width * maze.height);
  const knownWalls = new Uint8Array(maze.width * maze.height);

  function sense(cell: Cell) {
    const idx = cellIndex(maze, cell.x, cell.y);
    if (!sensed[idx]) {
      sensed[idx] = 1;
      knownWalls[idx] = maze.cells[idx];
    }
  }

  let cur = start;
  sense(cur);
  const explorePath: Cell[] = [cur];
  let reachedGoal = false;

  for (let step = 0; step < stepBudget; step++) {
    if (cur.x === goal.x && cur.y === goal.y) {
      reachedGoal = true;
      break;
    }

    const dist = distanceFieldFromKnowledge(maze, goal, sensed, knownWalls);
    const idx = cellIndex(maze, cur.x, cur.y);
    const options = ALL_DIRECTIONS.filter((dir) => (knownWalls[idx] & dir) !== 0).map((dir) => ({
      cell: { x: cur.x + DX[dir], y: cur.y + DY[dir] },
    }));
    if (options.length === 0) break;

    let best = options[0].cell;
    let bestDist = dist[cellIndex(maze, best.x, best.y)];
    for (const opt of options.slice(1)) {
      const d = dist[cellIndex(maze, opt.cell.x, opt.cell.y)];
      if (d !== -1 && (bestDist === -1 || d < bestDist)) {
        best = opt.cell;
        bestDist = d;
      }
    }

    cur = best;
    sense(cur);
    explorePath.push(cur);
  }

  if (cur.x === goal.x && cur.y === goal.y) reachedGoal = true;

  const speedRunPath = reachedGoal ? trimLoops(explorePath) : [];
  return {
    explorePath,
    speedRunPath,
    exploreSteps: explorePath.length - 1,
    speedRunSteps: Math.max(0, speedRunPath.length - 1),
    reachedGoal,
  };
}

const CLOCKWISE: Direction[] = [NORTH, EAST, SOUTH, WEST];

function rotate(dir: Direction, steps: number): Direction {
  const i = CLOCKWISE.indexOf(dir);
  return CLOCKWISE[(i + steps + 4) % 4];
}

function solveWallFollower(maze: Maze, start: Cell, goal: Cell, stepBudget: number): BlindSolveResult {
  const idx0 = cellIndex(maze, start.x, start.y);
  const startOpenDirs = ALL_DIRECTIONS.filter((dir) => (maze.cells[idx0] & dir) !== 0);
  let facing: Direction = startOpenDirs[0] ?? NORTH;

  let cur = start;
  const explorePath: Cell[] = [cur];
  let reachedGoal = cur.x === goal.x && cur.y === goal.y;

  for (let step = 0; step < stepBudget && !reachedGoal; step++) {
    const idx = cellIndex(maze, cur.x, cur.y);
    const bits = maze.cells[idx];

    // Priority: right, straight, left, back — the right-hand rule.
    const tryOrder: Direction[] = [rotate(facing, 1), facing, rotate(facing, -1), rotate(facing, 2)];
    const moveDir = tryOrder.find((dir) => (bits & dir) !== 0);
    if (!moveDir) break; // fully enclosed cell — shouldn't happen in a connected maze

    facing = moveDir;
    cur = { x: cur.x + DX[moveDir], y: cur.y + DY[moveDir] };
    explorePath.push(cur);
    if (cur.x === goal.x && cur.y === goal.y) reachedGoal = true;
  }

  const speedRunPath = reachedGoal ? trimLoops(explorePath) : [];
  return {
    explorePath,
    speedRunPath,
    exploreSteps: explorePath.length - 1,
    speedRunSteps: Math.max(0, speedRunPath.length - 1),
    reachedGoal,
  };
}

export function solveBlindMode(maze: Maze, start: Cell, goal: Cell, algorithm: BlindAlgorithm): BlindSolveResult {
  const stepBudget = maze.width * maze.height * 20;
  return algorithm === "floodfill"
    ? solveFloodFillBlind(maze, start, goal, stepBudget)
    : solveWallFollower(maze, start, goal, stepBudget);
}
