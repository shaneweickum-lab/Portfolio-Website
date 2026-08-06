export const bio = {
  headline: "AI engineer. Storyteller. Compulsive worldbuilder.",
  intro: [
    "I spend my working hours building AI systems — agentic pipelines, tool-using models, and the unglamorous infrastructure that makes them reliable in production instead of just impressive in a demo.",
    "I spend the rest of my hours somewhere else entirely: building fictional worlds, drafting novels, and chasing down the kind of internal consistency that makes a place feel real. Both halves are the same instinct — take something sprawling and give it structure.",
  ],
};

export const skillGroups = [
  {
    title: "AI Engineering",
    accent: "signal" as const,
    skills: [
      "LLM application architecture",
      "Agentic systems & tool use",
      "RAG & retrieval pipelines",
      "Prompt engineering & evals",
      "TypeScript / Python",
      "Next.js & Vercel",
    ],
  },
  {
    title: "Creative & Authoring",
    accent: "ember" as const,
    skills: [
      "Long-form fiction",
      "Worldbuilding systems",
      "Narrative structure & editing",
      "Voice & style development",
      "Serialized storytelling",
      "Collaborative fiction",
    ],
  },
];

export const timeline = [
  {
    year: "Now",
    title: "Building AI-native products",
    description:
      "Designing and shipping agentic AI systems, while writing fiction and expanding a set of interconnected fictional worlds on the side.",
  },
  {
    year: "Earlier",
    title: "Cutting my teeth on applied ML & software engineering",
    description:
      "Learned the discipline of shipping software that has to actually work — testing, iteration, and taking feedback seriously.",
  },
  {
    year: "Always",
    title: "Writing",
    description:
      "Before any of it was a career, it was notebooks full of maps, timelines, and characters. That part never stopped.",
  },
];
