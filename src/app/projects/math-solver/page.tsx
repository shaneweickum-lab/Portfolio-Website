import type { Metadata } from "next";
import { CameraMathSolver } from "@/components/camera-math-solver";

export const metadata: Metadata = {
  title: "Camera Math Solver",
  description:
    "Point a camera at a printed math problem and get it solved live -- OCR and evaluation running entirely in the browser, no image ever leaves the device.",
};

export default function MathSolverPage() {
  return <CameraMathSolver />;
}
