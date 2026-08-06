import type { ReactNode } from "react";

export function Tag({
  children,
  accent = "muted",
}: {
  children: ReactNode;
  accent?: "signal" | "ember" | "wonder" | "muted";
}) {
  const colorClass = {
    signal: "border-signal/40 text-signal",
    ember: "border-ember/40 text-ember",
    wonder: "border-wonder/40 text-wonder",
    muted: "border-border text-muted",
  }[accent];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {children}
    </span>
  );
}
