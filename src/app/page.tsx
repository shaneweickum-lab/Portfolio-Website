import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getAllBooks,
  getAllCreativity,
  getAllProjects,
  getAllWorlds,
} from "@/lib/content";
import { ProjectCard, BookCard, WorldCard, CreativityCard } from "@/components/cards";

export default function HomePage() {
  const projects = getAllProjects().slice(0, 2);
  const books = getAllBooks().slice(0, 1);
  const worlds = getAllWorlds().slice(0, 1);
  const creativity = getAllCreativity().slice(0, 3);

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
            Shane Weickum
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-medium tracking-tight text-white sm:text-6xl">
            I build intelligent systems.{" "}
            <span className="text-ember">I build worlds.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            AI engineer by trade, storyteller and worldbuilder by nature. This
            is where the two sides of my work live side by side — shipped
            projects, unfinished novels, sprawling fictional worlds, and
            whatever else I&apos;m making.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-signal px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              See the engineering
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-signal/60 hover:text-signal"
            >
              Work with me
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/worlds"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-ember/60 hover:text-ember"
            >
              Step into the worlds
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
              The engineer
            </p>
            <h2 className="mt-3 font-display text-2xl font-medium text-foreground">
              AI systems that ship
            </h2>
            <p className="mt-3 text-sm text-muted">
              Agentic architectures, applied LLM tooling, and production
              systems built for real users — not just demos.
            </p>
            <Link
              href="/projects"
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-signal"
            >
              Browse projects <ArrowRight size={14} />
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ember">
              The worldbuilder
            </p>
            <h2 className="mt-3 font-display text-2xl font-medium text-foreground">
              Stories with real bones
            </h2>
            <p className="mt-3 text-sm text-muted">
              Novels-in-progress, deep worldbuilding, and the systems of
              magic, politics, and history that hold them together.
            </p>
            <Link
              href="/books"
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-ember"
            >
              Browse books <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {projects.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-medium text-foreground">
              Featured projects
            </h2>
            <Link href="/projects" className="text-sm text-signal">
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}

      {(books.length > 0 || worlds.length > 0) && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-medium text-foreground">
              From the worlds
            </h2>
            <Link href="/worlds" className="text-sm text-ember">
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {books.map((book) => (
              <BookCard key={book.slug} book={book} />
            ))}
            {worlds.map((world) => (
              <WorldCard key={world.slug} world={world} />
            ))}
          </div>
        </section>
      )}

      {creativity.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-medium text-foreground">
              Creative experiments
            </h2>
            <Link href="/creativity" className="text-sm text-wonder">
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {creativity.map((item) => (
              <CreativityCard key={item.slug} item={item} />
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
            Skills, background, and the story of how an AI engineer ended up
            building fantasy worlds on the side.
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
