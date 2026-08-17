import type { Metadata } from "next";
import { MazeRunnerApp } from "@/components/maze-runner-app";

export const metadata: Metadata = {
  title: "Maze Runner",
  description:
    "A procedurally generated maze, solved by hand or by a real pathfinding algorithm — an homage to the Micromouse robotics competition.",
};

export default function MazeRunnerPage() {
  return <MazeRunnerApp />;
}
