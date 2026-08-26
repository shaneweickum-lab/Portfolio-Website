import type { Metadata } from "next";
import { IntakeForm } from "@/components/intake-form";

export const metadata: Metadata = {
  title: "Project Intake",
  description:
    "Tell me what you're building. The same discovery I'd run in a first working session — for automation, AI integration, and custom software projects.",
};

export default function IntakePage() {
  return <IntakeForm />;
}
