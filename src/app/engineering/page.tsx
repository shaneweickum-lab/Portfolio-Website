import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Tag } from "@/components/tag";
import {
  capabilitySurface,
  closingStatement,
  decisionModel,
  decisionModelClosing,
  decisionModelEscalation,
  heroLede,
  howIBuild,
  layers,
  ocp,
  positioning,
  projectConnections,
  systemsPerspective,
  whySmallModels,
} from "@/data/engineering-philosophy";

export const metadata: Metadata = {
  title: "Engineering Philosophy",
  description:
    "SLM, deterministic, and small neural network engineering — an architectural principle for orchestrating the smallest capability that reliably solves each task, instead of defaulting to one large general-purpose model.",
};

function FlowBox({
  children,
  accent = false,
  small = false,
}: {
  children: ReactNode;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-4 text-center font-mono uppercase tracking-wide ${
        small ? "py-2 text-[10.5px]" : "py-3 text-xs"
      } ${accent ? "border-signal/50 bg-signal/[0.06] text-signal" : "border-border bg-surface text-muted"}`}
    >
      {children}
    </div>
  );
}

function FlowArrow() {
  return <ArrowDown size={16} className="my-1.5 shrink-0 text-faint" />;
}

export default function EngineeringPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Hero */}
      <SectionHeader kicker={heroLede.kicker} title={heroLede.title} accent="signal" />
      <p className="mt-6 max-w-2xl text-lg text-muted">{heroLede.intro}</p>

      {/* Positioning statement — the strongest claim on the page */}
      <div className="mt-10 rounded-2xl border border-signal/40 bg-gradient-to-br from-signal/[0.07] to-surface-muted p-8 sm:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">{positioning.title}</p>
        <p className="mt-4 font-display text-xl font-medium leading-snug text-foreground sm:text-2xl">
          {positioning.statement}
        </p>
        <p className="mt-5 max-w-2xl border-l-2 border-signal pl-4 text-sm font-medium text-foreground">
          {positioning.closing}
        </p>
      </div>

      {/* The four layers */}
      <section className="mt-20">
        <h2 className="font-display text-2xl font-medium text-foreground">A layered approach, not a single tool</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Every system gets decomposed into individual capabilities, and each capability is matched to one of four
          layers — escalating only as far as the task actually requires.
        </p>

        <div className="mt-10 flex flex-col">
          {layers.map((layer, i) => (
            <div key={layer.number} className="relative">
              <div className="grid gap-5 rounded-2xl border border-border bg-surface p-7 sm:grid-cols-[auto_1fr]">
                <div className="flex sm:flex-col sm:items-center sm:gap-2">
                  <span className="font-mono text-2xl font-semibold text-signal">{layer.number}</span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{layer.title}</h3>
                  <p className="mt-0.5 font-mono text-xs uppercase tracking-wide text-ember">{layer.subtitle}</p>
                  <p className="mt-3 max-w-2xl text-sm text-muted">{layer.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {layer.examples.map((example) => (
                      <Tag key={example}>{example}</Tag>
                    ))}
                  </div>
                  <p className="mt-4 border-l-2 border-signal pl-3 text-sm font-medium text-foreground">
                    {layer.principle}
                  </p>
                </div>
              </div>
              {i < layers.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown size={18} className="text-faint" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* OCP */}
      <section className="mt-20 rounded-2xl border border-border bg-surface-muted p-8 sm:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ember">{ocp.framing}</p>
        <h2 className="mt-3 font-display text-2xl font-medium text-foreground">
          {ocp.name} — {ocp.fullName}
        </h2>
        <p className="mt-4 max-w-2xl border-l-2 border-ember pl-4 text-base font-medium text-foreground">
          {ocp.definition}
        </p>
        <p className="mt-5 max-w-2xl text-sm text-muted">{ocp.explanation}</p>
        <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[11px] uppercase tracking-[0.06em] text-faint">
          {ocp.flow.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span className={i === 0 ? "text-ember" : "text-muted"}>{step}</span>
              {i < ocp.flow.length - 1 && <span className="text-[var(--accent-dim)]">→</span>}
            </span>
          ))}
        </p>
        <p className="mt-6 max-w-2xl text-sm font-medium text-foreground">{ocp.closing}</p>
      </section>

      {/* Capability surface — the architecture diagram */}
      <section className="mt-20">
        <h2 className="font-display text-2xl font-medium text-foreground">{capabilitySurface.title}</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">{capabilitySurface.definition}</p>

        <div className="mt-10 flex flex-col items-center">
          <FlowBox accent>{capabilitySurface.flow.input}</FlowBox>
          <FlowArrow />
          {capabilitySurface.flow.steps.map((step) => (
            <div key={step} className="flex flex-col items-center">
              <FlowBox>{step}</FlowBox>
              <FlowArrow />
            </div>
          ))}

          <div className="w-full max-w-xl border-t border-border pt-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {capabilitySurface.flow.branches.map((branch) => (
                <div key={branch} className="flex flex-col items-center gap-2">
                  <span className="h-4 w-px bg-border" />
                  <FlowBox small>{branch}</FlowBox>
                </div>
              ))}
            </div>
          </div>
          <span className="h-6 w-px bg-border" />
          <FlowArrow />

          {capabilitySurface.flow.merge.map((step, i) => (
            <div key={step} className="flex flex-col items-center">
              <FlowBox accent={i === capabilitySurface.flow.merge.length - 1}>{step}</FlowBox>
              {i < capabilitySurface.flow.merge.length - 1 && <FlowArrow />}
            </div>
          ))}
        </div>
      </section>

      {/* Systems perspective */}
      <section className="mt-20">
        <h2 className="font-display text-2xl font-medium text-foreground">{systemsPerspective.title}</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">{systemsPerspective.intro}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {systemsPerspective.questions.map((question) => (
            <div key={question} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
              {question}
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-2xl border-l-2 border-signal pl-4 text-sm font-medium text-foreground">
          {systemsPerspective.closing}
        </p>
      </section>

      {/* Why small models */}
      <section className="mt-20 rounded-2xl border border-ok/30 bg-gradient-to-br from-ok/[0.04] to-surface-muted p-8 sm:p-10">
        <h2 className="font-display text-2xl font-medium text-foreground">{whySmallModels.title}</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">{whySmallModels.intro}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {whySmallModels.benefits.map((benefit) => (
            <Tag key={benefit} accent="ok">
              {benefit}
            </Tag>
          ))}
        </div>
        <p className="mt-6 max-w-2xl border-l-2 border-ok pl-4 text-sm font-medium text-foreground">
          {whySmallModels.principle}
        </p>
      </section>

      {/* Decision model */}
      <section className="mt-20">
        <h2 className="font-display text-2xl font-medium text-foreground">An engineering decision model</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Deterministic-first, not AI-first — every task runs through the same escalation before a model gets
          involved at all.
        </p>

        <div className="mt-8 flex flex-col gap-0">
          {decisionModel.map((step, i) => (
            <div key={step.question} className="flex flex-col">
              <div className="rounded-2xl border border-border bg-surface p-6">
                <p className="font-display text-base font-medium text-foreground">{step.question}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-ember/40 bg-ember/[0.06] px-4 py-2.5 text-sm text-foreground">
                    <span className="font-mono text-xs uppercase tracking-wide text-ember">No →</span> {step.no}
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted">
                    <span className="font-mono text-xs uppercase tracking-wide text-signal">Yes</span>
                    {i < decisionModel.length - 1 ? "Continue to the next question." : "Escalate."}
                  </div>
                </div>
              </div>
              {i < decisionModel.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown size={18} className="text-faint" />
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-center py-2">
            <ArrowDown size={18} className="text-faint" />
          </div>
          <div className="rounded-2xl border border-ember/40 bg-ember/[0.06] p-6 text-center">
            <p className="font-mono text-xs uppercase tracking-wide text-ember">Last resort</p>
            <p className="mt-1 font-display text-base font-medium text-foreground">{decisionModelEscalation}</p>
          </div>
        </div>
        <p className="mt-6 max-w-2xl border-l-2 border-signal pl-4 text-sm font-medium text-foreground">
          {decisionModelClosing}
        </p>
      </section>

      {/* How I build */}
      <section className="mt-20">
        <h2 className="font-display text-2xl font-medium text-foreground">How I build</h2>
        <ol className="mt-8 space-y-8 border-l border-border pl-6">
          {howIBuild.map((step) => (
            <li key={step.number} className="relative">
              <span className="absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full bg-signal" />
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">{step.number}</p>
              <h3 className="mt-1 font-medium text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Project connections */}
      <section className="mt-20">
        <h2 className="font-display text-2xl font-medium text-foreground">How this shows up in my work</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          This isn&apos;t just something I say. It&apos;s the decomposition behind the shipped systems on this site.
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
