import { useEffect, useRef, useState } from "react";
import { Settings as Gear, Battery, Smile, AlertTriangle, Minus, Volume2, Loader2, RotateCcw, LifeBuoy, Droplet, Pill, Phone, Bluetooth, Zap, Wifi } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { decodeWsBase } from "@/lib/backend";

type Emotion = "Neutral" | "Happy" | "Urgent";

const EMOTIONS: { id: Emotion; icon: React.ComponentType<{ className?: string }>; gradient: string; glow: string }[] = [
  {
    id: "Neutral",
    icon: Minus,
    gradient: "linear-gradient(135deg, oklch(0.75 0.15 230), oklch(0.65 0.12 250))",
    glow: "0 0 20px -4px oklch(0.75 0.15 230 / 60%)",
  },
  {
    id: "Happy",
    icon: Smile,
    gradient: "linear-gradient(135deg, oklch(0.78 0.17 155), oklch(0.7 0.15 170))",
    glow: "0 0 20px -4px oklch(0.78 0.17 155 / 60%)",
  },
  {
    id: "Urgent",
    icon: AlertTriangle,
    gradient: "linear-gradient(135deg, oklch(0.82 0.17 75), oklch(0.75 0.2 50))",
    glow: "0 0 20px -4px oklch(0.82 0.17 75 / 60%)",
  },
];

function Waveform() {
  const bars = Array.from({ length: 40 });
  return (
    <div className="flex items-center justify-center gap-[3px] h-24">
      {bars.map((_, i) => {
        const center = 20;
        const dist = Math.abs(i - center);
        const delay = dist * 0.03;
        const duration = 0.6 + Math.random() * 0.6;
        return (
          <span
            key={i}
            className="w-[3px] rounded-full waveform-bar"
            style={{
              background: "var(--gradient-primary)",
              height: "100%",
              animation: `glow-wave ${duration}s ease-in-out ${delay}s infinite`,
              transformOrigin: "center",
              boxShadow: "0 0 10px oklch(0.78 0.16 195 / 40%)",
            }}
          />
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const [emotion, setEmotion] = useState<Emotion>("Neutral");
  const [speaking, setSpeaking] = useState(false);
  const [connectionState, setConnectionState] = useState("Connecting");
  const [partialText, setPartialText] = useState("");
  const [finalText, setFinalText] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const message = "I would like a glass of water.";
  const transcript = finalText || partialText || message;

  useEffect(() => {
    const socket = io(decodeWsBase(), { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => setConnectionState("Connected"));
    socket.on("partial", (payload: { candidates?: { text: string }[] }) => {
      setPartialText(payload.candidates?.[0]?.text ?? "");
    });
    socket.on("final", (payload: { text?: string; audioBytes?: { audioBase64?: string } }) => {
      if (payload.text) {
        setFinalText(payload.text);
        setPartialText("");
      }
      if (typeof window !== "undefined" && payload.audioBytes?.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${payload.audioBytes.audioBase64}`);
        void audio.play().catch(() => undefined);
      }
    });
    socket.on("disconnect", () => setConnectionState("Offline"));
    socket.on("stream", (payload: { type?: string }) => {
      if (payload.type === "connected") {
        setConnectionState("Connected");
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const speakAloud = () => {
    socketRef.current?.emit("audio_frame", {
      userId: "demo-user",
      frame: message,
      final: true,
      emotion: emotion.toLowerCase(),
      languageHint: "en",
    });

    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(message);
    utter.rate = 1;
    utter.pitch = 1;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <button className="size-12 rounded-full glass-card grid place-items-center shrink-0 overflow-hidden hover:scale-105 transition-transform duration-300">
          <span className="text-sm font-semibold text-gradient">SR</span>
        </button>

        <div className="glass-card flex items-center gap-3 px-4 py-2.5 rounded-full min-w-0">
          <span className="relative flex size-2.5 shrink-0">
            <span className="absolute inset-0 rounded-full animate-pulse-ring" style={{ background: "var(--success)" }} />
            <span className="relative inline-flex size-2.5 rounded-full" style={{ background: "var(--success)" }} />
          </span>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{connectionState}</span>
            <span className="text-sm font-semibold truncate">SR-Guest-01</span>
          </div>
          <div className="flex items-center gap-1.5 pl-3 ml-1 border-l border-glass-border shrink-0">
            <Battery className="size-4" style={{ color: "var(--success)" }} />
            <span className="text-sm font-semibold">85%</span>
          </div>
        </div>

        <button
          className="size-12 rounded-full glass-card grid place-items-center shrink-0 hover:scale-105 transition-transform duration-300"
          aria-label="Voice settings"
        >
          <Gear className="size-5 text-primary animate-spin-slow" />
        </button>
      </header>

      {/* Transcription card — enlarged with enhanced glassmorphism */}
      <section className="glass-card p-8 rounded-[2rem] relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{ background: "var(--gradient-glow)" }}
        />
        <div
          aria-hidden
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-30"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-20"
          style={{ background: "linear-gradient(135deg, oklch(0.7 0.2 305), oklch(0.78 0.16 195))" }}
        />
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <span className="relative flex size-3">
                <span className="absolute inset-0 rounded-full animate-pulse-ring" style={{ background: "var(--primary)" }} />
                <span className="relative inline-flex size-3 rounded-full" style={{ background: "var(--primary)" }} />
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                Your Voice
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-md">00:14</span>
          </div>

          <p className="text-sm text-muted-foreground mb-6 italic">
            Giving a voice to those who communicate silently.
          </p>

          <p className="font-display text-4xl sm:text-5xl font-medium leading-tight text-balance mb-2 tracking-tight">
            <span className="text-gradient">"</span>{transcript}
            <span className="text-gradient">"</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">Live stream from Decode Service</p>

          <div className="mt-8">
            <Waveform />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Wifi className="size-3.5" />
            <span>{connectionState} · partials are streamed word by word</span>
          </div>

          <div className="mt-6 grid grid-cols-[1fr_auto] gap-3">
            <button
              onClick={speakAloud}
              disabled={speaking}
              className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-base font-semibold text-primary-foreground transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-80"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
              aria-label="Speak this message aloud"
            >
              {speaking ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Speaking…
                </>
              ) : (
                <>
                  <Volume2 className="size-5" />
                  Speak Aloud
                </>
              )}
            </button>
            <button
              onClick={speakAloud}
              className="glass-card grid place-items-center px-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              aria-label="Replay last message"
              title="Replay last message"
            >
              <RotateCcw className="size-5 text-primary" />
            </button>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Detected Tone</span>
            <div className="flex gap-2">
              {EMOTIONS.map(({ id, icon: Icon, gradient, glow }) => {
                const active = emotion === id;
                return (
                  <button
                    key={id}
                    onClick={() => setEmotion(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                      active
                        ? "border-transparent text-primary-foreground scale-105"
                        : "text-muted-foreground border-glass-border hover:border-primary/30 hover:text-foreground"
                    }`}
                    style={
                      active
                        ? { background: gradient, boxShadow: glow }
                        : undefined
                    }
                  >
                    <Icon className="size-4" />
                    {id}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Quick Communication */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Quick Communication
          </h2>
          <span className="text-[10px] text-muted-foreground">Tap to speak instantly</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: LifeBuoy, label: "I Need Help", phrase: "I need help, please.", hue: "20", urgent: true },
            { icon: Droplet, label: "I Need Water", phrase: "I would like some water.", hue: "210" },
            { icon: Pill, label: "I Need Medication", phrase: "I need my medication.", hue: "155" },
            { icon: Phone, label: "Call Caregiver", phrase: "Please call my caregiver.", hue: "280" },
          ].map(({ icon: Icon, label, phrase, hue, urgent }) => (
            <button
              key={label}
              onClick={() => {
                if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(phrase));
              }}
              className="glass-card p-4 rounded-2xl flex items-center gap-3 text-left hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[72px]"
              style={urgent ? { boxShadow: "0 0 24px -8px oklch(0.75 0.2 25 / 50%)", borderColor: "oklch(0.75 0.2 25 / 40%)" } : undefined}
            >
              <div
                className="size-11 rounded-xl grid place-items-center shrink-0 text-primary-foreground"
                style={{ background: `linear-gradient(135deg, oklch(0.72 0.18 ${hue}), oklch(0.62 0.2 ${Number(hue) + 30}))` }}
              >
                <Icon className="size-5" />
              </div>
              <span className="font-semibold text-sm leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Communication Status */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">
          Communication Status
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-4 rounded-2xl">
            <Bluetooth className="size-4 text-primary mb-2" />
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Device</div>
            <div className="mt-1 text-sm font-display font-semibold" style={{ color: "var(--success)" }}>Connected</div>
          </div>
          <div className="glass-card p-4 rounded-2xl">
            <Zap className="size-4 text-primary mb-2" />
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Response</div>
            <div className="mt-1 text-sm font-display font-semibold">42<span className="text-xs text-muted-foreground ml-1">ms</span></div>
          </div>
          <div className="glass-card p-4 rounded-2xl">
            <Battery className="size-4 text-primary mb-2" />
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Battery</div>
            <div className="mt-1 text-sm font-display font-semibold text-gradient">85%</div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <p className="text-center text-xs text-muted-foreground italic px-6 pt-2">
        Restoring communication independence and giving a voice back to people with speech impairments.
      </p>
    </div>
  );
}
