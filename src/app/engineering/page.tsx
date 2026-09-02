import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Tag } from "@/components/tag";
import {
  closingStatement,
  edgeComputing,
  heroLede,
  positioning,
  projectConnections,
  values,
  whyItMatters,
} from "@/data/engineering-philosophy";

export const metadata: Metadata = {
  title: "My Philosophy",
  description:
    "A sustainable, energy-conscious approach to AI — built around edge computing, right-sized technology, and never using more computing power than a problem actually needs.",
};

export default function EngineeringPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Hero */}
      <SectionHeader kicker={heroLede.kicker} title={heroLede.title} accent="signal" />
      <p className="mt-6 max-w-2xl text-lg text-muted">{heroLede.intro}</p>

      {/* Positioning statement */}
      <div className="mt-10 rounded-2xl border border-signal/40 bg-gradient-to-br from-signal/[0.07] to-surface-muted p-8 sm:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">{positioning.title}</p>
        <p className="mt-4 font-display text-xl font-medium leading-snug text-foreground sm:text-2xl">
          {positioning.statement}
        </p>
        <p className="mt-5 max-w-2xl border-l-2 border-signal pl-4 text-sm font-medium text-foreground">
          {positioning.closing}
        </p>
      </div>

      {/* Values */}
      <section className="mt-20">
        <h2 className="font-display text-2xl font-medium text-foreground">What I believe</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          A few simple ideas guide every project I take on — no matter how big or small.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {values.map((value) => (
            <div key={value.number} className="rounded-2xl border border-border bg-surface p-7">
              <span className="font-mono text-2xl font-semibold text-signal">{value.number}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{value.title}</h3>
              <p className="mt-3 text-sm text-muted">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Edge computing */}
      <section className="mt-20 rounded-2xl border border-border bg-surface-muted p-8 sm:p-10">
        <h2 className="font-display text-2xl font-medium text-foreground">{edgeComputing.title}</h2>
        <div className="mt-4 max-w-2xl space-y-4 text-sm text-muted">
          {edgeComputing.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      {/* Why it matters */}
      <section className="mt-20 rounded-2xl border border-ok/30 bg-gradient-to-br from-ok/[0.04] to-surface-muted p-8 sm:p-10">
        <h2 className="font-display text-2xl font-medium text-foreground">{whyItMatters.title}</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">{whyItMatters.intro}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {whyItMatters.benefits.map((benefit) => (
            <Tag key={benefit} accent="ok">
              {benefit}
            </Tag>
          ))}
        </div>
        <p className="mt-6 max-w-2xl border-l-2 border-ok pl-4 text-sm font-medium text-foreground">
          {whyItMatters.principle}
        </p>
      </section>

      {/* Project connections */}
      <section className="mt-20">
        <h2 className="font-display text-2xl font-medium text-foreground">How this shows up in my work</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          This isn&apos;t just something I say — it&apos;s reflected in the projects I&apos;ve actually built.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {projectConnections.map((project) => (
            <Link
              key={project.slug}
              href={project.href}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-signal/50"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground">{project.title}</h3>
                <ArrowUpRight
                  size={16}
                  className="mt-1 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal"
                />
              </div>
              <p className="mt-2 text-sm text-muted">{project.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.status === "roadmap" && <Tag accent="ember">Roadmap</Tag>}
                {project.tags.map((tag) => (
                  <Tag key={tag} accent="signal">
                    {tag}
                  </Tag>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="mt-20 rounded-2xl border border-border bg-surface-muted p-10 text-center">
        <p className="mx-auto max-w-xl text-base font-medium text-foreground">{closingStatement}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full bg-signal px-5 py-3 text-sm font-medium text-onaccent transition-opacity hover:opacity-90"
          >
            See the case studies <ArrowRight size={16} />
          </Link>
          <Link
            href="/consulting"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground hover:border-signal/60 hover:text-signal"
          >
            Work with me <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
