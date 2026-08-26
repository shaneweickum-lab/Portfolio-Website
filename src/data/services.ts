export const tagline = "Right tool, Right task, Real value.";

export const slogan = "We build solutions for your problems like magic.";

export const positioning =
  "Sustainable AI & Automation Consulting — helping small businesses work smarter with right-sized automation and AI, without the cost, complexity, or waste of oversized systems.";

export const ourApproach = {
  kicker: "Our Approach",
  title: "Sustainable, by practice — not by claim",
  intro:
    "Most AI consulting defaults to the biggest model available, billed by the token, provisioned on demand. It works, but it's wasteful — most business problems don't need a frontier model, they need the right one, sized for the job.",
  points: [
    "Models are sized to the task. A 1B–7B parameter model, not a frontier API call, for work that doesn't need frontier-scale reasoning — classification, extraction, routing, summarization, the actual bulk of what small businesses need AI for.",
    "One base model, trained carefully, reused across every client. Each engagement adds a lightweight adapter on top rather than training a new model from scratch. Less compute spent per client, not more.",
    "Compute lives on owned hardware, not elastic cloud infrastructure spun up and torn down per project.",
    "Automation comes first where automation is enough. AI gets used where judgment is genuinely required — not by default, everywhere, because it's available.",
  ],
  closing:
    "The result: builds that sometimes take longer than a rushed cloud-first shop would quote — and outcomes that don't carry the compute cost, or the price tag, of solving a small problem with large-scale infrastructure.",
};

export const sustainabilityShort =
  "Sustainable AI, in practice: right-sized models instead of default frontier APIs, one base model reused per client instead of retrained per project, and compute that lives on owned hardware instead of elastic cloud spend. Sometimes slower. Always built to last.";

export const sustainabilityTimelineNote =
  "Timelines reflect sustainable build practices — right-sized models trained carefully once, not the fastest possible cloud-compute sprint. If speed matters more than footprint for your project, say so during intake and we'll scope accordingly.";

export const capabilityFlow = [
  "Consult",
  "Automate",
  "Build",
  "Integrate",
  "Modernize",
  "Deploy Private AI",
  "Support",
  "Train",
];

export const featuredService = {
  sectionLabel: "Entry Point",
  title: "Strategy Consultation",
  audienceLine: "For anyone unsure where to start.",
  price: "$997",
  priceNote: "initial engagement",
  timeline: "1–2 weeks",
  ctaLabel: "Start here",
  summary:
    "The entry point. I learn how your business actually operates — not just what software you currently use — and identify where automation, AI, and custom software would create real, measurable value. And just as importantly, where they wouldn't.",
  details: [
    "A full review of your workflows, repetitive tasks, and existing tools",
    "A ranked opportunity assessment — high-impact/low-complexity first",
    "A plain answer on what genuinely isn't worth automating",
  ],
};

const auditService = {
  sectionLabel: "Diagnostic",
  title: "Automation & AI Audit",
  accent: "signal" as const,
  audienceLine:
    "For businesses with systems or AI already in place, or evaluating a bigger build.",
  price: "from $2,200",
  priceNote: "scoped after intake",
  timeline: "2–3 weeks",
  ctaLabel: "Request scope",
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
};

const deterministicAutomationService = {
  sectionLabel: "Build",
  title: "Deterministic Automation",
  accent: "ember" as const,
  audienceLine: "For defined, repetitive work that needs to run the same way every time.",
  price: "from $4,200",
  priceNote: "project-based",
  timeline: "2–6 weeks",
  ctaLabel: "Get a quote",
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
};

const aiAutomationService = {
  sectionLabel: "Build",
  title: "AI Automation & Integration",
  accent: "ember" as const,
  audienceLine: "For work that genuinely benefits from judgment, not just rules.",
  price: "from $6,800",
  priceNote: "project-based",
  timeline: "3–8 weeks",
  sustainabilityNote: sustainabilityTimelineNote,
  ctaLabel: "Get a quote",
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
};

export const consultingCategory = {
  number: "01",
  title: "Consulting",
  layout: "ladder" as const,
  tiers: [auditService],
};

export const automationCategory = {
  number: "02",
  title: "Automation",
  layout: "ladder" as const,
  tiers: [deterministicAutomationService, aiAutomationService],
};

export const smallBusinessNote = {
  eyebrow: "Under 30 employees?",
  paragraph:
    "Standard pricing above is scoped for the systems and complexity most small teams run — but if your business has fewer than 30 employees, you may qualify for adjusted project pricing. Small operations shouldn't have to choose between enterprise-scale automation costs and staying on archaic systems for another five years.",
  ctaLabel: "Ask about adjusted pricing",
};

export const softwareCategory = {
  number: "03",
  title: "Software & Application Development",
  blurb:
    "Custom software delivered as a website, a browser-based application, an installable app, or native mobile software — whichever form factor actually fits the problem.",
  layout: "grid" as const,
  tiers: [
    {
      title: "Custom Automation Applications",
      audienceLine: "When no off-the-shelf product fits and you need the missing piece.",
      price: "from $16,000",
      priceNote: "project-based",
      ctaLabel: "Get a quote",
      note: sustainabilityTimelineNote,
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
    {
      title: "Website Development",
      audienceLine:
        "For businesses that need more than a template — marketing sites, CMS- and database-backed sites, and administrative interfaces.",
      price: "from $2,500",
      priceNote: "scoped by complexity",
      ctaLabel: "Get a quote",
      details: [
        "Marketing and business websites built around your business, not a template",
        "CMS-, database-, and API-connected sites where content or data needs to stay current",
        "Administrative interfaces and modernization for aging sites",
      ],
    },
    {
      title: "Web Application Development",
      audienceLine: "Custom software delivered through the browser — no traditional installation required.",
      price: "from $7,500",
      priceNote: "project-based",
      ctaLabel: "Get a quote",
      details: [
        "Internal tools, customer portals, dashboards, and administrative systems",
        "Scheduling, inventory, and workflow applications",
        "Database-backed and SaaS-style applications",
      ],
    },
    {
      title: "Progressive Web Applications",
      audienceLine:
        "An app-like experience — installable, capable of working offline where appropriate — without building separate native apps.",
      price: "from $6,000",
      priceNote: "project-based",
      ctaLabel: "Get a quote",
      details: [
        "Installable on supported devices without app-store distribution",
        "Offline capability where the workflow calls for it",
        "Often the better alternative to building several separate applications",
      ],
    },
    {
      title: "Desktop Application Development",
      audienceLine: "For Windows, macOS, and Linux where appropriate — software that runs directly on the machine.",
      price: "from $7,000",
      priceNote: "project-based",
      ctaLabel: "Get a quote",
      details: [
        "Internal tools, offline applications, and data-entry systems",
        "Hardware-control interfaces and equipment communication",
        "Legacy-system replacement and local automation utilities",
      ],
    },
    {
      title: "Android Application Development",
      audienceLine:
        "Internal, customer-facing, and field-service mobile applications. Currently offered on Android, with additional platforms considered as the practice grows.",
      price: "from $8,500",
      priceNote: "project-based",
      ctaLabel: "Get a quote",
      details: [
        "Internal and workforce applications for field teams",
        "Customer-facing and field-service apps",
        "Device integrations and specialized mobile utilities",
      ],
    },
  ],
};

export const addOnService = {
  title: "POS Migration & Custom Checkout",
  audienceLine: "POS integrations, card-reader connections, and custom checkout software.",
  price: "from $9,500",
  priceNote: "scoped after audit",
  ctaLabel: "Get a quote",
  details: [
    "POS integrations, card-reader connections, and data synchronization",
    "Processor evaluation — keep, migrate, or replace your current setup",
    "PCI-aware architecture — your software never touches raw card data",
  ],
};

export const integrationCategory = {
  number: "04",
  title: "Systems Integration",
  blurb:
    "Connect the systems you already use instead of forcing employees to move information between them by hand.",
  layout: "grid" as const,
  tiers: [
    {
      title: "Systems Integration",
      audienceLine: "For businesses whose existing software doesn't talk to each other.",
      price: "from $2,800",
      priceNote: "project-based",
      ctaLabel: "Discuss your project",
      details: [
        "API integrations, webhooks, and data synchronization",
        "CRM, accounting, inventory, and scheduling integrations",
        "Website-to-business-system and internal system communication",
      ],
    },
    addOnService,
    {
      title: "Hardware & IoT Integration",
      audienceLine: "Connect physical devices to the software and automation systems that run your business.",
      price: "Scoped after consultation",
      priceNote: "every integration is different",
      ctaLabel: "Discuss your project",
      details: [
        "Device communication, sensors, and equipment status monitoring",
        "Smart-device automation and connected-device workflows",
        "Bluetooth/BLE and Matter-compatible devices, integrated where they genuinely fit",
      ],
    },
  ],
};

export const modernizationCategory = {
  number: "05",
  title: "Legacy System Modernization",
  blurb:
    "Replace what needs replacing. Integrate what still works. We don't force a full-system replacement when it isn't the answer.",
  layout: "grid" as const,
  tiers: [
    {
      title: "Legacy System Modernization",
      audienceLine:
        "For mission-critical systems that still work but are getting harder to maintain — DOS software, Access databases, aging internal tools, Excel-based systems of record.",
      price: "from $4,500",
      priceNote: "scoped after assessment",
      ctaLabel: "Request scope",
      details: [
        "Legacy system assessment and an incremental modernization strategy",
        "Modern interfaces, API wrappers, and integration around software that still works",
        "Database modernization, data migration, and reporting modernization",
      ],
    },
  ],
};

export const privateAiCategory = {
  number: "06",
  title: "Private & Local AI",
  blurb: "AI capability that stays within infrastructure you control, sized to the problem it's actually solving.",
  layout: "grid" as const,
  tiers: [
    {
      title: "Private & Local AI Deployment",
      sustainable: true,
      audienceLine: "For businesses that want AI capability with more control over their infrastructure and data.",
      price: "Custom",
      priceNote: "scoped after consultation",
      ctaLabel: "Explore deployment",
      details: [
        "Local AI deployment, private assistants, and internal knowledge systems",
        "Retrieval-augmented generation (RAG) over your own documents",
        "AI workstation/server configuration and model optimization",
      ],
    },
    {
      title: "Custom Small Language Models",
      sustainable: true,
      comingSoon: true,
      audienceLine:
        "Business-specific AI systems built on appropriately sized models — not the largest model available. Waiting on dedicated training/inference hardware before taking this on — get in touch to be first in line once it's available.",
      price: "Custom",
      priceNote: "scoped by workload",
      ctaLabel: "Join the waitlist",
      details: [
        "Domain adaptation, LoRA adapters, and tool calling on top of a base SLM",
        "RAG and context compilation tied into your own systems",
        "Sized to the actual workload — model size is determined by the problem, not marketed as the product",
      ],
    },
  ],
};

export const technologyPrinciple = {
  eyebrow: "Sustainable AI Engineering",
  title: "The Technology Principle",
  paragraphs: [
    "We don't believe every business problem needs AI, and we don't believe every AI problem needs the largest model available.",
    "Every solution is evaluated against the same criteria before it's recommended:",
  ],
  criteria: [
    "Reliability",
    "Cost",
    "Performance",
    "Privacy",
    "Maintainability",
    "Infrastructure requirements",
    "Energy & compute efficiency",
  ],
  closing:
    "If a deterministic workflow can solve the problem more reliably and efficiently than an AI system, we use the deterministic workflow.",
};

export const supportCategory = {
  number: "07",
  title: "Managed Support & Optimization",
  blurb: "Ongoing care for what's already been built, plus a second look at systems built elsewhere.",
  layout: "grid" as const,
  tiers: [
    {
      title: "Automation & Technology Support",
      audienceLine: "Ongoing maintenance for automation, integrations, and AI systems after they go live.",
      price: "from $350/mo",
      priceNote: "custom plans available",
      ctaLabel: "Get a quote",
      details: [
        "System, automation, and integration health monitoring",
        "Bug fixes, minor improvements, and scheduled maintenance",
        "Diagnostics and performance monitoring, including AI systems",
        "Clear scope and response expectations, not unlimited support",
      ],
    },
    {
      title: "Automation & AI Optimization",
      sustainable: true,
      audienceLine: "For systems already in production — built by us or by someone else.",
      price: "from $1,200",
      priceNote: "project-based",
      ctaLabel: "Get a quote",
      details: [
        "Workflow and automation performance review",
        "AI usage analysis — prompt/system optimization, model selection, cost reduction",
        "Replacing unreliable AI workflows with deterministic automation where that's the better fit",
      ],
    },
  ],
};

export const trainingCategory = {
  number: "08",
  title: "Training & Transition",
  blurb: "Your systems shouldn't depend on one person forever.",
  layout: "grid" as const,
  tiers: [
    {
      title: "Technology Training & Knowledge Transfer",
      audienceLine: "For teams who want to operate and maintain what we build.",
      price: "from $900",
      priceNote: "scoped by team size",
      ctaLabel: "Discuss your project",
      details: [
        "Administrator training and staff onboarding",
        "Technical documentation and deployment procedures",
        "Troubleshooting, monitoring, and maintenance training",
      ],
    },
    {
      title: "Managed-to-Internal Transition",
      audienceLine: "For clients whose internal team is ready to take systems over.",
      price: "Custom",
      priceNote: "scoped by system complexity",
      ctaLabel: "Build a transition plan",
      details: [
        "Architecture review and full documentation transfer",
        "Credential and infrastructure transition",
        "Administrator training and recorded knowledge transfer",
      ],
    },
  ],
};

export const serviceCategories = [
  softwareCategory,
  integrationCategory,
  modernizationCategory,
  privateAiCategory,
  supportCategory,
  trainingCategory,
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
