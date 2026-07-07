"use client";

import { useEffect, useMemo, useState } from "react";
import { Rnd } from "react-rnd";
import {
  IconArrowRight,
  IconChartBar,
  IconCheck,
  IconChevronDown,
  IconCirclePlus,
  IconColorSwatch,
  IconDeviceFloppy,
  IconDownload,
  IconEye,
  IconLayoutDashboard,
  IconMap,
  IconMessageCircle,
  IconPointer,
  IconRefresh,
  IconSettings,
  IconShape,
  IconSparkles,
  IconTable,
  IconTypography,
} from "@tabler/icons-react";
import { loadLocalAiSettings } from "@/components/ai/AiSettingsPanel";
import { WidgetRenderer } from "./WidgetRenderer";
import { getEditorComponentRegistry, getRegistryItem } from "@/lib/editor/componentRegistry";
import { createEditorDocument, defaultPropsFor } from "@/lib/editor/documentFactory";
import { editorDefaultCsv, editorDefaultPrompt } from "@/lib/editor/sampleData";
import type { CanvasWidget, DashboardDocument, EditorPatch } from "@/lib/editor/types";

type BuildResponse = {
  document: DashboardDocument;
  error?: string;
};

type CommentPatchResponse = {
  patch: EditorPatch;
  error?: string;
};

const toolbar = [
  ["Select", IconPointer],
  ["Comment", IconMessageCircle],
  ["Sheet", IconCirclePlus],
  ["Shape", IconShape],
  ["Arrow", IconArrowRight],
  ["Text", IconTypography],
  ["Widget", IconChartBar],
  ["Map", IconMap],
] as const;

function patchWidget(document: DashboardDocument, widgetId: string, update: (widget: CanvasWidget) => CanvasWidget): DashboardDocument {
  return {
    ...document,
    pages: document.pages.map((page) => ({
      ...page,
      widgets: page.widgets.map((widget) => (widget.id === widgetId ? update(widget) : widget)),
    })),
  };
}

function addWidget(document: DashboardDocument, componentId: string): DashboardDocument {
  const registry = getRegistryItem(componentId) ?? getEditorComponentRegistry()[0];
  const resolvedComponentId = registry?.componentId ?? "tremor.metric-card";
  const nextWidget: CanvasWidget = {
    id: `manual_${Date.now().toString(36)}`,
    componentId: resolvedComponentId,
    sourceLibrary: registry?.sourceLibrary ?? "tremor",
    title: registry?.displayName ?? componentId,
    subtitle: "Добавлено из библиотеки",
    layout: { x: 96 + Math.random() * 80, y: 120 + Math.random() * 80, w: registry?.defaultSize.w ?? 340, h: registry?.defaultSize.h ?? 220 },
    props: defaultPropsFor(resolvedComponentId),
  };
  return {
    ...document,
    pages: document.pages.map((page, index) => index === 0 ? { ...page, widgets: [...page.widgets, nextWidget] } : page),
  };
}

export function EditorShell() {
  const [document, setDocument] = useState<DashboardDocument>(() => createEditorDocument());
  const [selectedId, setSelectedId] = useState("trend_availability");
  const [prompt, setPrompt] = useState(editorDefaultPrompt);
  const [csv, setCsv] = useState(editorDefaultCsv);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("Сделай этот блок главным и не трогай остальные виджеты.");
  const [lastPatch, setLastPatch] = useState<EditorPatch | null>(null);
  const [settings, setSettings] = useState(() => loadLocalAiSettings());

  useEffect(() => {
    setSettings(loadLocalAiSettings());
    const params = new URLSearchParams(window.location.search);
    const seed = params.get("seed");
    if (seed) {
      const registry = getRegistryItem(seed) ?? getEditorComponentRegistry()[0];
      const resolvedComponentId = registry?.componentId ?? "tremor.area-chart";
      const seededDocument = createEditorDocument({
        seedComponentId: resolvedComponentId,
        title: `${registry?.displayName ?? "Tremor component"} draft`,
      });
      setDocument({
        ...seededDocument,
        pages: seededDocument.pages.map((seededPage) => ({
          ...seededPage,
          widgets: seededPage.widgets
            .filter((widget) => widget.id === "seed_widget")
            .map((widget) => ({
              ...widget,
              layout: {
                x: Math.round((seededPage.width - Math.max(widget.layout.w, 520)) / 2),
                y: 150,
                w: Math.max(widget.layout.w, 520),
                h: Math.max(widget.layout.h, 280),
              },
            })),
        })),
      });
      setSelectedId("seed_widget");
    }
  }, []);

  const page = document.pages[0];
  const componentRegistry = useMemo(() => getEditorComponentRegistry(), []);
  const selectedWidget = useMemo(
    () => page.widgets.find((widget) => widget.id === selectedId) ?? page.widgets[0],
    [page.widgets, selectedId],
  );

  async function buildWithAi() {
    setBusy(true);
    setError(null);
    setLastPatch(null);
    try {
      const response = await fetch("/api/editor/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          data: csv,
          aiProvider: settings.provider,
          model: settings.model || undefined,
          ollamaBaseUrl: settings.ollamaBaseUrl,
        }),
      });
      const json = (await response.json()) as BuildResponse;
      if (!response.ok) throw new Error(json.error ?? "Editor build failed");
      setDocument(json.document);
      setSelectedId(json.document.pages[0]?.widgets[0]?.id ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown error");
    } finally {
      setBusy(false);
    }
  }

  async function sendScopedComment() {
    if (!selectedWidget) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/editor/comment-patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, targetIds: [selectedWidget.id], text: commentText }),
      });
      const json = (await response.json()) as CommentPatchResponse;
      if (!response.ok) throw new Error(json.error ?? "Comment patch failed");
      setLastPatch(json.patch);
      const patchResponse = await fetch("/api/editor/patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, patch: json.patch }),
      });
      const patched = (await patchResponse.json()) as BuildResponse;
      if (patchResponse.ok && patched.document) setDocument(patched.document);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown error");
    } finally {
      setBusy(false);
    }
  }

  function updateSelected(changes: Partial<CanvasWidget>) {
    if (!selectedWidget) return;
    setDocument((current) => patchWidget(current, selectedWidget.id, (widget) => ({ ...widget, ...changes })));
  }

  function updateSelectedProps(props: Record<string, unknown>) {
    if (!selectedWidget) return;
    setDocument((current) => patchWidget(current, selectedWidget.id, (widget) => ({ ...widget, props: { ...widget.props, ...props } })));
  }

  return (
    <main className="editor-app">
      <header className="editor-topbar">
        <div className="editor-brand">
          <a href="/dashboard-kit">mos<span>.</span>bi</a>
          <nav>{["Файл", "Правка", "Вставка", "Вид", "Данные", "Публикация"].map((item) => <button type="button" key={item}>{item}</button>)}</nav>
        </div>
        <div className="editor-document-title">
          <b>{document.title}</b>
          <span>Autosaved · {page.format} · {document.theme} · {document.ai?.provider ?? settings.provider}</span>
        </div>
        <div className="editor-topbar__actions">
          <a href="/settings/ai"><IconSettings size={16} /> AI</a>
          <button type="button"><IconEye size={16} /> Preview</button>
          {document.embedUrl && <a href={document.embedUrl} target="_blank" rel="noreferrer"><IconDownload size={16} /> Iframe</a>}
        </div>
      </header>

      <section className="editor-body">
        <aside className="editor-chat">
          <div className="editor-chat__head">
            <IconSparkles size={19} />
            <div>
              <b>AI режиссер</b>
              <span>{settings.provider} · registry-only schema</span>
            </div>
          </div>
          <label>
            <span>Prompt</span>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          </label>
          <label>
            <span>CSV / data context</span>
            <textarea value={csv} onChange={(event) => setCsv(event.target.value)} />
          </label>
          <button type="button" className="editor-primary" onClick={buildWithAi} disabled={busy}>
            {busy ? <IconRefresh size={17} /> : <IconSparkles size={17} />}
            {busy ? "Собираю..." : "Build with AI"}
          </button>
          <div className="editor-chat__memory">
            <b>Правила AI</b>
            <span>Только componentId из registry</span>
            <span>Никакого raw React/CSS</span>
            <span>Locked/manual widgets сохраняются</span>
            <span>Комментарии возвращают patch</span>
          </div>
          {lastPatch && (
            <div className="editor-patch-note">
              <b>Patch applied</b>
              <span>Affected: {lastPatch.affectedWidgetIds.join(", ")}</span>
              <span>Locked: {lastPatch.lockedWidgetIds.length}</span>
            </div>
          )}
          {error && <div className="editor-error">{error}</div>}
        </aside>

        <section className="editor-stage">
          <div className="editor-stage__head">
            <div>
              <span>Page 1</span>
              <b>{page.name}</b>
            </div>
            <div>
              <button type="button">72%</button>
              <button type="button">Grid</button>
              <button type="button">Snap</button>
            </div>
          </div>
          <div className="editor-canvas-scroll">
            <section className="editor-sheet" style={{ width: page.width, height: page.height }}>
              <header className="editor-sheet__title">
                <div>
                  <span>mos.bi / AI Dashboard Studio</span>
                  <h1>{document.title}</h1>
                </div>
                <em>library components only</em>
              </header>
              {page.widgets.map((widget) => (
                <Rnd
                  key={widget.id}
                  bounds="parent"
                  size={{ width: widget.layout.w, height: widget.layout.h }}
                  position={{ x: widget.layout.x, y: widget.layout.y }}
                  onDragStop={(_, data) => {
                    setSelectedId(widget.id);
                    setDocument((current) => patchWidget(current, widget.id, (item) => ({ ...item, layout: { ...item.layout, x: data.x, y: data.y } })));
                  }}
                  onResizeStop={(_, __, ref, ___, position) => {
                    setSelectedId(widget.id);
                    setDocument((current) => patchWidget(current, widget.id, (item) => ({
                      ...item,
                      layout: { x: position.x, y: position.y, w: ref.offsetWidth, h: ref.offsetHeight },
                    })));
                  }}
                  dragGrid={[8, 8]}
                  resizeGrid={[8, 8]}
                  className={widget.id === selectedId ? "editor-canvas-widget is-selected" : "editor-canvas-widget"}
                  data-widget-id={widget.id}
                >
                  <div
                    className="editor-canvas-widget__hit"
                    onMouseDownCapture={() => setSelectedId(widget.id)}
                    onClickCapture={() => setSelectedId(widget.id)}
                  >
                    <button
                      type="button"
                      className="editor-canvas-widget__select"
                      onClick={() => setSelectedId(widget.id)}
                      aria-label={`Select ${widget.id}`}
                    >
                      Select
                    </button>
                    <div className="editor-canvas-widget__chrome">
                      <span>{widget.sourceLibrary}</span>
                      {widget.locked && <b>locked</b>}
                    </div>
                    <WidgetRenderer widget={widget} />
                  </div>
                </Rnd>
              ))}
            </section>
          </div>
        </section>

        <aside className="editor-inspector">
          <div className="editor-inspector__tabs">
            <button type="button" className="is-active">Design</button>
            <button type="button">Data</button>
            <button type="button">Behavior</button>
          </div>
          {selectedWidget && (
            <>
              <section>
                <header>
                  <span>Selection</span>
                  <b>{selectedWidget.id}</b>
                </header>
                <label>
                  <span>Title</span>
                  <input value={selectedWidget.title} onChange={(event) => updateSelected({ title: event.target.value })} />
                </label>
                <label>
                  <span>Component</span>
                  <select
                    value={selectedWidget.componentId}
                    onChange={(event) => {
                      const registry = getRegistryItem(event.target.value);
                      updateSelected({ componentId: event.target.value, sourceLibrary: registry?.sourceLibrary ?? selectedWidget.sourceLibrary, props: defaultPropsFor(event.target.value) });
                    }}
                  >
                    {componentRegistry.map((item) => <option key={item.componentId} value={item.componentId}>{item.displayName}</option>)}
                  </select>
                </label>
                <div className="editor-inspector__rect">
                  {(["x", "y", "w", "h"] as const).map((key) => (
                    <label key={key}>
                      <span>{key.toUpperCase()}</span>
                      <input
                        type="number"
                        value={Math.round(selectedWidget.layout[key])}
                        onChange={(event) => updateSelected({ layout: { ...selectedWidget.layout, [key]: Number(event.target.value) } })}
                      />
                    </label>
                  ))}
                </div>
              </section>
              <section>
                <header>
                  <span>Appearance</span>
                  <IconColorSwatch size={16} />
                </header>
                <label>
                  <span>Locked</span>
                  <select value={selectedWidget.locked ? "yes" : "no"} onChange={(event) => updateSelected({ locked: event.target.value === "yes" })}>
                    <option value="no">Можно менять</option>
                    <option value="yes">Locked</option>
                  </select>
                </label>
                {"headline" in selectedWidget.props && (
                  <label>
                    <span>Headline</span>
                    <input value={String(selectedWidget.props.headline ?? "")} onChange={(event) => updateSelectedProps({ headline: event.target.value })} />
                  </label>
                )}
                {"value" in selectedWidget.props && (
                  <label>
                    <span>Value</span>
                    <input type="number" value={Number(selectedWidget.props.value ?? 0)} onChange={(event) => updateSelectedProps({ value: Number(event.target.value) })} />
                  </label>
                )}
              </section>
              <section>
                <header>
                  <span>Scoped comment</span>
                  <IconMessageCircle size={16} />
                </header>
                <textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} />
                <button type="button" className="editor-secondary" onClick={sendScopedComment} disabled={busy}>
                  <IconCheck size={16} />
                  Send patch only to selected
                </button>
              </section>
            </>
          )}
        </aside>
      </section>

      <nav className="editor-bottom-toolbar" aria-label="Editor toolbar">
        <div>
          {toolbar.map(([label, Icon]) => (
            <button type="button" key={label} title={label}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div>
          <button type="button" onClick={() => setDocument((current) => addWidget(current, "tremor.metric-card"))}><IconCirclePlus size={18} /> KPI</button>
          <button type="button" onClick={() => setDocument((current) => addWidget(current, "tremor.line-chart"))}><IconChartBar size={18} /> Chart</button>
          <button type="button" onClick={() => setDocument((current) => addWidget(current, "tremor.table"))}><IconTable size={18} /> Table</button>
          <button type="button" onClick={() => setDocument((current) => addWidget(current, "tremor.area-chart"))}><IconLayoutDashboard size={18} /> Area</button>
          <button type="button" className="editor-bottom-toolbar__build" onClick={buildWithAi}><IconDeviceFloppy size={18} /> Build</button>
        </div>
      </nav>
    </main>
  );
}
