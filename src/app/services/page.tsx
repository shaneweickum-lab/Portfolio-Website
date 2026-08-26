import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import {
  featuredService,
  howIWork,
  philosophy,
  positioning,
  services,
  tagline,
  whoIHelp,
} from "@/data/services";

export const metadata: Metadata = {
  title: "Services",
  description: positioning,
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeader kicker="Work with me" title="Services" description={positioning} accent="signal" />
      <p className="mt-4 font-mono text-sm uppercase tracking-[0.2em] text-ember">{tagline}</p>

      {/* Featured: strategy consultation, the entry point */}
      <div className="mt-12 rounded-2xl border border-signal/40 bg-surface p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl font-medium text-foreground">{featuredService.title}</h2>
          <p className="text-lg font-medium text-signal">
            {featuredService.price}
            <span className="ml-1.5 text-sm font-normal text-muted">{featuredService.priceNote}</span>
          </p>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted">{featuredService.summary}</p>
        <ul className="mt-5 space-y-2.5">
          {featuredService.details.map((detail) => (
            <li key={detail} className="flex gap-2.5 text-sm text-muted">
              <Check size={16} className="mt-0.5 shrink-0 text-signal" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* The other four services */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {services.map((service) => (
          <div key={service.title} className="flex flex-col rounded-2xl border border-border bg-surface p-7">
            <h2 className="font-display text-xl font-medium text-foreground">{service.title}</h2>
            <p className="mt-3 text-sm text-muted">{service.summary}</p>

            <ul className="mt-5 space-y-2.5">
              {service.details.map((detail) => (
                <li key={detail} className="flex gap-2.5 text-sm text-muted">
                  <Check
                    size={16}
                    className={`mt-0.5 shrink-0 ${service.accent === "signal" ? "text-signal" : "text-ember"}`}
                  />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>

            <Link
              href={service.proof.href}
              className={`mt-6 inline-flex items-center gap-1.5 text-sm font-medium ${
                service.accent === "signal" ? "text-signal" : "text-ember"
              }`}
            >
              See it in {service.proof.label}
              <ArrowUpRight size={14} />
            </Link>
            <p className="mt-1 text-xs text-muted">{service.proof.description}</p>
          </div>
        ))}
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
