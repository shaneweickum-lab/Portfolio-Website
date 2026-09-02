import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { ProjectCard } from "@/components/cards";
import { getAllProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Real, working projects — built simply, efficiently, and to actually last.",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeader
        kicker="Proof of work"
        title="Case Studies"
        description="Real, working projects — built simply, kept efficient, and made to actually hold up. The same care that goes into every consulting project."
        accent="signal"
      />

      <Link
        href="/projects/skills"
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-signal/60 hover:text-signal"
      >
        Claude Skills — download the skills I use in my own workflow
        <ArrowUpRight size={14} />
      </Link>

      {projects.length === 0 ? (
        <p className="mt-12 text-muted">Projects are on their way.</p>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
