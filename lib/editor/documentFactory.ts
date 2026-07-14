import type { AiRunInfo } from "@/lib/ai/types";
import { getRegistryItem } from "./componentRegistry";
import { donutData, editorDefaultCsv, editorDefaultPrompt, exceptionRows, queueData, trendData } from "./sampleData";
import type { CanvasWidget, DashboardDocument, EditorPatch } from "./types";

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function widget(input: Omit<CanvasWidget, "sourceLibrary">): CanvasWidget {
  const registry = getRegistryItem(input.componentId);
  return {
    ...input,
    sourceLibrary: registry?.sourceLibrary ?? "tremor",
  };
}

export function createEditorDocument(input?: {
  prompt?: string;
  title?: string;
  seedComponentId?: string;
  columns?: string[];
  rowCount?: number;
  origin?: string;
  ai?: AiRunInfo;
}): DashboardDocument {
  const documentId = id("editor");
  const title = input?.title ?? "Топливный комплекс Москвы — AI dashboard";
  const prompt = input?.prompt ?? editorDefaultPrompt;
  const seed = input?.seedComponentId;
  const seedRegistryItem = seed ? getRegistryItem(seed) : undefined;
  const resolvedSeed = seedRegistryItem?.componentId;
  const seedWidget = seed
    ? widget({
        id: "seed_widget",
        componentId: resolvedSeed ?? "tremor.area-chart",
        title: seedRegistryItem?.displayName ?? "Tremor AreaChart",
        subtitle: "Добавлено из библиотеки компонентов",
        layout: { x: 888, y: 568, w: 300, h: 132 },
        props: defaultPropsFor(resolvedSeed ?? "tremor.area-chart"),
      })
    : null;

  const widgets: CanvasWidget[] = [
    widget({
      id: "azs_dashboard_shell",
      componentId: "azs.dashboard-shell",
      title: "АЗС Москвы",
      subtitle: "Эталонный AZS dashboard shell",
      layout: { x: 24, y: 92, w: 1232, h: 604 },
      props: defaultPropsFor("azs.dashboard-shell"),
      locked: true,
    }),
  ];

  if (seedWidget) widgets.push(seedWidget);

  return {
    id: documentId,
    title,
    prompt,
    theme: "executive-dark",
    pages: [
      {
        id: "page_1",
        name: "Executive 16:9",
        format: "16:9",
        width: 1280,
        height: 720,
        widgets,
      },
    ],
    dataSources: [
      {
        id: "fuel_csv",
        type: "csv",
        label: "Moscow fuel availability CSV",
        rowCount: input?.rowCount ?? editorDefaultCsv.split("\n").length - 1,
        columns: input?.columns ?? ["date", "company", "district", "station_id", "status", "queue_count", "fuel_type", "risk_score", "reason"],
      },
    ],
    variables: {
      audience: "executive",
      format: "16:9",
      sourcePolicy: "library-components-only",
    },
    comments: [],
    versions: [{ id: "v1", label: "AI draft", createdAt: new Date().toISOString() }],
    embedUrl: input?.origin ? `${input.origin}/embed/${documentId}` : undefined,
    ai: input?.ai,
  };
}

export function defaultPropsFor(componentId: string): Record<string, unknown> {
  if (componentId === "azs.dashboard-shell") return { initialView: "dashboard" };
  if (componentId === "executive.dashboard-shell") return {};

  const monthlyData = [
    { date: "Jan 23", Organic: 232, Sponsored: 0, Direct: 164 },
    { date: "Feb 23", Organic: 241, Sponsored: 0, Direct: 188 },
    { date: "Mar 23", Organic: 291, Sponsored: 0, Direct: 211 },
    { date: "Apr 23", Organic: 101, Sponsored: 0, Direct: 144 },
    { date: "May 23", Organic: 318, Sponsored: 0, Direct: 263 },
    { date: "Jun 23", Organic: 205, Sponsored: 0, Direct: 201 },
  ];
  const funnelData = [
    { name: "Viewed", value: 1200 },
    { name: "Added", value: 744 },
    { name: "Validated", value: 502 },
    { name: "Published", value: 308 },
  ];
  const scatterData = [
    { risk: 12, queue: 7, district: "CAO" },
    { risk: 33, queue: 12, district: "SAO" },
    { risk: 58, queue: 18, district: "SVAO" },
    { risk: 75, queue: 24, district: "ZAO" },
  ];
  const sparkData = [
    { date: "Mon", value: 20 },
    { date: "Tue", value: 32 },
    { date: "Wed", value: 28 },
    { date: "Thu", value: 44 },
    { date: "Fri", value: 40 },
  ];
  const barListData = [
    { name: "Rosneft", value: 456 },
    { name: "Lukoil", value: 351 },
    { name: "Tatneft", value: 271 },
  ];
  if (componentId === "tremor.area-chart") return { data: monthlyData, index: "date", categories: ["Organic", "Sponsored"], colors: ["blue", "violet"] };
  if (componentId === "tremor.line-chart") return { data: trendData, index: "date", categories: ["Открыто", "Нет топлива"], colors: ["emerald", "rose"] };
  if (componentId === "tremor.bar-chart") return { data: queueData, index: "company", categories: ["Очередь"], colors: ["amber"] };
  if (componentId === "tremor.donut-chart") return { data: donutData, category: "value", index: "name", colors: ["emerald", "rose", "violet"] };
  if (componentId === "tremor.funnel-chart") return { data: funnelData, category: "value", index: "name", colors: ["blue", "cyan", "violet"] };
  if (componentId === "tremor.scatter-chart") return { data: scatterData, category: "district", x: "risk", y: "queue", colors: ["blue"] };
  if (componentId === "tremor.spark-area-chart" || componentId === "tremor.spark-line-chart" || componentId === "tremor.spark-bar-chart") return { data: sparkData, index: "date", categories: ["value"], colors: ["blue"] };
  if (componentId === "tremor.bar-list") return { data: barListData };
  if (componentId === "tremor.category-bar") return { values: [25, 35, 25, 15], colors: ["emerald", "yellow", "orange", "rose"], markerValue: 72 };
  if (componentId === "tremor.delta-bar") return { value: 34 };
  if (componentId === "tremor.marker-bar") return { value: 62 };
  if (componentId === "tremor.progress") return { value: 72 };
  if (componentId === "tremor.tracker") return { data: [{ color: "emerald", tooltip: "Operational" }, { color: "yellow", tooltip: "Warning" }, { color: "rose", tooltip: "Critical" }, { color: "emerald", tooltip: "Recovered" }] };
  if (componentId === "tremor.table") return { rows: exceptionRows, columns: ["station", "company", "district", "risk"] };
  return { value: 42, delta: "+4.2%", progress: 64, tone: "blue" };
}

export function createCommentPatch(args: { document: DashboardDocument; targetIds: string[]; text: string }): EditorPatch {
  const allowed = new Set(args.targetIds);
  const lockedWidgetIds = args.document.pages.flatMap((page) => page.widgets).map((widgetItem) => widgetItem.id).filter((idItem) => !allowed.has(idItem));
  return {
    operations: args.targetIds.map((widgetId) => ({
      op: "updateWidget",
      widgetId,
      changes: {
        props: {
          commentInstruction: args.text,
          emphasis: args.text.toLowerCase().includes("крит") ? "critical" : "scoped",
        },
      },
    })),
    affectedWidgetIds: args.targetIds,
    lockedWidgetIds,
    explanation: "Scoped editor patch prepared only for selected canvas widgets.",
  };
}
