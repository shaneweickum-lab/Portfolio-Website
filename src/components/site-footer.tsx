import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} Nodylus Automat
          <span className="text-wonder">/</span>
          ons.
        </p>
        <div className="flex flex-wrap gap-5">
          <Link href="/engineering" className="hover:text-foreground">
            Philosophy
          </Link>
          <Link href="/projects" className="hover:text-foreground">
            Case Studies
          </Link>
          <Link href="/consulting" className="hover:text-foreground">
            Consulting
          </Link>
          <Link href="/about" className="hover:text-foreground">
            Get to Know Me
          </Link>
          <Link href="/intake" className="hover:text-foreground">
            Work With Me
          </Link>
        </div>
      </div>
    </footer>
  );
}
