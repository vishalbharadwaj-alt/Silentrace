import { useState } from "react";
import { Activity, BarChart3, Settings as SettingsIcon } from "lucide-react";
import Dashboard from "./Dashboard";
import Analysis from "./Analysis";
import SettingsTab from "./SettingsTab";

type Tab = "dashboard" | "analysis" | "settings";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "analysis", label: "Analysis", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function AppShell() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen flex flex-col mx-auto w-full max-w-md sm:max-w-lg relative">
      <main className="flex-1 px-5 pt-6 pb-32">
        <div key={tab} className="animate-fade-up">
          {tab === "dashboard" && <Dashboard />}
          {tab === "analysis" && <Analysis />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </main>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50">
        <div className="glass-card flex items-center justify-around p-2 rounded-3xl">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`relative flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all duration-300 ${
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <span
                    className="absolute inset-0 rounded-2xl glow-primary"
                    style={{ background: "var(--gradient-primary)" }}
                    aria-hidden
                  />
                )}
                <Icon className="relative z-10 size-5" />
                <span className="relative z-10 text-[10px] font-medium tracking-wide uppercase">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
