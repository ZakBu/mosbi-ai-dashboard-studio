"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Cpu, PlugZap, RefreshCw, Server, TriangleAlert } from "lucide-react";
import type { AiProviderId, AiSettings } from "@/lib/ai/types";

type LocalAiSettings = {
  provider: AiProviderId;
  model: string;
  ollamaBaseUrl: string;
};

type TestResult = {
  ok: boolean;
  provider?: AiProviderId;
  model?: string;
  message: string;
};

const STORAGE_KEY = "mosbi.ai.settings.v1";

const DEFAULT_LOCAL: LocalAiSettings = {
  provider: "demo",
  model: "",
  ollamaBaseUrl: "http://localhost:11434",
};

export function loadLocalAiSettings(): LocalAiSettings {
  if (typeof window === "undefined") return DEFAULT_LOCAL;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_LOCAL;
    return { ...DEFAULT_LOCAL, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_LOCAL;
  }
}

export function saveLocalAiSettings(settings: LocalAiSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function AiSettingsPanel() {
  const [remote, setRemote] = useState<AiSettings | null>(null);
  const [local, setLocal] = useState<LocalAiSettings>(DEFAULT_LOCAL);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    setLocal(loadLocalAiSettings());
    fetch("/api/ai/settings")
      .then((response) => response.json())
      .then((json: AiSettings) => {
        setRemote(json);
        setLocal((current) => ({
          ...current,
          provider: current.provider || json.activeProvider,
          model: current.model || json.providers.find((provider) => provider.id === current.provider)?.defaultModel || "",
          ollamaBaseUrl: current.ollamaBaseUrl || json.providers.find((provider) => provider.id === "ollama")?.baseUrl || DEFAULT_LOCAL.ollamaBaseUrl,
        }));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    saveLocalAiSettings(local);
  }, [local]);

  const activeProvider = useMemo(
    () => remote?.providers.find((provider) => provider.id === local.provider),
    [local.provider, remote?.providers],
  );

  function update(next: Partial<LocalAiSettings>) {
    setResult(null);
    setLocal((current) => ({ ...current, ...next }));
  }

  async function testConnection() {
    setTesting(true);
    setResult(null);
    try {
      const response = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: local.provider,
          model: local.model || undefined,
          ollamaBaseUrl: local.ollamaBaseUrl,
        }),
      });
      const json = (await response.json()) as TestResult;
      setResult(json);
    } catch (error) {
      setResult({ ok: false, message: error instanceof Error ? error.message : "unknown error" });
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return <main className="ai-settings"><div className="ai-settings__loading">Loading AI settings...</div></main>;
  }

  return (
    <main className="ai-settings">
      <section className="ai-settings__hero">
        <span>mos.bi AI Gateway</span>
        <h1>Выбор ИИ для генерации дашбордов.</h1>
        <p>
          Настройки хранят только выбранный provider, модель и локальный Ollama URL.
          API-ключи остаются на сервере в env.
        </p>
      </section>

      <section className="ai-settings__grid">
        <div className="ai-settings__panel">
          <div className="ai-settings__panel-head">
            <PlugZap size={18} />
            <h2>Provider</h2>
          </div>

          <div className="ai-provider-list">
            {remote?.providers.map((provider) => (
              <button
                key={provider.id}
                type="button"
                className={provider.id === local.provider ? "is-active" : ""}
                onClick={() => update({ provider: provider.id, model: provider.defaultModel })}
              >
                <span>{provider.label}</span>
                <em>{provider.defaultModel}</em>
                <b>{provider.configured ? "configured" : "missing env"}</b>
              </button>
            ))}
          </div>
        </div>

        <div className="ai-settings__panel">
          <div className="ai-settings__panel-head">
            {local.provider === "ollama" ? <Server size={18} /> : <Cpu size={18} />}
            <h2>Runtime</h2>
          </div>

          <label className="ai-settings__field">
            <span>Model</span>
            <input
              value={local.model}
              placeholder={activeProvider?.defaultModel}
              onChange={(event) => update({ model: event.target.value })}
            />
          </label>

          {local.provider === "ollama" && (
            <label className="ai-settings__field">
              <span>Ollama base URL</span>
              <input
                value={local.ollamaBaseUrl}
                onChange={(event) => update({ ollamaBaseUrl: event.target.value })}
              />
            </label>
          )}

          <div className="ai-settings__limits">
            <span>Sample rows: {remote?.limits.maxSampleRows}</span>
            <span>Prompt chars: {remote?.limits.maxPromptChars}</span>
            <span>Output tokens: {remote?.limits.maxOutputTokens}</span>
          </div>

          <button className="ai-settings__test" type="button" onClick={testConnection} disabled={testing}>
            {testing ? <RefreshCw size={16} /> : <PlugZap size={16} />}
            {testing ? "Testing..." : "Test connection"}
          </button>

          {result && (
            <div className={result.ok ? "ai-settings__result is-ok" : "ai-settings__result is-error"}>
              {result.ok ? <Check size={16} /> : <TriangleAlert size={16} />}
              <span>{result.message}</span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
