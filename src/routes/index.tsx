import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SilentRace · Silent Speech Companion" },
      { name: "description", content: "Premium companion app for the SilentRace silent-speech neckband — real-time transcription, intent confidence, and personalized voice output." },
      { property: "og:title", content: "SilentRace · Silent Speech Companion" },
      { property: "og:description", content: "Real-time silent-speech transcription, confidence analytics, and voice personalization." },
    ],
  }),
  component: Index,
});

function Index() {
  return <AppShell />;
}
