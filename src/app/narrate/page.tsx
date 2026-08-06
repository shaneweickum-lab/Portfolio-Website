import type { Metadata } from "next";
import { NarrateApp } from "@/components/narrate-app";

export const metadata: Metadata = {
  title: "Narrate",
  description:
    "Upload a manuscript and have it read aloud right in your browser, using your device's own voices.",
};

export default function NarratePage() {
  return <NarrateApp />;
}
