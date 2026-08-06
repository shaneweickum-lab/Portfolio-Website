import type { Metadata } from "next";
import { OpticalSender } from "@/components/optical-sender";

export const metadata: Metadata = {
  title: "Airgap — Send",
  description:
    "Send a file to another device using nothing but light — a color-flicker pattern read by a camera. No network involved.",
};

export default function AirgapSenderPage() {
  return <OpticalSender />;
}
