import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllProjects } from "@/lib/content";
import { ProjectCard } from "@/components/cards";
import { edgeComputing, heroLede, positioning, values } from "@/data/engineering-philosophy";

export const metadata: Metadata = {
  title: { absolute: "Shane Weickum — Sustainable AI Engineer" },
  description:
    "A sustainable, energy-conscious AI engineer focused on edge computing and efficient technology. Portfolio, case studies, and philosophy — explained simply.",
};

export default function HomePage() {
  const projects = getAllProjects().slice(0, 3);

  return (
    <div>
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden border-b border-border">
        <Image
          src="/images/digital_hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/10 to-transparent" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-signal">Shane Weickum</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium tracking-tight text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.7)] sm:text-5xl md:text-6xl">
            {heroLede.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80 [text-shadow:0_1px_10px_rgba(0,0,0,0.7)]">
            {positioning.statement}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-signal px-5 py-3 text-sm font-medium text-onaccent transition-opacity hover:opacity-90"
            >
              See my work
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/engineering"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-signal/60 hover:text-signal"
            >
              Read my philosophy
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy teaser */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl border border-signal/30 bg-gradient-to-br from-signal/[0.05] to-surface-muted p-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">{heroLede.kicker}</p>
          <h2 className="mt-3 font-display text-2xl font-medium text-foreground">{edgeComputing.title}</h2>
          <p className="mt-4 max-w-2xl text-sm text-muted">{edgeComputing.paragraphs[0]}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {values.slice(0, 2).map((value) => (
              <div key={value.number} className="rounded-xl border border-border bg-surface p-5">
                <p className="font-medium text-foreground">{value.title}</p>
                <p className="mt-1.5 text-sm text-muted">{value.description}</p>
              </div>
            ))}
          </div>
          <Link
            href="/engineering"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-signal"
          >
            Read the full philosophy <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {projects.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-medium text-foreground">
              Case studies
            </h2>
            <Link href="/projects" className="text-sm text-signal">
              View all
            </Link>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Real, working projects built the same way I build everything — kept simple, efficient, and only as
            complicated as they need to be.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface-muted p-10">
            <h2 className="font-display text-2xl font-medium text-foreground">
              Want the fuller picture?
            </h2>
            <p className="mt-3 max-w-xl text-sm text-muted">
              A little more about my background and how I got here.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
            >
              Get to know me <ArrowRight size={16} />
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-surface-muted p-10">
            <h2 className="font-display text-2xl font-medium text-foreground">
              Looking to work together?
            </h2>
            <p className="mt-3 max-w-xl text-sm text-muted">
              I also run Nodylus Automat/ons, helping small businesses use automation and AI thoughtfully —
              sized to what they actually need, never more than that.
            </p>
            <Link
              href="/consulting"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground hover:border-signal/60 hover:text-signal"
            >
              Visit Consulting <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
