"use client";

import { useEffect, useRef } from "react";
import { cellIndex, NORTH, SOUTH, EAST, WEST, type Maze } from "@/lib/maze-generator";
import type { Cell } from "@/lib/maze-solvers";
import { useIsDarkMode } from "@/hooks/use-is-dark-mode";

const CANVAS_PX = 640;

export interface MazeCanvasProps {
  maze: Maze;
  start: Cell;
  goal: Cell;
  mouse: Cell;
  /** null = fully visible (god mode). Otherwise a per-cell sensed mask (blind mode / fog of war). */
  revealed: Uint8Array | null;
  trail?: Cell[];
  path?: Cell[];
  onCellClick?: (cell: Cell) => void;
  pickingActive?: boolean;
}

function readCssColor(varName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

export function MazeCanvas({ maze, start, goal, mouse, revealed, trail, path, onCellClick, pickingActive }: MazeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDarkMode = useIsDarkMode();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const cellPx = CANVAS_PX / maze.width;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== CANVAS_PX * dpr) {
      canvas.width = CANVAS_PX * dpr;
      canvas.height = CANVAS_PX * dpr;
      ctx.scale(dpr, dpr);
    }

    const surface = readCssColor("--color-surface", "#151515");
    const surfaceMuted = readCssColor("--color-surface-muted", "#1f1f1f");
    const wallColor = readCssColor("--color-foreground", "#000000");
    const signal = readCssColor("--color-signal", "#22d3ee");
    const ember = readCssColor("--color-ember", "#f59e0b");

    ctx.clearRect(0, 0, CANVAS_PX, CANVAS_PX);
    ctx.fillStyle = surface;
    ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);

    const isRevealed = (x: number, y: number) => !revealed || revealed[cellIndex(maze, x, y)] === 1;

    // Floor tiles: fogged cells render as a flat, unlit tile.
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        if (!isRevealed(x, y)) continue;
        ctx.fillStyle = surfaceMuted;
        ctx.fillRect(x * cellPx + 1, y * cellPx + 1, cellPx - 2, cellPx - 2);
      }
    }

    // Trail (lightly tint visited/explored cells).
    if (trail && trail.length > 0) {
      ctx.fillStyle = `${signal}22`;
      for (const cell of trail) {
        ctx.fillRect(cell.x * cellPx + 1, cell.y * cellPx + 1, cellPx - 2, cellPx - 2);
      }
    }

    // Solved / speed-run path (stronger highlight).
    if (path && path.length > 0) {
      ctx.fillStyle = `${ember}33`;
      for (const cell of path) {
        ctx.fillRect(cell.x * cellPx + 1, cell.y * cellPx + 1, cellPx - 2, cellPx - 2);
      }
    }

    // Walls.
    ctx.strokeStyle = wallColor;
    ctx.lineWidth = Math.max(1.5, cellPx * 0.06);
    ctx.lineCap = "square";
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        if (!isRevealed(x, y)) continue;
        const bits = maze.cells[cellIndex(maze, x, y)];
        const px = x * cellPx;
        const py = y * cellPx;

        ctx.beginPath();
        if ((bits & NORTH) === 0) {
          ctx.moveTo(px, py);
          ctx.lineTo(px + cellPx, py);
        }
        if ((bits & SOUTH) === 0) {
          ctx.moveTo(px, py + cellPx);
          ctx.lineTo(px + cellPx, py + cellPx);
        }
        if ((bits & WEST) === 0) {
          ctx.moveTo(px, py);
          ctx.lineTo(px, py + cellPx);
        }
        if ((bits & EAST) === 0) {
          ctx.moveTo(px + cellPx, py);
          ctx.lineTo(px + cellPx, py + cellPx);
        }
        ctx.stroke();
      }
    }

    // Outer border, drawn regardless of fog so the play field always reads clearly.
    ctx.strokeStyle = wallColor;
    ctx.lineWidth = Math.max(2, cellPx * 0.08);
    ctx.strokeRect(0, 0, CANVAS_PX, CANVAS_PX);

    // Start marker (small dot, in case the mouse has already moved away from it).
    ctx.fillStyle = `${signal}88`;
    ctx.beginPath();
    ctx.arc(start.x * cellPx + cellPx / 2, start.y * cellPx + cellPx / 2, cellPx * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Goal + mouse (emoji), drawn on top.
    const fontSize = cellPx * 0.62;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🧀", goal.x * cellPx + cellPx / 2, goal.y * cellPx + cellPx / 2 + fontSize * 0.05);
    ctx.fillText("🐭", mouse.x * cellPx + cellPx / 2, mouse.y * cellPx + cellPx / 2 + fontSize * 0.05);
  }, [maze, start, goal, mouse, revealed, trail, path, isDarkMode]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!onCellClick || !pickingActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cellPx = CANVAS_PX / maze.width;
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * CANVAS_PX / cellPx);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * CANVAS_PX / cellPx);
    if (x < 0 || x >= maze.width || y < 0 || y >= maze.height) return;
    onCellClick({ x, y });
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className={`aspect-square w-full max-w-xl rounded-2xl border border-border ${pickingActive ? "cursor-crosshair" : ""}`}
      style={{ imageRendering: "auto" }}
      aria-label="Maze"
    />
  );
}
