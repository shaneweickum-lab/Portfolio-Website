export const positioning = {
  title: "SLM, Deterministic & Small Neural Network Engineering",
  statement:
    "I design intelligent systems around specialized, efficient computational components — deterministic software where the problem allows it, small neural networks where learned behavior is useful, and small language models where semantic reasoning is genuinely required.",
  closing:
    "My focus isn't building larger models. It's engineering systems that know when a model is necessary, which model is appropriate, and when no model should be used at all.",
};

export const heroLede = {
  kicker: "My Engineering Philosophy",
  title: "I don't believe every problem needs a large model.",
  intro:
    "My engineering approach is built around matching the computational mechanism to the problem — not defaulting to whatever's biggest, newest, or easiest to call through an API. Every system I build gets decomposed into individual capabilities, and each capability is routed to the smallest, most appropriate mechanism that can solve it reliably.",
};

export type PhilosophyLayer = {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  examples: string[];
  principle: string;
};

export const layers: PhilosophyLayer[] = [
  {
    number: "01",
    title: "Deterministic Systems",
    subtitle: "Traditional engineering, first",
    description:
      "Algorithms, rules, databases, APIs, state machines, and explicit validation logic — used whenever a problem can be solved reliably without inference. This is the foundation every other layer sits on, not a fallback for when AI is unavailable.",
    examples: [
      "Rules engines and state machines",
      "Structured validation and parsing",
      "Scheduled jobs, webhooks, and APIs",
      "Classic algorithms and graph search",
    ],
    principle: "If a problem can be solved deterministically, it should not require inference.",
  },
  {
    number: "02",
    title: "Small Neural Networks",
    subtitle: "Learned behavior, without language",
    description:
      "When a problem benefits from learned behavior but doesn't require language-level reasoning, a specialized small neural network outperforms both a hand-written rule set and a general-purpose language model — at a fraction of the compute.",
    examples: [
      "Classification and ranking",
      "Pattern recognition and anomaly detection",
      "Signal processing and specialized perception",
      "Lightweight prediction and decision support",
    ],
    principle: "Use the smallest learned system capable of solving the problem well.",
  },
  {
    number: "03",
    title: "Small Language Models",
    subtitle: "Semantic reasoning, sized to the task",
    description:
      "Reserved for problems that actually require language or semantic reasoning — not used as a default just because a problem happens to involve text. The objective is never the biggest available model; it's the smallest one capable of the required reasoning.",
    examples: [
      "Natural-language understanding and intent interpretation",
      "Semantic classification and routing",
      "Structured extraction and code reasoning",
      "Translating between human language and machine operations",
    ],
    principle: "Use the smallest model capable of performing the required reasoning.",
  },
  {
    number: "04",
    title: "Orchestration",
    subtitle: "Composed capability, not monolithic intelligence",
    description:
      "Complex systems don't need to depend on one monolithic model. Capabilities can be composed: deterministic code hands off to a small neural network, which hands off to an SLM, which calls a tool, which hands back to deterministic execution. Each component does the job it's actually suited for.",
    examples: [
      "Deterministic code → small neural network → SLM → tools → deterministic execution",
      "Confidence-based escalation between layers",
      "Explicit interfaces between capabilities, not implicit prompt-chaining",
      "Systems that stay useful when any one model is replaced",
    ],
    principle: "Think in capability surfaces, not monolithic AI systems.",
  },
];

export const ocp = {
  name: "OCP",
  fullName: "Orchestrated Capability Principle",
  framing: "This is my engineering principle, not an established industry standard.",
  definition:
    "A system should orchestrate the smallest and most appropriate computational capability required to accomplish each task, rather than relying on a single general-purpose intelligence for the entire problem.",
  explanation:
    "OCP is based on the idea that modern intelligent systems should be composed from multiple types of capability, escalating only as far as each task genuinely requires — and no further.",
  flow: [
    "Deterministic Logic",
    "Algorithms",
    "Small Neural Networks",
    "Specialized SLMs",
    "General Models (when necessary)",
    "Tools / External Systems",
    "Deterministic Execution",
  ],
  closing: "Intelligence doesn't have to come from one model. It can emerge from orchestration of specialized capabilities.",
};

export const capabilitySurface = {
  title: "What I mean by a \"capability surface\"",
  definition:
    "A capability surface is the full set of operations, reasoning abilities, tools, models, algorithms, and deterministic functions available to a system. The architecture's job is to route each task to the right point on that surface — not to hand every task to the same general-purpose model by default.",
  flow: {
    input: "User Intent",
    steps: ["Semantic Interpretation", "Capability Router"],
    branches: ["Deterministic Logic", "Small Neural Network", "SLM Reasoning"],
    merge: ["Tools", "Deterministic Execution"],
  },
};

export const systemsPerspective = {
  title: "AI engineering, as a systems problem",
  intro:
    "I approach AI engineering from a systems perspective, not a model-training perspective. Before reaching for a model, the questions I actually ask are:",
  questions: [
    "Does this problem actually require an LLM?",
    "Can deterministic logic solve this instead?",
    "Would a 10M–100M parameter neural network be sufficient?",
    "Would a specialized SLM outperform a much larger general model for this task?",
    "Can multiple small models outperform one large model through orchestration?",
    "Can inference be reduced by moving work into deterministic systems?",
    "Can models be specialized rather than generalized?",
    "Can confidence determine when a system should escalate to another capability?",
    "Can the architecture remain useful even when individual models are replaced?",
  ],
  closing: "AI is one component of an engineered system. It isn't the system itself.",
};

export const whySmallModels = {
  title: "Why small models",
  intro:
    "None of this comes from a belief that small models are always better — they aren't. It comes from treating model size as an engineering variable, not a marketing feature.",
  benefits: [
    "Lower inference cost",
    "Lower latency",
    "Easier deployment",
    "Local and offline execution",
    "Smaller memory requirements",
    "Easier specialization and fine-tuning",
    "Easier evaluation",
    "Greater architectural control",
    "Better suitability for embedded and edge environments",
    "Room to run several specialized models instead of one general one",
    "Reduced dependence on massive centralized infrastructure",
  ],
  principle: "The best model is the smallest model that reliably satisfies the capability requirement.",
};

export type DecisionStep = {
  question: string;
  no: string;
};

export const decisionModel: DecisionStep[] = [
  { question: "Does the problem require inference?", no: "Use deterministic engineering." },
  { question: "Does it require language or semantic reasoning?", no: "Use a specialized small neural network." },
  { question: "Does it require a large, general-purpose model?", no: "Use an SLM." },
];

export const decisionModelEscalation = "Escalate to a larger model.";
export const decisionModelClosing = "Return to deterministic execution whenever possible.";

export type BuildStep = {
  number: string;
  title: string;
  description: string;
};

export const howIBuild: BuildStep[] = [
  { number: "01", title: "Decompose", description: "Break the problem into individual capabilities." },
  {
    number: "02",
    title: "Classify",
    description: "Determine whether each capability is deterministic, statistical, neural, semantic, or tool-based.",
  },
  { number: "03", title: "Minimize", description: "Choose the smallest computational mechanism capable of solving each capability." },
  { number: "04", title: "Specialize", description: "Train or configure small models around specific domains when appropriate." },
  { number: "05", title: "Orchestrate", description: "Connect capabilities through explicit interfaces and routing." },
  { number: "06", title: "Validate", description: "Measure accuracy, latency, cost, reliability, and failure modes." },
  {
    number: "07",
    title: "Escalate",
    description: "Only use more expensive or more capable models when lower-level capabilities can't satisfy the requirement.",
  },
];

export type CapabilityTag = "Deterministic" | "Small Neural Network" | "SLM" | "Orchestration" | "AI Systems" | "Automation";

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
      "A capability router in miniature: printed text routes to a small OCR model, handwriting routes to a different, specialized small model, and every recognized answer is then solved by fully deterministic code — never by asking a model to do arithmetic.",
    tags: ["Small Neural Network", "Deterministic", "Orchestration"],
  },
  {
    slug: "narrate-audiobook-maker",
    href: "/projects/narrate",
    title: "Narrate — Read Aloud",
    blurb:
      "Runs a real 82M-parameter neural voice model entirely on-device instead of a cloud TTS API — a direct case for \"the smallest model that reliably does the job,\" not the largest one available.",
    tags: ["Small Neural Network", "Deterministic"],
  },
  {
    slug: "brass-note-studios",
    href: "/projects/brass-note-studios",
    title: "Brass Note Studios",
    blurb:
      "A language model is used only for the part of the loop that genuinely needs judgment — everything around it (logging, filing, applying, and shipping the fix) is deterministic automation, not more inference.",
    tags: ["AI Systems", "Orchestration", "Automation"],
  },
  {
    slug: "freeloom",
    href: "/projects/freeloom",
    title: "FreeLoom",
    blurb:
      "Its classify/retrieve/compose pipeline is local, deterministic, and testable without a network call, by design — proof that a lot of what looks like an \"AI problem\" is really a data-modeling problem.",
    tags: ["Deterministic", "Automation"],
  },
  {
    slug: "airgap-optical-transfer",
    href: "/projects/airgap",
    title: "Air-gapped Transfer",
    blurb:
      "Zero models anywhere in the stack — fountain codes, homography, and signal classification, all deterministic algorithms doing work that would otherwise get outsourced to \"just add ML.\"",
    tags: ["Deterministic"],
  },
  {
    slug: "micromouse-maze-runner",
    href: "/projects/maze-runner",
    title: "Maze Runner",
    blurb:
      "Five pathfinding algorithms, zero learned components — a deliberate demonstration that classical graph search still outperforms a model for problems it was already built to solve.",
    tags: ["Deterministic"],
  },
  {
    slug: "custom-slms",
    href: "/consulting",
    title: "Custom Small Language Models",
    blurb:
      "The SLM layer of this philosophy, as a service offering: domain-adapted small models instead of a default frontier API call. Currently on the roadmap, waiting on dedicated training hardware.",
    tags: ["SLM"],
    status: "roadmap",
  },
];

export const closingStatement =
  "This isn't a slogan I put on a page. It's the decomposition I actually run before writing the first line of a new system — and the reason the projects on this site look the way they do.";
