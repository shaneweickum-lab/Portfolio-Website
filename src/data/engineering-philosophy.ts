export const positioning = {
  title: "Sustainable AI Engineer",
  statement:
    "I build AI and technology that's efficient, reliable, and easy on the planet — choosing exactly as much computing power as a problem calls for, running it as close to home as I can, and reaching for something bigger and more powerful when that's genuinely the right call, not just the easy one.",
  closing:
    "My goal isn't to build the biggest or most impressive-sounding AI system. It's to build the right one — something that works well, that I'm proud to stand behind, and that treats the energy and resources it uses like they actually matter. Because they do.",
};

export const heroLede = {
  kicker: "My Philosophy",
  title: "Good technology doesn't have to be bigger than the problem it's solving.",
  intro:
    "A lot of AI today defaults to the biggest, most powerful option available, whether or not the moment actually calls for it. I build differently. I start simple, reach for efficient and energy-conscious tools whenever they'll genuinely do the job, and bring in something bigger and more powerful exactly when it earns its place — never just because it's available. To me, that's not a limitation. It's care.",
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
      "If a problem can be solved with straightforward, well-tested technology, that's where I start — before reaching for AI at all. Simple solutions are honest ones: easier to trust, cheaper to run, and far less likely to let you down.",
  },
  {
    number: "02",
    title: "Right-sized, not oversized",
    description:
      "Not every task needs a massive AI model, and not every task should avoid one, either. I try to match the size of the tool to the size of the problem — sometimes that's something small and efficient, and sometimes it's genuinely a large, powerful model. What matters to me is that it's a decision, not a default.",
  },
  {
    number: "03",
    title: "AI where it earns its place",
    description:
      "AI is genuinely powerful, and used well, it can do real good. I bring it in where it earns its place — never just because it's trendy, and never just because it's available.",
  },
  {
    number: "04",
    title: "Built to work together",
    description:
      "Good systems are usually a team effort between several efficient, focused tools rather than one giant system trying to do everything at once. I like building that way — it feels more like craftsmanship than assembly.",
  },
];

export const edgeComputing = {
  title: "Why I care about edge computing",
  paragraphs: [
    "Most AI today runs far away, in enormous data centers, even for small everyday tasks. \"Edge computing\" simply means running technology closer to home — on your own device, or on nearby hardware — instead of always shipping everything off to a distant server.",
    "When it's possible, I like to build things this way. It usually means faster results for you, better privacy since your information doesn't have to travel as far, and a lighter footprint on the planet we all share. That last part matters to me more than I can really fit into a sales pitch.",
  ],
};

export const whyItMatters = {
  title: "Why energy-efficient AI matters",
  intro:
    "None of this comes from a belief that smaller or simpler is always better — it isn't, every time, and I've built plenty of things that genuinely needed real power to work at all. It comes from treating energy and computing power as things worth respecting, and using exactly what a task deserves — no more, and no less.",
  benefits: [
    "Uses less electricity",
    "Costs less to run over time",
    "Works even with a weak or no internet connection",
    "Keeps your information more private",
    "Easier to maintain and trust",
    "Less reliant on giant, centralized infrastructure",
  ],
  principle: "The right solution is the one that actually fits the job — nothing more than it needs, and nothing less than it deserves.",
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
  "This isn't a marketing angle. It's genuinely how I show up for every project I take on — building with intention, respecting the resources this all runs on, and never using more than a problem actually needs. It might sound like a small thing. It doesn't feel small to me.";
