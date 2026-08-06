import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/section-header";

export const metadata: Metadata = {
  title: "Airgap",
  description:
    "Transfer a file between two devices with no network at all — just light. A color-flicker pattern on one screen, read by another device's camera.",
};

export default function AirgapPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <SectionHeader
        kicker="Airgap"
        title="Send a file with nothing but light"
        description="No network, no pairing, no Bluetooth. One device flickers a color-coded pattern on its screen; another reads it back with a camera and reconstructs the file."
        accent="signal"
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/projects/airgap/sender"
          className="group flex flex-col items-start rounded-2xl border border-border bg-surface p-6 text-left transition-colors hover:border-signal/50"
        >
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
            Device A
          </span>
          <span className="mt-2 text-lg font-medium text-foreground">Send a file</span>
          <span className="mt-6 inline-flex items-center gap-1 text-sm text-signal">
            Open sender <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          href="/projects/airgap/receiver"
          className="group flex flex-col items-start rounded-2xl border border-border bg-surface p-6 text-left transition-colors hover:border-signal/50"
        >
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
            Device B
          </span>
          <span className="mt-2 text-lg font-medium text-foreground">Receive a file</span>
          <span className="mt-6 inline-flex items-center gap-1 text-sm text-signal">
            Open receiver <ArrowRight size={14} />
          </span>
        </Link>
      </div>

      <p className="mt-8 text-xs text-muted">
        Open the sender on one device and the receiver on another, point
        the receiver&apos;s camera at the sender&apos;s screen, and hold
        roughly steady. Small files (a few KB) work best.
      </p>
    </div>
  );
}
