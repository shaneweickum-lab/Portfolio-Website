import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Shane Weickum.</p>
        <div className="flex gap-5">
          <Link href="/about" className="hover:text-foreground">
            Get to Know Me
          </Link>
          <Link href="/projects" className="hover:text-foreground">
            Projects
          </Link>
          <Link href="/creativity" className="hover:text-foreground">
            Creativity
          </Link>
        </div>
      </div>
    </footer>
  );
}
