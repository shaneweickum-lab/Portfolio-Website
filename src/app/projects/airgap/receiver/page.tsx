import type { Metadata } from "next";
import { OpticalReceiver } from "@/components/optical-receiver";

export const metadata: Metadata = {
  title: "Airgap — Receive",
  description:
    "Receive a file from another device using nothing but light — your camera reads a color-flicker pattern directly off a screen.",
};

export default function AirgapReceiverPage() {
  return <OpticalReceiver />;
}
