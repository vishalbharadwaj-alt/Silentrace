import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, UserPlus, Users, Radio, Check, ChevronRight, BatteryFull, Wifi, Bluetooth, Languages, Pencil } from "lucide-react";
import { fetchJson, type UserProfile } from "@/lib/backend";

const VOICES = [
  { id: "us", name: "US English", desc: "Warm, conversational", flag: "🇺🇸" },
  { id: "uk", name: "UK English", desc: "Crisp, articulate", flag: "🇬🇧" },
  { id: "deep", name: "Deep Voice", desc: "Resonant, calm", flag: "🎙️" },
  { id: "female", name: "Female Voice", desc: "Soft, expressive", flag: "🎵" },
];

const PROFILES = [
  { id: "1", name: "Alex Reed", initials: "AR", role: "Primary", active: true, hue: "195" },
  { id: "2", name: "Maya Lin", initials: "ML", role: "Clinician", hue: "305" },
  { id: "3", name: "Jordan K.", initials: "JK", role: "Guest", hue: "155" },
];

type ThemeMode = "dark" | "light" | "system";

export default function SettingsTab() {
  const [voice, setVoice] = useState("us");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [language, setLanguage] = useState("en");
  const [hydrated, setHydrated] = useState(false);
  const userId = "demo-user";

  useEffect(() => {
    const apply = (mode: ThemeMode) => {
      const prefersLight = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches;
      const isLight = mode === "light" || (mode === "system" && prefersLight);
      document.documentElement.classList.toggle("light", isLight);
    };
    apply(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => apply("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  useEffect(() => {
    fetchJson<UserProfile>(`/api/users/${userId}/profile`)
      .then((profile) => {
        if (profile.language) setLanguage(profile.language);
        if (profile.theme === "light" || profile.theme === "dark" || profile.theme === "system") {
          setTheme(profile.theme);
        }
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void fetchJson(`/api/users/${userId}/profile`, {
      method: "PATCH",
      body: JSON.stringify({ language, theme }),
    }).catch(() => undefined);
    void fetchJson(`/api/users/${userId}/preferences`, {
      method: "PATCH",
      body: JSON.stringify({ language, emotionalTone: true, speakingRate: 1 }),
    }).catch(() => undefined);
  }, [hydrated, language, theme]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Personalize your SilentRace experience.</p>
      </header>

      {/* Voice Output */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">
          Voice Output
        </h2>
        <div className="space-y-2">
          {VOICES.map((v) => {
            const active = voice === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setVoice(v.id)}
                className={`w-full glass-card p-4 rounded-2xl flex items-center gap-4 text-left transition-all ${
                  active ? "glow-primary" : ""
                }`}
                style={active ? { borderColor: "oklch(0.78 0.16 195 / 60%)" } : undefined}
              >
                <div
                  className="size-11 rounded-xl grid place-items-center text-xl shrink-0"
                  style={{ background: active ? "var(--gradient-primary)" : "var(--color-muted)" }}
                >
                  {v.flag}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{v.name}</div>
                  <div className="text-xs text-muted-foreground">{v.desc}</div>
                </div>
                <div
                  className={`size-5 rounded-full grid place-items-center shrink-0 ${
                    active ? "" : "border border-glass-border"
                  }`}
                  style={active ? { background: "var(--gradient-primary)" } : undefined}
                >
                  {active && <Check className="size-3 text-primary-foreground" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Language */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">
          Language Support
        </h2>
        <div className="glass-card p-2 rounded-2xl grid grid-cols-2 gap-1">
          {[
            { id: "en", label: "English", native: "English" },
            { id: "hi", label: "Hindi", native: "हिन्दी" },
            { id: "as", label: "Assamese", native: "অসমীয়া" },
            { id: "bn", label: "Bengali", native: "বাংলা" },
          ].map((l) => {
            const active = language === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                style={active ? { background: "var(--gradient-surface)" } : undefined}
              >
                <div
                  className="size-9 rounded-lg grid place-items-center shrink-0"
                  style={{ background: active ? "var(--gradient-primary)" : "var(--color-muted)" }}
                >
                  <Languages className={`size-4 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight">{l.label}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{l.native}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Appearance */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">
          Appearance
        </h2>
        <div className="glass-card p-2 rounded-2xl grid grid-cols-3 gap-1">
          {([
            { id: "dark", label: "Dark", icon: Moon },
            { id: "light", label: "Light", icon: Sun },
            { id: "system", label: "System", icon: Monitor },
          ] as const).map(({ id, label, icon: Icon }) => {
            const active = theme === id;
            return (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className="relative rounded-xl py-3 flex flex-col items-center gap-1.5 text-xs font-semibold transition-all"
                style={{
                  background: active ? "var(--gradient-primary)" : "transparent",
                  color: active ? "var(--primary-foreground)" : "var(--muted-foreground)",
                }}
              >
                <Icon className="size-4" />
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Profile */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">
          Profile Management
        </h2>
        <div className="glass-card p-2 rounded-2xl space-y-1">
          {PROFILES.map((p) => (
            <button
              key={p.id}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-muted/40"
              style={p.active ? { background: "var(--gradient-surface)" } : undefined}
            >
              <div
                className="size-10 rounded-full grid place-items-center font-bold text-sm shrink-0 text-primary-foreground"
                style={{ background: `linear-gradient(135deg, oklch(0.7 0.18 ${p.hue}), oklch(0.6 0.2 ${Number(p.hue) + 40}))` }}
              >
                {p.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{p.name}</div>
                <div className="text-[11px] text-muted-foreground">{p.role}</div>
              </div>
              {p.active ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
                  ACTIVE
                </span>
              ) : (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <ActionCard icon={UserPlus} label="Add Profile" />
          <ActionCard icon={Users} label="Switch Profile" />
          <ActionCard icon={Pencil} label="Edit Profile" />
        </div>
      </section>

      {/* Hardware */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">
          Hardware
        </h2>

        {/* Connection status */}
        <div className="glass-card p-4 rounded-2xl mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="size-2.5 rounded-full" style={{ background: "var(--success)" }} />
                <div className="absolute inset-0 size-2.5 rounded-full animate-pulse-ring" style={{ background: "var(--success)" }} />
              </div>
              <div>
                <div className="font-semibold text-sm">SR-Neckband 01</div>
                <div className="text-[11px] text-muted-foreground">Connected · Strong signal</div>
              </div>
            </div>
            <Bluetooth className="size-4 text-primary" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3" style={{ background: "var(--color-muted)" }}>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                <Wifi className="size-3" /> Latency
              </div>
              <div className="font-mono font-semibold text-sm">42ms</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: "var(--color-muted)" }}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Firmware</div>
              <div className="font-mono font-semibold text-sm">v2.4.1</div>
            </div>
          </div>
        </div>

        {/* Battery */}
        <div className="glass-card p-4 rounded-2xl mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl grid place-items-center" style={{ background: "var(--gradient-primary)" }}>
                <BatteryFull className="size-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold text-sm">Battery</div>
                <div className="text-[11px] text-muted-foreground">~8h remaining · Not charging</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-display font-bold text-gradient leading-none">85%</div>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-muted)" }}>
            <div className="h-full rounded-full" style={{ width: "85%", background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }} />
          </div>
        </div>

        <button className="w-full glass-card p-4 rounded-2xl flex items-center gap-4 text-left transition-all hover:glow-primary">
          <div className="size-11 rounded-xl grid place-items-center shrink-0" style={{ background: "var(--gradient-primary)" }}>
            <Radio className="size-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold">Calibrate Neckband Sensors</div>
            <div className="text-xs text-muted-foreground">Re-tune EMG channels for optimal accuracy</div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground shrink-0" />
        </button>
      </section>

      <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground pt-4">
        SilentRace · Companion v1.0
      </p>
    </div>
  );
}

function ActionCard({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button className="glass-card p-4 rounded-2xl flex flex-col items-start gap-3 text-left transition-all hover:glow-primary">
      <div className="size-10 rounded-xl grid place-items-center" style={{ background: "var(--gradient-primary)" }}>
        <Icon className="size-4 text-primary-foreground" />
      </div>
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}
