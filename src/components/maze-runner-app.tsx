"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Shuffle } from "lucide-react";
import { useMazeRunner } from "@/hooks/use-maze-runner";
import { MazeCanvas } from "@/components/maze-canvas";
import { MAZE_DIFFICULTIES, MAZE_SIZES, NORTH, SOUTH, EAST, WEST } from "@/lib/maze-generator";
import type { BlindAlgorithm, GodAlgorithm } from "@/lib/maze-solvers";

const GOD_ALGORITHMS: { key: GodAlgorithm; label: string }[] = [
  { key: "bfs", label: "BFS (shortest path, brute force)" },
  { key: "astar", label: "A* (informed search)" },
  { key: "dfs", label: "DFS (not optimal — for contrast)" },
  { key: "floodfill", label: "Flood Fill (the Micromouse algorithm)" },
];

const BLIND_ALGORITHMS: { key: BlindAlgorithm; label: string }[] = [
  { key: "floodfill", label: "Flood Fill (explore, then speed run)" },
  { key: "wallfollower", label: "Wall Follower (right-hand rule)" },
];

function Pill({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-signal text-onaccent" : "border border-border text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function MazeRunnerApp() {
  const m = useMazeRunner();

  const algoResult = m.visionMode === "god" ? m.godResult : m.blindResult;
  const algoStageLabel =
    m.visionMode === "god"
      ? m.algoStage === "search"
        ? "Searching…"
        : "Walking the solved path"
      : m.algoStage === "explore"
        ? "Exploring (blind — building its own map)…"
        : "Speed run (using what it learned)";

  let animatedMouse = m.playerPos;
  let trail: { x: number; y: number }[] = [];
  let path: { x: number; y: number }[] = [];
  let revealed: Uint8Array | null = m.visionMode === "blind" ? m.manualSensed : null;

  if (m.playMode === "algorithm" && algoResult) {
    if (m.visionMode === "god" && m.godResult) {
      const list = m.algoStage === "search" ? m.godResult.exploredOrder : m.godResult.path;
      const idx = Math.min(m.algoStepIndex, list.length - 1);
      animatedMouse = list[idx] ?? m.start;
      trail = m.algoStage === "search" ? list.slice(0, idx + 1) : [];
      path = m.algoStage === "walk" ? m.godResult.path.slice(0, idx + 1) : [];
      revealed = null;
    } else if (m.visionMode === "blind" && m.blindResult) {
      const exploring = m.algoStage === "explore";
      const list = exploring ? m.blindResult.explorePath : m.blindResult.speedRunPath;
      const idx = Math.min(m.algoStepIndex, Math.max(0, list.length - 1));
      animatedMouse = list[idx] ?? m.start;
      trail = exploring ? list.slice(0, idx + 1) : [];
      path = !exploring ? list.slice(0, idx + 1) : [];

      // Fog reflects everything sensed by whichever phase has run so far.
      const sensed = new Uint8Array(m.maze.width * m.maze.height);
      const fullyExplored = exploring ? list.slice(0, idx + 1) : m.blindResult.explorePath;
      for (const cell of fullyExplored) sensed[cell.y * m.maze.width + cell.x] = 1;
      revealed = sensed;
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Micromouse homage</p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
        Maze Runner
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        A procedurally generated maze, solved by hand or by a real pathfinding
        algorithm — including Flood Fill, the same technique actual
        autonomous Micromouse robots use.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Pill active={m.classicMode} onClick={() => m.setClassicMode(!m.classicMode)}>
          Classic Micromouse (16×16, corner start, center goal)
        </Pill>
        <button
          onClick={m.regenerate}
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:border-signal/60"
        >
          <Shuffle size={14} /> New maze
        </button>
      </div>

      {!m.classicMode && (
        <div className="mt-4 flex flex-wrap gap-6">
          <div>
            <p className="mb-1.5 text-xs text-muted">Size</p>
            <div className="flex gap-2">
              {(Object.keys(MAZE_SIZES) as (keyof typeof MAZE_SIZES)[]).map((key) => (
                <Pill key={key} active={m.size === key} onClick={() => m.setSize(key)}>
                  {key[0].toUpperCase() + key.slice(1)}
                </Pill>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted">Difficulty</p>
            <div className="flex gap-2">
              {(Object.keys(MAZE_DIFFICULTIES) as (keyof typeof MAZE_DIFFICULTIES)[]).map((key) => (
                <Pill key={key} active={m.difficulty === key} onClick={() => m.setDifficulty(key)}>
                  {key[0].toUpperCase() + key.slice(1)}
                </Pill>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-6">
        <div>
          <p className="mb-1.5 text-xs text-muted">Play mode</p>
          <div className="flex gap-2">
            <Pill active={m.playMode === "manual"} onClick={() => m.setPlayMode("manual")}>
              Manual
            </Pill>
            <Pill active={m.playMode === "algorithm"} onClick={() => m.setPlayMode("algorithm")}>
              Algorithm
            </Pill>
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs text-muted">Vision</p>
          <div className="flex gap-2">
            <Pill active={m.visionMode === "god"} onClick={() => m.setVisionMode("god")}>
              God mode (full maze visible)
            </Pill>
            <Pill active={m.visionMode === "blind"} onClick={() => m.setVisionMode("blind")}>
              Blind (sensor-only, like a real mouse)
            </Pill>
          </div>
        </div>
        {!m.classicMode && (
          <div>
            <p className="mb-1.5 text-xs text-muted">Start / goal</p>
            <div className="flex gap-2">
              <Pill active={m.pickingMode === "start"} onClick={() => m.setPickingMode("start")}>
                Set start
              </Pill>
              <Pill active={m.pickingMode === "goal"} onClick={() => m.setPickingMode("goal")}>
                Set goal
              </Pill>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <MazeCanvas
            maze={m.maze}
            start={m.start}
            goal={m.goal}
            mouse={m.playMode === "manual" ? m.playerPos : animatedMouse}
            revealed={revealed}
            trail={trail}
            path={path}
            onCellClick={m.pickCell}
            pickingActive={m.pickingMode !== null}
          />

          {m.playMode === "manual" && (
            <div className="mt-6 flex flex-col items-center gap-4">
              {m.hasWon && (
                <p className="rounded-full bg-signal/10 px-4 py-1.5 text-sm font-medium text-signal">
                  Reached the goal in {m.moveCount} moves 🎉
                </p>
              )}
              <div className="grid grid-cols-3 gap-2 sm:hidden">
                <div />
                <DPadButton onClick={() => m.move(NORTH)}>
                  <ArrowUp size={18} />
                </DPadButton>
                <div />
                <DPadButton onClick={() => m.move(WEST)}>
                  <ArrowLeft size={18} />
                </DPadButton>
                <DPadButton onClick={() => m.move(SOUTH)}>
                  <ArrowDown size={18} />
                </DPadButton>
                <DPadButton onClick={() => m.move(EAST)}>
                  <ArrowRight size={18} />
                </DPadButton>
              </div>
              <p className="hidden text-sm text-muted sm:block">Arrow keys or WASD to move.</p>
              <button
                onClick={m.resetManualPlay}
                className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
              >
                Reset to start
              </button>
            </div>
          )}
        </div>

        {m.playMode === "algorithm" && (
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs text-muted">Algorithm</p>
            <select
              value={m.visionMode === "god" ? m.godAlgorithm : m.blindAlgorithm}
              onChange={(e) =>
                m.visionMode === "god"
                  ? m.setGodAlgorithm(e.target.value as GodAlgorithm)
                  : m.setBlindAlgorithm(e.target.value as BlindAlgorithm)
              }
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
            >
              {(m.visionMode === "god" ? GOD_ALGORITHMS : BLIND_ALGORITHMS).map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label}
                </option>
              ))}
            </select>

            <div className="mt-4 flex gap-2">
              <button
                onClick={m.runAlgorithm}
                disabled={m.algoPhase === "running"}
                className="flex-1 rounded-full bg-signal px-4 py-2 text-sm font-medium text-onaccent disabled:opacity-50"
              >
                Run
              </button>
              <button
                onClick={m.resetAlgorithm}
                className="rounded-full border border-border px-4 py-2 text-sm text-foreground"
              >
                Reset
              </button>
            </div>

            {m.algoPhase !== "idle" && (
              <p className="mt-4 text-sm text-muted">{m.algoPhase === "done" ? "Done." : algoStageLabel}</p>
            )}

            {m.visionMode === "god" && m.godResult && (
              <dl className="mt-4 space-y-1 text-sm">
                <Stat label="Cells explored" value={m.godResult.nodesExplored} />
                <Stat label="Path length" value={m.godResult.path.length - 1} />
              </dl>
            )}

            {m.visionMode === "blind" && m.blindResult && (
              <dl className="mt-4 space-y-1 text-sm">
                <Stat label="Explore steps" value={m.blindResult.exploreSteps} />
                <Stat
                  label="Speed-run steps"
                  value={m.blindResult.reachedGoal ? m.blindResult.speedRunSteps : "—"}
                />
                {!m.blindResult.reachedGoal && (
                  <p className="pt-2 text-xs text-ember">
                    Didn&apos;t reach the goal within the step budget — a real,
                    documented limitation of hand-on-wall following once loops
                    are in the maze. Try Flood Fill instead, or lower the
                    difficulty.
                  </p>
                )}
              </dl>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DPadButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground active:bg-surface-muted"
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
