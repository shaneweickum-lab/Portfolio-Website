# Portfolio Website

Shane Weickum's personal site — a platform for AI engineering projects,
books, fictional worlds, and creative work, alongside a "get to know me"
page.

Built with Next.js (App Router), TypeScript, and Tailwind CSS, deployed on
Vercel.

## Structure

- `/` — home, with highlights pulled from each section
- `/projects` — AI engineering projects
- `/books` — novels and long-form fiction
- `/worlds` — worldbuilding entries (settings, factions, history)
- `/creativity` — shorter creative experiments (poems, flash fiction, essays)
- `/about` — bio, skills, and background

## Content model

There's no CMS wired up yet — content lives as MDX files with frontmatter
under `content/<category>/*.mdx`, loaded at build time by
`src/lib/content.ts`. This is intentionally a flat-file "content layer": add
a new project by creating a new `.mdx` file, no code changes needed.

Frontmatter shape per category is defined in `src/lib/types.ts`. Set
`draft: true` on any entry to hide it in production builds while still
seeing it in `next dev`.

This structure is designed to be swapped out later — if a custom, purpose-built
CMS replaces the flat files (e.g. a lightweight PWA for editing content),
only `src/lib/content.ts` needs to change; every page reads through that
module.

## Development

```bash
npm install
npm run dev
```

## Deploying to Vercel

This is a stock Next.js app — no special configuration required.

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. In Vercel, "Add New Project" → import this repository.
3. Framework preset: Next.js (auto-detected). No environment variables are
   required for the current content model.
4. Deploy.

Every push to the connected branch gets a preview deployment; pushes to the
production branch deploy to production.
