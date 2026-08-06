import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { SkillCard } from "@/components/cards";
import { getAllSkills } from "@/lib/content";

export const metadata: Metadata = {
  title: "Claude Skills",
  description: "Claude Skills built for real writing and worldbuilding workflows, free to download.",
};

export default function SkillsPage() {
  const skills = getAllSkills();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} /> All projects
      </Link>

      <div className="mt-6">
        <SectionHeader
          kicker="Claude Skills"
          title="Skills"
          description="Small, focused Claude Skills built to solve real problems in my own writing and worldbuilding workflow — free to download and adapt."
          accent="signal"
        />
      </div>

      {skills.length === 0 ? (
        <p className="mt-12 text-muted">Skills are on their way.</p>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {skills.map((skill) => (
            <SkillCard key={skill.slug} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
