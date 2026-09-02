export const positioning = {
  title: "Sustainable AI Engineer",
  statement:
    "I build AI and technology that's efficient, reliable, and easy on the planet — using only as much computing power as a problem actually needs, running it as close to home as possible, and never reaching for something bigger or flashier than the job calls for.",
  closing:
    "My goal isn't to build the biggest or most impressive-sounding AI system. It's to build the right one — something that works well, costs less to run, and doesn't waste energy doing it.",
};

export const heroLede = {
  kicker: "My Philosophy",
  title: "Good technology doesn't have to be big, expensive, or wasteful.",
  intro:
    "A lot of AI today defaults to the biggest, most power-hungry option available, whether or not the problem actually needs it. I build differently: starting simple, using efficient and energy-conscious tools whenever they'll do the job well, and only bringing in bigger AI when it truly earns its place.",
};

export type PhilosophyValue = {
  number: string;
  title: string;
  description: string;
};

export const values: PhilosophyValue[] = [
  {
    number: "01",
    title: "Start simple",
    description:
      "If a problem can be solved with straightforward, well-tested technology, that's where I start — before reaching for AI at all. Simple solutions are easier to trust, cheaper to run, and less likely to break.",
  },
  {
    number: "02",
    title: "Right-sized, not oversized",
    description:
      "Not every task needs a massive AI model. Smaller, efficient tools are often faster, cheaper, more private, and kinder to the environment — and they usually work just as well for the job at hand.",
  },
  {
    number: "03",
    title: "AI where it earns its place",
    description:
      "AI is genuinely powerful, but it isn't the answer to everything. I bring it in only where it adds real value — not because it's trendy, and not by default.",
  },
  {
    number: "04",
    title: "Built to work together",
    description:
      "Good systems are usually a team effort between several efficient, focused tools rather than one giant system trying to do everything at once. Each piece does what it's actually good at.",
  },
];

export const edgeComputing = {
  title: "Why I care about edge computing",
  paragraphs: [
    "Most AI today runs far away, in enormous data centers, even for small everyday tasks. \"Edge computing\" simply means running technology closer to home — on your own device, or on nearby hardware — instead of always shipping everything off to a distant server.",
    "When it's possible, I like to build things this way. It usually means faster results, better privacy since your information doesn't have to travel as far, and a much smaller environmental footprint.",
  ],
};

export const whyItMatters = {
  title: "Why energy-efficient AI matters",
  intro:
    "None of this comes from a belief that smaller or simpler is always better — it isn't, every time. It comes from treating energy and computing power as things worth respecting, not something to spend without a second thought.",
  benefits: [
    "Uses less electricity",
    "Costs less to run over time",
    "Works even with a weak or no internet connection",
    "Keeps your information more private",
    "Easier to maintain and trust",
    "Less reliant on giant, centralized infrastructure",
  ],
  principle: "The best solution is the simplest one that does the job well — nothing more, nothing less.",
};

export type CapabilityTag = "Runs on your device" | "Small & efficient" | "No cloud AI needed" | "Human + AI teamwork";

export type ProjectConnection = {
  slug: string;
  href: string;
  title: string;
  blurb: string;
  tags: CapabilityTag[];
  status?: "roadmap";
};

export const projectConnections: ProjectConnection[] = [
  {
    slug: "camera-math-solver",
    href: "/projects/camera-math-solver",
    title: "Camera Math Solver",
    blurb:
      "Reads a math problem through your camera and solves it — using small, efficient tools built for exactly that job, then handing off the actual math to simple, reliable code instead of an AI guess.",
    tags: ["Small & efficient", "No cloud AI needed"],
  },
  {
    slug: "narrate-audiobook-maker",
    href: "/projects/narrate",
    title: "Narrate — Read Aloud",
    blurb:
      "Reads your documents aloud in a natural-sounding voice, powered by a small voice model that runs right on your own device — no cloud service, no ongoing cost, no data leaving your computer.",
    tags: ["Runs on your device", "Small & efficient"],
  },
  {
    slug: "brass-note-studios",
    href: "/projects/brass-note-studios",
    title: "Brass Note Studios",
    blurb:
      "AI is used only for the one part of the job that genuinely needs it. Everything else — organizing, filing, applying fixes — is simple, dependable automation, not more AI than necessary.",
    tags: ["Human + AI teamwork"],
  },
  {
    slug: "freeloom",
    href: "/projects/freeloom",
    title: "FreeLoom",
    blurb:
      "Turns everyday learning into organized records and reports without ever calling on an outside AI service — proof that a lot of what looks like an \"AI problem\" doesn't need AI at all.",
    tags: ["No cloud AI needed"],
  },
  {
    slug: "airgap-optical-transfer",
    href: "/projects/airgap",
    title: "Air-gapped Transfer",
    blurb:
      "Sends a file between two devices using nothing but light and a camera — no AI, no network, just clever, efficient engineering doing work that's often assumed to need something fancier.",
    tags: ["No cloud AI needed"],
  },
  {
    slug: "micromouse-maze-runner",
    href: "/projects/maze-runner",
    title: "Maze Runner",
    blurb:
      "Solves a maze using classic, well-understood techniques — a reminder that tried-and-true approaches still outperform AI for plenty of problems.",
    tags: ["No cloud AI needed"],
  },
  {
    slug: "custom-slms",
    href: "/consulting",
    title: "Custom AI, sized for you",
    blurb:
      "Businesses often get sold a one-size-fits-all AI subscription. I'm building toward something better: smaller, custom-fit AI systems that are faster, more affordable, and easier on the environment. Currently in the works, waiting on the right hardware.",
    tags: ["Small & efficient"],
    status: "roadmap",
  },
];

export const closingStatement =
  "This isn't a marketing angle — it's genuinely how I approach every project I take on: work efficiently, respect the planet's resources, and never use more technology than a problem actually needs.";
