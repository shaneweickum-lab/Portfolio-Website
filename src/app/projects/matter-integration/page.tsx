import type { Metadata } from "next";
import { MatterIntegrationApp } from "@/components/matter-integration-app";

export const metadata: Metadata = {
  title: "Matter Integration Interface",
  description:
    "Toggle a real, Matter-native smart plug on my home network, live — when the demo bridge is running.",
};

export default function MatterIntegrationPage() {
  return <MatterIntegrationApp />;
}
