import { generateMaze, generateClassicMaze, isOpen, ALL_DIRECTIONS, type Maze } from "./maze-generator";
import { solveGodMode, solveBlindMode, type Cell, type GodAlgorithm } from "./maze-solvers";

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

function isAdjacentAndOpen(maze: Maze, a: Cell, b: Cell): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  for (const dir of ALL_DIRECTIONS) {
    const ddx = dir === 4 ? 1 : dir === 8 ? -1 : 0;
    const ddy = dir === 1 ? -1 : dir === 2 ? 1 : 0;
    if (ddx === dx && ddy === dy) return isOpen(maze, a.x, a.y, dir);
  }
  return false;
}

function isValidPath(maze: Maze, path: Cell[], start: Cell, goal: Cell): boolean {
  if (path.length === 0) return false;
  if (path[0].x !== start.x || path[0].y !== start.y) return false;
  const last = path[path.length - 1];
  if (last.x !== goal.x || last.y !== goal.y) return false;
  for (let i = 1; i < path.length; i++) {
    if (!isAdjacentAndOpen(maze, path[i - 1], path[i])) return false;
  }
  return true;
}

// --- God-mode solvers on a variety of mazes ---
const godAlgorithms: GodAlgorithm[] = ["bfs", "astar", "dfs", "floodfill"];
for (const size of [16, 24, 32]) {
  for (const braidPercent of [0, 15, 35]) {
    const maze = generateMaze(size, size, { braidPercent, seed: size * 1000 + braidPercent });
    const start: Cell = { x: 0, y: 0 };
    const goal: Cell = { x: size - 1, y: size - 1 };

    const results = new Map<GodAlgorithm, ReturnType<typeof solveGodMode>>();
    for (const algo of godAlgorithms) {
      const result = solveGodMode(maze, start, goal, algo);
      results.set(algo, result);
      check(
        `${size}x${size} braid=${braidPercent}% ${algo} produces a valid connected path`,
        isValidPath(maze, result.path, start, goal),
      );
    }

    const bfsLen = (results.get("bfs") as ReturnType<typeof solveGodMode>).path.length;
    const astarLen = (results.get("astar") as ReturnType<typeof solveGodMode>).path.length;
    const floodLen = (results.get("floodfill") as ReturnType<typeof solveGodMode>).path.length;
    const dfsLen = (results.get("dfs") as ReturnType<typeof solveGodMode>).path.length;

    check(`${size}x${size} braid=${braidPercent}% A* matches BFS optimal length`, astarLen === bfsLen);
    check(`${size}x${size} braid=${braidPercent}% flood fill matches BFS optimal length`, floodLen === bfsLen);
    check(`${size}x${size} braid=${braidPercent}% DFS path is at least as long as optimal`, dfsLen >= bfsLen);

    const astarExplored = (results.get("astar") as ReturnType<typeof solveGodMode>).nodesExplored;
    const bfsExplored = (results.get("bfs") as ReturnType<typeof solveGodMode>).nodesExplored;
    check(
      `${size}x${size} braid=${braidPercent}% A* explores no more nodes than BFS`,
      astarExplored <= bfsExplored,
    );
  }
}

// --- Blind mode: Flood Fill must always reach the goal (maze is always connected) ---
let floodFillBlindFailures = 0;
let floodFillBlindTrials = 0;
for (const size of [16, 24, 32]) {
  for (const braidPercent of [0, 15, 35, 60]) {
    for (let trial = 0; trial < 5; trial++) {
      floodFillBlindTrials++;
      const seed = size * 10000 + braidPercent * 10 + trial;
      const maze = generateMaze(size, size, { braidPercent, seed });
      const start: Cell = { x: 0, y: 0 };
      const goal: Cell = { x: size - 1, y: size - 1 };
      const result = solveBlindMode(maze, start, goal, "floodfill");
      if (!result.reachedGoal) floodFillBlindFailures++;
      else {
        check(
          `blind flood fill speed-run path is valid (${size}x${size} braid=${braidPercent}% seed=${seed})`,
          isValidPath(maze, result.speedRunPath, start, goal),
        );
        const bfsLen = solveGodMode(maze, start, goal, "bfs").path.length;
        check(
          `blind flood fill speed-run is at least as long as true optimal (${size}x${size} braid=${braidPercent}% seed=${seed})`,
          result.speedRunPath.length >= bfsLen,
        );
      }
    }
  }
}
check("blind flood fill always reaches the goal (maze is always fully connected)", floodFillBlindFailures === 0);
console.log(`(info) blind flood fill: ${floodFillBlindTrials - floodFillBlindFailures}/${floodFillBlindTrials} reached goal`);

// --- Wall follower: must always succeed on a pure perfect maze (simply
// connected), regardless of where the goal sits — including the center,
// which is the case that actually stresses this guarantee. A corner goal
// is always on the outer boundary and can never be topologically trapped,
// so it would pass trivially and prove nothing. ---
let wallFollowerPerfectFailures = 0;
for (const size of [16, 24, 32]) {
  const center = Math.floor(size / 2);
  for (let trial = 0; trial < 10; trial++) {
    const maze = generateMaze(size, size, { braidPercent: 0, seed: size * 777 + trial });
    const start: Cell = { x: 0, y: 0 };
    const goal: Cell = { x: center, y: center };
    const result = solveBlindMode(maze, start, goal, "wallfollower");
    if (!result.reachedGoal) wallFollowerPerfectFailures++;
    else {
      check(
        `wall follower speed-run path is valid on perfect maze, center goal (${size}x${size} trial=${trial})`,
        isValidPath(maze, result.speedRunPath, start, goal),
      );
    }
  }
}
check("wall follower always succeeds on a loop-free (perfect) maze, even with a center goal", wallFollowerPerfectFailures === 0);

// --- Wall follower on braided mazes with a CENTER goal: measure, don't
// assert. Loops can enclose an interior region and trap a fixed
// hand-on-wall rule outside it — a real, well-documented limitation of the
// algorithm, not a bug in this implementation. A corner goal can't
// reproduce this (it's always on the outer boundary), so this uses the
// same center-goal setup real Micromouse mazes use. ---
for (const braidPercent of [15, 35, 60, 100]) {
  let successes = 0;
  const trials = 60;
  const center = Math.floor(24 / 2);
  for (let trial = 0; trial < trials; trial++) {
    const maze = generateMaze(24, 24, { braidPercent, seed: braidPercent * 100 + trial });
    const result = solveBlindMode(maze, { x: 0, y: 0 }, { x: center, y: center }, "wallfollower");
    if (result.reachedGoal) successes++;
  }
  console.log(`(info) wall follower success rate at braid=${braidPercent}%, center goal: ${successes}/${trials}`);
}

// --- Classic Micromouse maze, all algorithms ---
for (let i = 0; i < 5; i++) {
  const classic = generateClassicMaze(5000 + i);
  const start: Cell = { x: 0, y: 0 };
  const goal: Cell = { x: 8, y: 8 };
  for (const algo of godAlgorithms) {
    const result = solveGodMode(classic, start, goal, algo);
    check(`classic maze #${i} ${algo} produces a valid path`, isValidPath(classic, result.path, start, goal));
  }
  const flood = solveBlindMode(classic, start, goal, "floodfill");
  check(`classic maze #${i} blind flood fill reaches goal`, flood.reachedGoal);
  const wall = solveBlindMode(classic, start, goal, "wallfollower");
  check(`classic maze #${i} wall follower reaches goal (loop-free)`, wall.reachedGoal);
}

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
