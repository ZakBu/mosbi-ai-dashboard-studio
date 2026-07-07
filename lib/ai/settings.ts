import type { AiProviderId, AiProviderRequest, AiSettings } from "./types";

export const AI_LIMITS = {
  maxSampleRows: 20,
  maxPromptChars: 6000,
  maxOutputTokens: 1200,
  maxPatchOutputTokens: 600,
};

export function getDefaultProvider(): AiProviderId {
  const configured = process.env.AI_PROVIDER as AiProviderId | undefined;
  if (configured === "openai" || configured === "ollama" || configured === "demo") return configured;
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.OLLAMA_MODEL) return "ollama";
  return "demo";
}

export function getOpenAiModel(request?: AiProviderRequest) {
  return request?.model || process.env.OPENAI_MODEL || "gpt-4.1-mini";
}

export function getOllamaModel(request?: AiProviderRequest) {
  return request?.model || process.env.OLLAMA_MODEL || "llama3.1";
}

export function getOllamaBaseUrl(request?: AiProviderRequest) {
  return request?.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
}

export function isAllowedLocalOllamaUrl(value: string) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

export function getAiSettings(): AiSettings {
  return {
    activeProvider: getDefaultProvider(),
    providers: [
      {
        id: "demo",
        label: "Demo deterministic fallback",
        configured: true,
        defaultModel: "local-demo-planner",
      },
      {
        id: "openai",
        label: "OpenAI",
        configured: Boolean(process.env.OPENAI_API_KEY),
        defaultModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      },
      {
        id: "ollama",
        label: "Ollama local",
        configured: true,
        defaultModel: process.env.OLLAMA_MODEL || "llama3.1",
        baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      },
    ],
    limits: AI_LIMITS,
  };
}
