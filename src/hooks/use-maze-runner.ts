import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  cellIndex,
  generateClassicMaze,
  generateMaze,
  MAZE_DIFFICULTIES,
  MAZE_SIZES,
  NORTH,
  SOUTH,
  EAST,
  WEST,
  type Direction,
  type Maze,
} from "@/lib/maze-generator";
import { solveBlindMode, solveGodMode, type BlindAlgorithm, type Cell, type GodAlgorithm } from "@/lib/maze-solvers";

export type SizeKey = keyof typeof MAZE_SIZES;
export type DifficultyKey = keyof typeof MAZE_DIFFICULTIES;
export type VisionMode = "blind" | "god";
export type PlayMode = "manual" | "algorithm";

const DX: Record<Direction, number> = { [NORTH]: 0, [SOUTH]: 0, [EAST]: 1, [WEST]: -1 };
const DY: Record<Direction, number> = { [NORTH]: -1, [SOUTH]: 1, [EAST]: 0, [WEST]: 0 };
const KEY_TO_DIR: Record<string, Direction> = {
  ArrowUp: NORTH,
  ArrowDown: SOUTH,
  ArrowRight: EAST,
  ArrowLeft: WEST,
  w: NORTH,
  s: SOUTH,
  d: EAST,
  a: WEST,
};

const EXPLORE_STEP_MS = 45;
const SPEEDRUN_STEP_MS = 18;
const GOD_SEARCH_STEP_MS = 12;
const GOD_WALK_STEP_MS = 45;

function defaultStartGoal(width: number, height: number): { start: Cell; goal: Cell } {
  return { start: { x: 0, y: 0 }, goal: { x: width - 1, y: height - 1 } };
}

export function useMazeRunner() {
  const [size, setSize] = useState<SizeKey>("small");
  const [difficulty, setDifficulty] = useState<DifficultyKey>("medium");
  const [classicMode, setClassicMode] = useState(false);
  const [seed, setSeed] = useState(() => Date.now());

  const maze: Maze = useMemo(() => {
    if (classicMode) return generateClassicMaze(seed);
    const preset = MAZE_SIZES[size];
    const braidPercent = MAZE_DIFFICULTIES[difficulty].braidPercent;
    return generateMaze(preset.width, preset.height, { braidPercent, seed });
  }, [classicMode, size, difficulty, seed]);

  const classicGoal = useMemo(() => ({ x: Math.floor(maze.width / 2), y: Math.floor(maze.height / 2) }), [maze]);

  const [start, setStart] = useState<Cell>(() => defaultStartGoal(maze.width, maze.height).start);
  const [goal, setGoal] = useState<Cell>(() => defaultStartGoal(maze.width, maze.height).goal);
  const [pickingMode, setPickingMode] = useState<"start" | "goal" | null>(null);

  const [playMode, setPlayMode] = useState<PlayMode>("manual");
  const [visionMode, setVisionMode] = useState<VisionMode>("god");

  // --- Manual play ---
  const [playerPos, setPlayerPos] = useState<Cell>(start);
  const [moveCount, setMoveCount] = useState(0);
  const [manualSensed, setManualSensed] = useState<Uint8Array>(() => new Uint8Array(maze.width * maze.height));

  function freshSensedMask(atCell: Cell): Uint8Array {
    const sensed = new Uint8Array(maze.width * maze.height);
    sensed[cellIndex(maze, atCell.x, atCell.y)] = 1;
    return sensed;
  }

  // Whenever the maze itself changes, reset start/goal/manual-play state to
  // sane defaults for its new shape, all in one pass using freshly computed
  // local values (not the not-yet-updated state variables) so nothing ends
  // up stale for a render. Adjusted directly during render (React's
  // documented pattern for "state that should reset when a dependency
  // changes") rather than in an effect, since this needs to be settled
  // before the new maze's first paint, not one tick after.
  const [mazeRef, setMazeRef] = useState(maze);
  if (mazeRef !== maze) {
    setMazeRef(maze);
    const newStart = classicMode ? { x: 0, y: 0 } : defaultStartGoal(maze.width, maze.height).start;
    const newGoal = classicMode ? classicGoal : defaultStartGoal(maze.width, maze.height).goal;
    setStart(newStart);
    setGoal(newGoal);
    setPickingMode(null);
    setPlayerPos(newStart);
    setMoveCount(0);
    setManualSensed(freshSensedMask(newStart));
  }

  // A user picking a new start cell should also snap manual play back to it.
  const [startRef, setStartRef] = useState(start);
  if (startRef !== start) {
    setStartRef(start);
    setPlayerPos(start);
    setMoveCount(0);
    setManualSensed(freshSensedMask(start));
  }

  const senseManual = useCallback(
    (cell: Cell) => {
      const idx = cellIndex(maze, cell.x, cell.y);
      setManualSensed((prev) => {
        if (prev[idx]) return prev;
        const next = prev.slice();
        next[idx] = 1;
        return next;
      });
    },
    [maze],
  );

  const hasWon = playerPos.x === goal.x && playerPos.y === goal.y;

  const move = useCallback(
    (dir: Direction) => {
      if (hasWon || playMode !== "manual" || pickingMode) return;
      const idx = cellIndex(maze, playerPos.x, playerPos.y);
      if ((maze.cells[idx] & dir) === 0) return;
      const next = { x: playerPos.x + DX[dir], y: playerPos.y + DY[dir] };
      setPlayerPos(next);
      setMoveCount((c) => c + 1);
      senseManual(next);
    },
    [maze, playerPos, hasWon, playMode, pickingMode, senseManual],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const dir = KEY_TO_DIR[e.key];
      if (!dir) return;
      e.preventDefault();
      move(dir);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move]);

  // --- Cell picking (start/goal) ---
  const pickCell = useCallback(
    (cell: Cell) => {
      if (!pickingMode || classicMode) return;
      if (pickingMode === "start") setStart(cell);
      else setGoal(cell);
      setPickingMode(null);
    },
    [pickingMode, classicMode],
  );

  // --- Algorithm mode ---
  const [godAlgorithm, setGodAlgorithm] = useState<GodAlgorithm>("bfs");
  const [blindAlgorithm, setBlindAlgorithm] = useState<BlindAlgorithm>("floodfill");
  const [algoPhase, setAlgoPhase] = useState<"idle" | "running" | "done">("idle");
  const [algoStage, setAlgoStage] = useState<"search" | "walk" | "explore" | "speedrun">("search");
  const [algoStepIndex, setAlgoStepIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const godResult = useMemo(
    () => (playMode === "algorithm" && visionMode === "god" ? solveGodMode(maze, start, goal, godAlgorithm) : null),
    [playMode, visionMode, maze, start, goal, godAlgorithm],
  );
  const blindResult = useMemo(
    () =>
      playMode === "algorithm" && visionMode === "blind" ? solveBlindMode(maze, start, goal, blindAlgorithm) : null,
    [playMode, visionMode, maze, start, goal, blindAlgorithm],
  );

  const stopAlgoTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  // Reset the algorithm run whenever anything about what it would solve changes.
  const algoResetKey = `${visionMode}|${godAlgorithm}|${blindAlgorithm}|${start.x},${start.y}|${goal.x},${goal.y}`;
  const [algoResetKeyRef, setAlgoResetKeyRef] = useState<{ maze: Maze; key: string }>({ maze, key: algoResetKey });
  if (algoResetKeyRef.maze !== maze || algoResetKeyRef.key !== algoResetKey) {
    setAlgoResetKeyRef({ maze, key: algoResetKey });
    // No stopAlgoTimer() here — refs can't be touched during render. Setting
    // algoPhase to "idle" makes the animation effect below re-run on the
    // next commit, and its own cleanup (which returns stopAlgoTimer) clears
    // whatever timer was pending before that happens.
    setAlgoPhase("idle");
    setAlgoStepIndex(0);
    setAlgoStage(visionMode === "god" ? "search" : "explore");
  }

  const resetAlgorithm = useCallback(() => {
    stopAlgoTimer();
    setAlgoPhase("idle");
    setAlgoStepIndex(0);
    setAlgoStage(visionMode === "god" ? "search" : "explore");
  }, [stopAlgoTimer, visionMode]);

  const runAlgorithm = useCallback(() => {
    stopAlgoTimer();
    setAlgoStepIndex(0);
    setAlgoStage(visionMode === "god" ? "search" : "explore");
    setAlgoPhase("running");
  }, [stopAlgoTimer, visionMode]);

  // Drives the step-by-step animation. Every state transition happens
  // inside the setTimeout callback (an external-timer subscription), never
  // synchronously in the effect body itself.
  useEffect(() => {
    if (algoPhase !== "running") return;

    if (visionMode === "god") {
      const result = godResult;
      if (!result) return;
      const searching = algoStage === "search";
      const list = searching ? result.exploredOrder : result.path;
      const atEnd = algoStepIndex >= list.length - 1;
      const delay = atEnd ? (searching ? 200 : 0) : searching ? GOD_SEARCH_STEP_MS : GOD_WALK_STEP_MS;

      timerRef.current = setTimeout(() => {
        if (!atEnd) {
          setAlgoStepIndex((i) => i + 1);
        } else if (searching) {
          setAlgoStage("walk");
          setAlgoStepIndex(0);
        } else {
          setAlgoPhase("done");
        }
      }, delay);
    } else {
      const result = blindResult;
      if (!result) return;
      const exploring = algoStage === "explore";
      const list = exploring ? result.explorePath : result.speedRunPath;
      const atEnd = list.length === 0 || algoStepIndex >= list.length - 1;
      const delay = atEnd ? (exploring ? 500 : 0) : exploring ? EXPLORE_STEP_MS : SPEEDRUN_STEP_MS;

      timerRef.current = setTimeout(() => {
        if (!atEnd) {
          setAlgoStepIndex((i) => i + 1);
        } else if (exploring && result.reachedGoal) {
          setAlgoStage("speedrun");
          setAlgoStepIndex(0);
        } else {
          setAlgoPhase("done");
        }
      }, delay);
    }

    return stopAlgoTimer;
  }, [algoPhase, algoStage, algoStepIndex, visionMode, godResult, blindResult, stopAlgoTimer]);

  useEffect(() => stopAlgoTimer, [stopAlgoTimer]);

  const regenerate = useCallback(() => setSeed(Date.now()), []);

  return {
    size,
    setSize,
    difficulty,
    setDifficulty,
    classicMode,
    setClassicMode,
    maze,
    start,
    goal,
    pickingMode,
    setPickingMode,
    pickCell,
    regenerate,

    playMode,
    setPlayMode,
    visionMode,
    setVisionMode,

    playerPos,
    moveCount,
    manualSensed,
    hasWon,
    move,
    resetManualPlay: () => {
      setPlayerPos(start);
      setMoveCount(0);
      setManualSensed(freshSensedMask(start));
    },

    godAlgorithm,
    setGodAlgorithm,
    blindAlgorithm,
    setBlindAlgorithm,
    algoPhase,
    algoStage,
    algoStepIndex,
    godResult,
    blindResult,
    runAlgorithm,
    resetAlgorithm,
  };
}
