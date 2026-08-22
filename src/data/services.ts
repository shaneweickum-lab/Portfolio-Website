export const tagline = "Right Tool. Right Task. Real Value.";

export const positioning =
  "Automation & AI Integration Consulting — helping small businesses work smarter by integrating automation, AI, and custom software where they actually make sense.";

export const featuredService = {
  title: "Automation & AI Strategy Consultation",
  price: "$997",
  priceNote: "initial engagement",
  summary:
    "The entry point. I learn how your business actually operates — not just what software you currently use — and identify where automation, AI, and custom software would create real, measurable value. And just as importantly, where they wouldn't.",
  details: [
    "A full review of your workflows, repetitive tasks, and existing tools",
    "A ranked opportunity assessment — high-impact/low-complexity first",
    "A plain answer on what genuinely isn't worth automating",
  ],
};

export const services = [
  {
    title: "Automation & AI Audits",
    accent: "signal" as const,
    summary:
      "A rigorous second look at your workflows, software, and any AI you've already adopted.",
    details: [
      "Workflow, data-movement, and communication-process review",
      "An Automation Opportunity Report, ranked by impact and complexity",
      "An honest call on what to leave alone — telling you what not to spend money on builds more trust than another pitch",
    ],
    proof: {
      label: "Fact Lock",
      description:
        "a Claude Skill I built and use myself, enforcing the same source-grounding discipline an audit checks for.",
      href: "/projects/skills/fact-lock",
    },
  },
  {
    title: "Deterministic Automation",
    accent: "ember" as const,
    summary: "Reliable automation for predictable work — no LLM where none is needed.",
    details: [
      "APIs, webhooks, scheduled jobs, and rules engines",
      "Forms, integrations, and traditional software workflows",
      "Built for exact reproducibility, not just plausible output",
    ],
    proof: {
      label: "FreeLoom",
      description:
        "its classify/retrieve/compose pipeline is local, deterministic, and testable without a network call — by design.",
      href: "/projects/freeloom",
    },
  },
  {
    title: "AI Automation & Integration",
    accent: "ember" as const,
    summary: "AI introduced only where it provides real, distinct value.",
    details: [
      "Document analysis, classification, extraction, and summarization",
      "Customer-communication assistance, intelligent routing, internal assistants",
      "Cost, reliability, and privacy weighed as part of the design, not an afterthought",
    ],
    proof: {
      label: "Brass Note Studios",
      description:
        "runs a hand-built chatbot with an automated fallback-to-fix loop — usage data becomes a reviewable change, not an ignored log.",
      href: "/projects/brass-note-studios",
    },
  },
  {
    title: "Custom Automation Applications",
    accent: "signal" as const,
    summary:
      "When no off-the-shelf product quite fits, I build the missing piece — internal tools, dashboards, portals, integrations, and AI-enabled software designed around your actual business.",
    details: [
      "Custom internal tools and dashboards",
      "Integrations between existing systems",
      "Software shaped around your workflow, not the other way around",
    ],
    proof: {
      label: "the engineering",
      description: "the same rigor behind every shipped project on this site.",
      href: "/projects",
    },
  },
];

export const howIWork = [
  {
    step: "1",
    title: "Understand",
    description: "I learn how your business actually operates — not just what software you currently use.",
  },
  {
    step: "2",
    title: "Evaluate",
    description:
      "I identify repetitive processes, bottlenecks, integration opportunities, and where technology can create measurable value.",
  },
  {
    step: "3",
    title: "Recommend",
    description:
      "I determine whether each opportunity is best addressed with traditional automation, AI, existing software, custom development, or simply left alone.",
  },
  {
    step: "4",
    title: "Build",
    description: "I implement the highest-value solutions and integrate them into your existing workflow.",
  },
  {
    step: "5",
    title: "Optimize",
    description:
      "Automation isn't a one-time installation. I help measure results, control costs, and improve the system over time.",
  },
];

export const philosophy = {
  title: "Not Everything Needs AI",
  paragraphs: [
    "AI is incredibly powerful — but it isn't the answer to every business problem. Sometimes the best solution is a simple automation. Sometimes it's an API integration. Sometimes it's custom software. Sometimes AI can transform a workflow. And sometimes the best decision is to leave a process alone.",
    "My job is to determine which is which. I help businesses build technology strategies around value, reliability, scalability, and cost — rather than adopting technology simply because it's new.",
    "The goal isn't to automate everything. The goal is to build a business that operates better.",
  ],
  closing:
    "Technology should eliminate unnecessary work — not unnecessary people. When AI isn't the best tool for the job, I won't recommend it.",
};

export const whoIHelp = {
  audience:
    "Small businesses, local businesses, nonprofits, professional services, and growing organizations that want to modernize their operations without overcomplicating them.",
  location:
    "Based in Central Florida — I work with local businesses as well as organizations beyond the region.",
};
