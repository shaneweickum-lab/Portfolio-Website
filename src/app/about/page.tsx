import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Tag } from "@/components/tag";
import { bio, skillGroups, timeline } from "@/data/about";

export const metadata: Metadata = {
  title: "Get to Know Me",
  description: "Background and experience behind the automation and AI integration consulting work.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <SectionHeader
        kicker="Get to know me"
        title={bio.headline}
        accent="signal"
      />

      <div className="mt-8 space-y-4 text-lg text-muted">
        {bio.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-medium text-foreground">
          What I work with
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {skillGroups.map((group) => (
            <div
              key={group.title}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <h3 className="font-medium text-foreground">{group.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <Tag key={skill} accent={group.accent}>
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-medium text-foreground">
          The path here
        </h2>
        <ol className="mt-6 space-y-8 border-l border-border pl-6">
          {timeline.map((entry) => (
            <li key={entry.title} className="relative">
              <span className="absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full bg-signal" />
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                {entry.year}
              </p>
              <h3 className="mt-1 font-medium text-foreground">
                {entry.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{entry.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 rounded-2xl border border-border bg-surface-muted p-10 text-center">
        <h2 className="font-display text-2xl font-medium text-foreground">
          See it in action
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-full bg-signal px-5 py-3 text-sm font-medium text-onaccent"
          >
            Work with me <ArrowRight size={16} />
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground hover:border-signal/60 hover:text-signal"
          >
            Case studies <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
