"use client";

import { useState, type ReactNode } from "react";

const INTAKE_EMAIL = "shane@sowedandrooted.com";

const FIELD_LABELS: Record<string, string> = {
  full_name: "Full name",
  email: "Email",
  phone: "Phone",
  business_name: "Business name",
  website: "Website",
  industry: "Industry",
  team_size: "Team size",
  current_tools: "Software and tools currently in use",
  existing_automation: "Existing automation or AI",
  core_problem: "What's costing the most time or money",
  current_process: "How it's done today",
  tried_already: "What's already been tried",
  success_looks_like: "What success looks like in 3 months",
  speed_vs_sustainability: "Speed vs. sustainable build",
  needs: "What they think this needs",
  form_factor: "Solution form factor",
  involves_payments: "Involves payments?",
  current_processor: "Current payment processor",
  processor_intent: "Processor intent",
  reader_details: "Card reader details",
  timeline: "Timeline",
  budget: "Budget range",
  anything_else: "Anything else",
};

const FIELD_ORDER = Object.keys(FIELD_LABELS);

function buildMailto(data: FormData): string {
  const lines: string[] = [];
  for (const key of FIELD_ORDER) {
    const values = data.getAll(key).filter((v) => String(v).trim().length > 0);
    if (values.length === 0) continue;
    lines.push(`${FIELD_LABELS[key]}: ${values.join(", ")}`);
  }
  const business = data.get("business_name");
  const subject = business
    ? `Project intake — ${business}`
    : "Project intake";
  const body = lines.join("\n");
  return `mailto:${INTAKE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mb-5">
      <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted">
        {label}
        {optional ? (
          <span className="ml-1.5 lowercase tracking-normal text-faint">(optional)</span>
        ) : (
          <span className="text-signal"> *</span>
        )}
      </label>
      <div className="bracket-wrap">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-[2px] border border-border bg-surface px-3.5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-faint";

function ChoicePill({
  type,
  name,
  value,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-0 rounded-[2px] border border-border bg-surface px-3.5 py-2 font-mono text-[12.5px] text-muted transition-colors hover:border-faint hover:text-foreground has-[:checked]:border-[var(--accent-dim)] has-[:checked]:bg-signal/10 has-[:checked]:text-signal">
      <input
        type={type}
        name={name}
        value={value}
        className="peer sr-only"
        onChange={(e) => onChange?.(e.target.checked ? value : "")}
      />
      <span className="hidden peer-checked:inline">✓&nbsp;</span>
      {value}
    </label>
  );
}

function ChoiceGroup({
  type,
  name,
  options,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  options: string[];
  onChange?: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <ChoicePill key={opt} type={type} name={name} value={opt} onChange={onChange} />
      ))}
    </div>
  );
}

function SectionHead({ num, title, desc }: { num: string; title: string; desc?: string }) {
  return (
    <div className="mb-5 pt-8 border-t border-border first:border-t-0 first:pt-0">
      <div className="mb-1 flex items-baseline gap-3">
        <span className="font-mono text-xs text-signal">{num}</span>
        <span className="font-display text-lg font-semibold text-foreground">{title}</span>
      </div>
      {desc && <p className="text-[13.5px] text-faint">{desc}</p>}
    </div>
  );
}

export function IntakeForm() {
  const [involvesPayments, setInvolvesPayments] = useState(false);
  const [status, setStatus] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    window.location.href = buildMailto(data);
    setStatus(
      "Opening your email client with the details filled in — send it over and I'll be in touch within 2 business days.",
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10 border-b border-border pb-8">
        <div className="mb-3.5 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-signal before:h-px before:w-[18px] before:bg-[var(--accent-dim)] before:content-['']">
          Project Intake — 01 of 01
        </div>
        <h1 className="mb-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-[38px]">
          Tell me what you&apos;re building.
        </h1>
        <p className="max-w-[52ch] text-[15px] text-muted">
          This isn&apos;t a contact form — it&apos;s the same discovery I&apos;d run in a first
          working session. The more precise you are, the faster I can tell you whether this needs
          AI, automation, custom software, or nothing at all.
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        <div>
          <SectionHead num="01" title="Contact & Business" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input type="text" name="full_name" required className={inputClass} />
            </Field>
            <Field label="Email">
              <input type="email" name="email" required className={inputClass} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" optional>
              <input type="tel" name="phone" className={inputClass} />
            </Field>
            <Field label="Business name">
              <input type="text" name="business_name" required className={inputClass} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Website" optional>
              <input type="url" name="website" placeholder="https://" className={inputClass} />
            </Field>
            <Field label="Industry">
              <input
                type="text"
                name="industry"
                required
                placeholder="e.g. HVAC, salon, nonprofit"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Team size" optional>
            <ChoiceGroup
              type="radio"
              name="team_size"
              options={["Just me", "2-5", "6-15", "16-30", "31+"]}
            />
          </Field>
        </div>

        <div>
          <SectionHead
            num="02"
            title="Current Setup"
            desc="What you're already working with — not the ideal stack, the real one."
          />
          <Field label="Software and tools currently in use">
            <textarea
              name="current_tools"
              required
              placeholder="e.g. QuickBooks, Square, Gmail, spreadsheets, a scheduling app..."
              className={`${inputClass} min-h-[84px] resize-y`}
            />
          </Field>
          <Field label="Any automation or AI already in place?" optional>
            <textarea
              name="existing_automation"
              placeholder="Zapier flows, chatbots, macros, anything half-built or abandoned counts."
              className={`${inputClass} min-h-[84px] resize-y`}
            />
          </Field>
        </div>

        <div>
          <SectionHead
            num="03"
            title="The Problem"
            desc="Describe the actual pain, in your own words — not the solution you think you need."
          />
          <Field label="What process is costing you the most time or money right now?">
            <textarea name="core_problem" required className={`${inputClass} min-h-[84px] resize-y`} />
          </Field>
          <Field label="Walk me through how it's done today, step by step" optional>
            <textarea name="current_process" className={`${inputClass} min-h-[84px] resize-y`} />
          </Field>
          <Field label="What have you already tried?" optional>
            <textarea
              name="tried_already"
              placeholder="Other tools, other consultants, an employee's side project — anything."
              className={`${inputClass} min-h-[84px] resize-y`}
            />
          </Field>
        </div>

        <div>
          <SectionHead num="04" title="The Vision" />
          <Field label="What does success look like in 3 months?" optional>
            <textarea name="success_looks_like" className={`${inputClass} min-h-[84px] resize-y`} />
          </Field>

          <Field label="How much does build speed matter vs. doing this the sustainable way?" optional>
            <ChoiceGroup
              type="radio"
              name="speed_vs_sustainability"
              options={["Speed matters most", "Sustainability matters most", "Somewhere in between — let's talk"]}
            />
          </Field>

          <Field label="What do you think this needs?" optional>
            <ChoiceGroup
              type="checkbox"
              name="needs"
              options={[
                "Simple automation",
                "AI / LLM integration",
                "Custom software",
                "Tool-to-tool integration",
                "Not sure — that's your job",
              ]}
            />
          </Field>

          <Field label="What form should the solution take?" optional>
            <ChoiceGroup
              type="checkbox"
              name="form_factor"
              options={["Web app", "Desktop app", "Mobile app", "Internal tool only", "Not sure"]}
            />
          </Field>

          <Field label="Does this involve payments or card processing?" optional>
            <ChoiceGroup
              type="radio"
              name="involves_payments"
              options={["Yes", "No"]}
              onChange={(v) => setInvolvesPayments(v === "Yes")}
            />
          </Field>

          {involvesPayments && (
            <div className="mt-1.5 border-l-2 border-[var(--accent-dim)] bg-signal/5 py-1 pl-5">
              <Field label="Current payment processor" optional>
                <input
                  type="text"
                  name="current_processor"
                  placeholder="Square, Clover, none, etc."
                  className={inputClass}
                />
              </Field>
              <Field label="Are you looking to keep, migrate off of, or replace it?" optional>
                <select name="processor_intent" className={inputClass}>
                  <option value="">Select one</option>
                  <option>Keep it, just need it integrated into new software</option>
                  <option>Open to migrating if there&apos;s a good reason to</option>
                  <option>Actively want to move off my current processor</option>
                  <option>Not sure yet</option>
                </select>
              </Field>
              <Field label="Do you need a physical card reader connected to custom software?" optional>
                <textarea
                  name="reader_details"
                  placeholder="e.g. desktop app that needs to talk to a card swiper for in-person checkout"
                  className={`${inputClass} min-h-[84px] resize-y`}
                />
              </Field>
            </div>
          )}
        </div>

        <div>
          <SectionHead num="05" title="Practical Details" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Timeline" optional>
              <select name="timeline" className={inputClass}>
                <option value="">Select one</option>
                <option>ASAP</option>
                <option>1–3 months</option>
                <option>3–6 months</option>
                <option>Just exploring</option>
              </select>
            </Field>
            <Field label="Budget range" optional>
              <select name="budget" className={inputClass}>
                <option value="">Select one</option>
                <option>Starting with the $997 audit</option>
                <option>$1,000 – $5,000</option>
                <option>$5,000 – $15,000</option>
                <option>$15,000+</option>
                <option>Not sure yet</option>
              </select>
            </Field>
          </div>
          <Field label="Anything else I should know?" optional>
            <textarea name="anything_else" className={`${inputClass} min-h-[84px] resize-y`} />
          </Field>
        </div>

        <div className="mt-11 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-7">
          <button
            type="submit"
            className="rounded-[2px] bg-signal px-7 py-4 font-mono text-[13px] font-medium uppercase tracking-wider text-[#191008] transition-[filter] hover:brightness-110 active:translate-y-px"
          >
            Send intake →
          </button>
          <span className="max-w-[32ch] text-xs text-faint">
            You&apos;ll hear back within 2 business days with next steps or a scheduling link.
          </span>
        </div>
        {status && (
          <p className="mt-4 font-mono text-[12.5px] text-ok">{status}</p>
        )}
      </form>
    </div>
  );
}
