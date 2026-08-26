import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Tag } from "@/components/tag";
import {
  automationCategory,
  capabilityFlow,
  consultingCategory,
  featuredService,
  howIWork,
  philosophy,
  positioning,
  serviceCategories,
  smallBusinessNote,
  tagline,
  technologyPrinciple,
  whoIHelp,
} from "@/data/services";

export const metadata: Metadata = {
  title: "Services & Pricing",
  description: positioning,
};

type LadderTier = {
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
  sustainabilityNote?: string;
};

type CompactTier = {
  title: string;
  audienceLine: string;
  price: string;
  priceNote: string;
  ctaLabel: string;
  details: string[];
  proof?: { label: string; description: string; href: string };
  sustainable?: boolean;
  note?: string;
};

function CategoryHeader({ number, title, blurb }: { number: string; title: string; blurb?: string }) {
  return (
    <div className="mb-5 flex flex-col gap-1.5">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-signal">{number}</span>
        <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {blurb && <p className="max-w-2xl text-sm text-muted">{blurb}</p>}
    </div>
  );
}

function ServiceCard({ tier }: { tier: CompactTier }) {
  return (
    <div className="flex flex-col rounded-[2px] border border-border bg-surface p-6">
      {tier.sustainable && (
        <div className="mb-2">
          <Tag accent="ok">Sustainable AI</Tag>
        </div>
      )}
      <h3 className="font-display text-base font-semibold text-foreground">{tier.title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-faint">{tier.audienceLine}</p>
      <ul className="mt-4 flex flex-col gap-1.5">
        {tier.details.map((detail) => (
          <li key={detail} className="relative pl-4 text-[12.5px] text-muted">
            <span className="absolute left-0 text-[var(--accent-dim)]">—</span>
            {detail}
          </li>
        ))}
      </ul>
      {tier.proof && (
        <Link
          href={tier.proof.href}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-signal"
        >
          See it in {tier.proof.label}
          <ArrowUpRight size={12} />
        </Link>
      )}
      {tier.note && <p className="mt-3 text-[11px] leading-relaxed text-ok/80">{tier.note}</p>}
      <div className="mt-auto pt-5">
        <p className="font-display text-lg font-semibold text-foreground">{tier.price}</p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-faint">{tier.priceNote}</p>
        <Link
          href="/intake"
          className="mt-2.5 inline-block border-b border-[var(--accent-dim)] pb-0.5 font-mono text-[11px] uppercase tracking-wide text-signal transition-colors hover:text-ember"
        >
          {tier.ctaLabel} →
        </Link>
      </div>
    </div>
  );
}

function TierRow({ tier, flagship = false }: { tier: LadderTier; flagship?: boolean }) {
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
        {tier.sustainabilityNote && (
          <p className="mt-2 max-w-md text-[11px] leading-relaxed text-ok/80">{tier.sustainabilityNote}</p>
        )}
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
      <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.08em] text-faint">
        {capabilityFlow.map((step, i) => (
          <span key={step} className="flex items-center gap-2">
            <span className={i === 0 ? "text-signal" : "text-muted"}>{step}</span>
            {i < capabilityFlow.length - 1 && <span className="text-[var(--accent-dim)]">→</span>}
          </span>
        ))}
      </p>

      {/* 01 — Consulting / 02 — Automation: the core engagement ladder */}
      <div className="mt-10">
        <CategoryHeader number={consultingCategory.number} title={consultingCategory.title} />
        <div className="flex flex-col gap-0.5">
          <TierRow tier={featuredService} flagship />
          {consultingCategory.tiers.map((tier) => (
            <TierRow key={tier.title} tier={tier} />
          ))}
        </div>
      </div>

      <div className="mt-9">
        <CategoryHeader number={automationCategory.number} title={automationCategory.title} />
        <div className="flex flex-col gap-0.5">
          {automationCategory.tiers.map((tier) => (
            <TierRow key={tier.title} tier={tier} />
          ))}
        </div>
      </div>

      {/* Small-business pricing note */}
      <div className="mt-6 rounded-[2px] border border-[var(--accent-dim)] bg-gradient-to-br from-signal/[0.06] to-transparent p-6">
        <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-signal">
          {smallBusinessNote.eyebrow}
        </p>
        <p className="max-w-2xl text-sm text-muted">{smallBusinessNote.paragraph}</p>
        <Link
          href="/intake"
          className="mt-3.5 inline-block border-b border-[var(--accent-dim)] pb-0.5 font-mono text-[11.5px] uppercase tracking-wide text-signal transition-colors hover:text-ember"
        >
          {smallBusinessNote.ctaLabel} →
        </Link>
      </div>

      {/* 03–08 — the wider capability catalog */}
      {serviceCategories.map((category) => (
        <div key={category.number} className="mt-9 border-t border-dashed border-border pt-8">
          <CategoryHeader number={category.number} title={category.title} blurb={category.blurb} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.tiers.map((tier) => (
              <ServiceCard key={tier.title} tier={tier} />
            ))}
          </div>
          {category.number === "06" && (
            <div className="mt-5 rounded-2xl border border-ok/30 bg-gradient-to-br from-ok/[0.04] to-surface-muted p-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ok">
                {technologyPrinciple.eyebrow}
              </p>
              <h3 className="mt-2 font-display text-xl font-medium text-foreground">
                {technologyPrinciple.title}
              </h3>
              <div className="mt-3 max-w-2xl space-y-2 text-sm text-muted">
                {technologyPrinciple.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {technologyPrinciple.criteria.map((c) => (
                  <Tag key={c} accent="ok">
                    {c}
                  </Tag>
                ))}
              </div>
              <p className="mt-5 max-w-2xl border-l-2 border-ok pl-4 text-sm font-medium text-foreground">
                {technologyPrinciple.closing}
              </p>
            </div>
          )}
        </div>
      ))}

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
