import { Check, MessageSquare, Clock, Layers } from "lucide-react";

function CircularScore({ value }: { value: number }) {
  const size = 160;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.16 195)" />
            <stop offset="100%" stopColor="oklch(0.7 0.2 305)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-muted)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scoreGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out", filter: "drop-shadow(0 0 8px oklch(0.78 0.16 195 / 0.5))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-4xl font-display font-bold text-gradient">{value}%</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">Accuracy</div>
        </div>
      </div>
    </div>
  );
}

const AMBIG = [
  { word: "Water", prob: 96, selected: true },
  { word: "Waiter", prob: 3 },
  { word: "Later", prob: 1 },
];

const SUMMARY = [
  { label: "Words Spoken", value: "1,284", icon: MessageSquare },
  { label: "Active Time", value: "2h 14m", icon: Clock },
  { label: "Sessions Today", value: "7", icon: Layers },
];

export default function Analysis() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-display font-bold">Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">Confidence, intent, and daily insights.</p>
      </header>

      {/* Confidence */}
      <section className="glass-card p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Confidence Score
          </h2>
          <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "var(--success)", color: "var(--primary-foreground)" }}>
            HIGH
          </span>
        </div>
        <div className="flex items-center justify-center py-4">
          <CircularScore value={96} />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Last phrase recognized with high signal fidelity.
        </p>
      </section>

      {/* Ambiguity */}
      <section className="glass-card p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Ambiguity Resolver
          </h2>
          <span className="text-[10px] text-muted-foreground">3 candidates</span>
        </div>
        <ul className="space-y-2">
          {AMBIG.map(({ word, prob, selected }, i) => (
            <li
              key={word}
              className={`flex items-center justify-between gap-3 p-3 rounded-2xl transition-all ${
                selected
                  ? "border border-glass-border"
                  : "border border-transparent hover:bg-muted/40"
              }`}
              style={selected ? { background: "var(--gradient-surface)", boxShadow: "var(--shadow-glow)" } : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`size-7 rounded-full grid place-items-center shrink-0 text-[11px] font-bold ${
                    selected ? "text-primary-foreground" : "text-muted-foreground bg-muted"
                  }`}
                  style={selected ? { background: "var(--gradient-primary)" } : undefined}
                >
                  {selected ? <Check className="size-3.5" /> : i + 1}
                </div>
                <span className="font-medium truncate">{word}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${prob}%`, background: "var(--gradient-primary)" }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-10 text-right">{prob}%</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Daily summary */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Daily Summary
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {SUMMARY.map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card p-4 rounded-2xl">
              <div className="size-8 rounded-xl grid place-items-center mb-3" style={{ background: "var(--gradient-primary)" }}>
                <Icon className="size-4 text-primary-foreground" />
              </div>
              <div className="text-lg font-display font-bold leading-none">{value}</div>
              <div className="text-[10px] text-muted-foreground mt-1.5 leading-tight">{label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
