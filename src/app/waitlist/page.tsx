import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: { absolute: "Custom AI Waitlist — W.P. Solutions" },
  description:
    "Join the waitlist for custom AI systems sized for your business. AI that's built specifically for how you work, not oversized for the sake of it.",
};

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-background py-12 sm:py-20">
      <div className="mx-auto max-w-2xl px-6">
        <Link
          href="/consulting"
          className="mb-8 inline-flex items-center gap-1 text-sm text-signal hover:text-signal/80"
        >
          <ArrowLeft size={16} />
          Back to consulting
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
              Custom AI, Sized for Your Business
            </h1>
            <p className="mt-4 text-lg text-muted">
              AI built specifically around how your business actually works — sized appropriately to the problem it&apos;s solving, connected directly to your own systems and documents, and delivered with a clear understanding that the model size is decided by the job, never used as a selling point.
            </p>
          </div>

          <div className="rounded-2xl border border-signal/30 bg-gradient-to-br from-signal/[0.05] to-surface-muted p-8">
            <h2 className="mb-6 font-display text-2xl font-medium text-foreground">
              Join the waitlist
            </h2>
            <p className="mb-6 text-muted">
              We&apos;re preparing the infrastructure and hardware foundation for custom AI deployment. If you&apos;re interested in being one of the first to explore this offering, join the waitlist below and we&apos;ll reach out when everything is ready.
            </p>
            <WaitlistForm offering="custom-ai" />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-foreground">What to expect</h3>
              <p className="mt-2 text-sm text-muted">
                When this offering launches, it will include a consultation to understand your business, a custom AI model built and fine-tuned for your specific workflows, integration with your existing systems and documents, and ongoing support as your needs evolve.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-foreground">Waitlist timing</h3>
              <p className="mt-2 text-sm text-muted">
                This offering is currently in the planning stages. We&apos;ll contact waitlist members with more details on timeline and availability as we move forward.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-foreground">Want to discuss sooner?</h3>
              <p className="mt-2 text-sm text-muted">
                If you&apos;d like to talk about your AI and automation needs right now, we offer{" "}
                <Link href="/consulting" className="text-signal hover:text-signal/80">
                  strategy consultations
                </Link>{" "}
                that can help identify where custom AI might fit into your business.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
