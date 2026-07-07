import type { Metadata } from "next";
import { AiSettingsPanel } from "@/components/ai/AiSettingsPanel";

export const metadata: Metadata = {
  title: "AI settings — mos.bi",
  description: "Choose OpenAI, Ollama or demo AI provider for dashboard planning",
};

export default function AiSettingsPage() {
  return <AiSettingsPanel />;
}
