import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import {
  addOnService,
  featuredService,
  howIWork,
  philosophy,
  positioning,
  services,
  tagline,
  whoIHelp,
} from "@/data/services";

export const metadata: Metadata = {
  title: "Services & Pricing",
  description: positioning,
};

type Tier = {
  sectionLabel: string;
  title: string;
  audienceLine: string;
  price: string;
  priceNote: string;
  timeline: string;
  ctaLabel: string;
  details: string[];
  accent?: "signal" | "ember";
  proof?: { label: string; description: string; href: string };
};

function TierRow({ tier, flagship = false }: { tier: Tier; flagship?: boolean }) {
  const accentClass = tier.accent === "ember" ? "text-ember" : "text-signal";
  return (
    <div
      className={`grid gap-5 rounded-[2px] border p-7 min-[760px]:grid-cols-[220px_1fr_160px] min-[760px]:items-start ${
        flagship
          ? "border-[var(--accent-dim)] bg-gradient-to-b from-signal/5 to-surface"
          : "border-border bg-surface"
      }`}
    >
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] tracking-wide text-signal">{tier.sectionLabel}</span>
        <span className="font-display text-lg font-semibold text-foreground">{tier.title}</span>
        <span className="text-xs leading-relaxed text-faint">{tier.audienceLine}</span>
      </div>

      <div>
        <ul className="flex flex-col gap-2">
          {tier.details.map((detail) => (
            <li key={detail} className="relative pl-4 text-[13.5px] text-muted">
              <span className="absolute left-0 text-[var(--accent-dim)]">—</span>
              {detail}
            </li>
          ))}
        </ul>
        <p className="mt-3 font-mono text-[11px] text-faint">
          Timeline: <span className="text-muted">{tier.timeline}</span>
        </p>
        {tier.proof && (
          <Link
            href={tier.proof.href}
            className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium ${accentClass}`}
          >
            See it in {tier.proof.label}
            <ArrowUpRight size={12} />
          </Link>
        )}
      </div>

      <div className="min-[760px]:text-right">
        <p className="font-display text-2xl font-semibold text-foreground">{tier.price}</p>
        <p className="mt-1 font-mono text-[10.5px] uppercase tracking-wide text-faint">{tier.priceNote}</p>
        <Link
          href="/intake"
          className="mt-3 inline-block border-b border-[var(--accent-dim)] pb-0.5 font-mono text-[11.5px] uppercase tracking-wide text-signal transition-colors hover:text-ember"
        >
          {tier.ctaLabel} →
        </Link>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeader
        kicker="Work with me"
        title="Services & Pricing"
        description={positioning}
        accent="signal"
      />
      <p className="mt-4 font-mono text-sm uppercase tracking-[0.2em] text-ember">{tagline}</p>
      <p className="mt-6 max-w-2xl text-sm text-muted">
        Every engagement starts with understanding, not a sales pitch. If you don&apos;t know
        which tier fits, start with the consultation — it tells you which of the others (if any)
        you actually need.
      </p>

      {/* Pricing ladder */}
      <div className="mt-10 flex flex-col gap-0.5">
        <TierRow tier={featuredService} flagship />
        {services.map((service) => (
          <TierRow key={service.title} tier={service} />
        ))}
      </div>

      {/* Specialty add-on */}
      <div className="mt-9 border-t border-dashed border-border pt-7">
        <p className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.1em] text-faint">
          Specialty add-on
        </p>
        <TierRow tier={addOnService} />
      </div>

      {/* How I work */}
      <section className="mt-20">
        <h2 className="font-display text-2xl font-medium text-foreground">How I work</h2>
        <ol className="mt-8 grid gap-8 sm:grid-cols-5">
          {howIWork.map((item) => (
            <li key={item.step}>
              <p className="font-mono text-sm text-signal">{item.step}</p>
              <p className="mt-2 font-medium text-foreground">{item.title}</p>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Philosophy */}
      <section className="mt-20 rounded-2xl border border-border bg-surface-muted p-10">
        <h2 className="font-display text-2xl font-medium text-foreground">{philosophy.title}</h2>
        <div className="mt-5 max-w-2xl space-y-4 text-sm text-muted">
          {philosophy.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <p className="mt-6 max-w-2xl border-l-2 border-ember pl-4 text-sm font-medium text-foreground">
          {philosophy.closing}
        </p>
      </section>

      {/* Who I help */}
      <section className="mt-20">
        <h2 className="font-display text-2xl font-medium text-foreground">Who I help</h2>
        <p className="mt-4 max-w-2xl text-sm text-muted">{whoIHelp.audience}</p>
        <p className="mt-2 max-w-2xl text-sm text-muted">{whoIHelp.location}</p>
      </section>

      {/* CTA */}
      <section className="mt-20 rounded-2xl border border-border bg-surface-muted p-10 text-center">
        <h2 className="font-display text-2xl font-medium text-foreground">
          Ready to figure out where this actually helps?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Start with the intake form — it&apos;s the same discovery I&apos;d run in a first
          working session.
        </p>
        <Link
          href="/intake"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-signal px-5 py-3 text-sm font-medium text-onaccent transition-opacity hover:opacity-90"
        >
          Start the intake <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
