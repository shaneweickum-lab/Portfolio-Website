export function SectionHeader({
  kicker,
  title,
  description,
  accent = "signal",
}: {
  kicker: string;
  title: string;
  description?: string;
  accent?: "signal" | "ember" | "wonder";
}) {
  const accentClass = {
    signal: "text-signal",
    ember: "text-ember",
    wonder: "text-wonder",
  }[accent];

  return (
    <div className="max-w-2xl">
      <p className={`font-mono text-xs uppercase tracking-[0.2em] ${accentClass}`}>
        {kicker}
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-4 text-lg text-muted">{description}</p>
      )}
    </div>
  );
}
