import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllProjects } from "@/lib/content";
import { ProjectCard } from "@/components/cards";
import { Tag } from "@/components/tag";
import { howIWork, ourApproach, philosophy, positioning, slogan, tagline } from "@/data/services";

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
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-signal">
            Nodylus Automat<span className="text-wonder">/</span>ons
          </p>
          <div className="mt-4">
            <Tag accent="ok">Sustainable AI Solutions</Tag>
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-medium tracking-tight text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.7)] sm:text-6xl">
            Sustainable AI & Automation Consulting
          </h1>
          <div className="mt-5 max-w-xl">
            <p className="font-display text-xl italic text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.7)]">
              &ldquo;{slogan}&rdquo;
            </p>
            <div className="my-3 h-px w-16 bg-wonder" />
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-ember [text-shadow:0_1px_10px_rgba(0,0,0,0.85)]">
              {tagline}
            </p>
          </div>
          <p className="mt-6 max-w-2xl text-lg text-white/80 [text-shadow:0_1px_10px_rgba(0,0,0,0.7)]">
            {positioning}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 rounded-full bg-signal px-5 py-3 text-sm font-medium text-onaccent transition-opacity hover:opacity-90"
            >
              Work with me
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-signal/60 hover:text-signal"
            >
              See the case studies
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl border border-ok/30 bg-gradient-to-br from-ok/[0.04] to-surface-muted p-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ok">{ourApproach.kicker}</p>
          <h2 className="mt-3 font-display text-2xl font-medium text-foreground">{ourApproach.title}</h2>
          <p className="mt-4 max-w-2xl text-sm text-muted">{ourApproach.intro}</p>
          <ul className="mt-6 flex max-w-3xl flex-col gap-3">
            {ourApproach.points.map((point) => (
              <li key={point} className="relative pl-5 text-sm text-muted">
                <span className="absolute left-0 text-ok">—</span>
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl border-l-2 border-ok pl-4 text-sm font-medium text-foreground">
            {ourApproach.closing}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl border border-border bg-surface-muted p-10">
          <h2 className="font-display text-2xl font-medium text-foreground">{philosophy.title}</h2>
          <p className="mt-4 max-w-2xl text-sm text-muted">{philosophy.paragraphs[0]}</p>
          <p className="mt-4 max-w-2xl border-l-2 border-ember pl-4 text-sm font-medium text-foreground">
            {philosophy.closing}
          </p>
          <Link
            href="/services"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-signal"
          >
            How I work <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-5">
          {howIWork.map((item) => (
            <div key={item.step}>
              <p className="font-mono text-sm text-signal">{item.step}</p>
              <p className="mt-2 font-medium text-foreground">{item.title}</p>
            </div>
          ))}
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
            Real, shipped systems — the same engineering judgment behind the
            consulting work.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl border border-border bg-surface-muted p-10 text-center">
          <h2 className="font-display text-2xl font-medium text-foreground">
            Want the fuller picture?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
            Background, skills, and the experience behind the automation and
            AI integration work.
          </p>
          <Link
            href="/about"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
          >
            Get to know me <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
