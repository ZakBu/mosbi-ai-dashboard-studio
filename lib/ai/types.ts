export type AiProviderId = "demo" | "openai" | "ollama";

export type DashboardIntent =
  | "fuel_moscow"
  | "generic_operations"
  | "financial_plan_fact"
  | "workload"
  | "population";

export type DashboardWidgetType =
  | "kpi"
  | "status_kpi"
  | "line"
  | "bar"
  | "stacked_bar"
  | "map"
  | "table"
  | "ai_summary";

export type GridRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type AiProviderRequest = {
  provider?: AiProviderId;
  model?: string;
  ollamaBaseUrl?: string;
};

export type AiUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export type AiRunInfo = {
  provider: AiProviderId;
  model: string;
  mode: "planner" | "comment_patch" | "demo";
  usage?: AiUsage;
  warnings: string[];
  fallback: boolean;
};

export type DatasetColumnProfile = {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "unknown";
  nonEmpty: number;
  examples: Array<string | number | boolean>;
  min?: number;
  max?: number;
  topValues?: Array<{ value: string; count: number }>;
};

export type DatasetProfile = {
  rowCount: number;
  columnCount: number;
  columns: DatasetColumnProfile[];
  dateRange?: {
    column: string;
    min: string;
    max: string;
  };
  sampleRows: Array<Record<string, string | number | boolean | null>>;
};

export type ComponentRegistryItem = {
  type: DashboardWidgetType;
  purpose: string;
  requiredPlanFields: string[];
  minSize: GridRect;
  maxSize: GridRect;
};

export type WidgetMetricPlan = {
  aggregation?: "count" | "count_distinct" | "sum" | "avg";
  sourceColumn?: string;
  valueColumn?: string;
  groupBy?: string;
  timeColumn?: string;
  statusColumn?: string;
  riskColumn?: string;
};

export type WidgetPlan = {
  id: string;
  type: DashboardWidgetType;
  title: string;
  subtitle?: string;
  intent: string;
  metric?: WidgetMetricPlan;
  layout: GridRect;
  accent?: "green" | "red" | "violet" | "orange" | "coral" | "neutral";
};

export type FilterPlan = {
  id: string;
  label: string;
  type: "select" | "multi_select" | "period" | "toggle";
  sourceColumn?: string;
  defaultValue?: string;
};

export type DashboardPlan = {
  title: string;
  audience: "executive" | "analyst" | "operator";
  format: "16:9";
  theme: "executive-dark";
  intent: DashboardIntent;
  filters: FilterPlan[];
  widgets: WidgetPlan[];
  narrative: string[];
  needsClarification?: string | null;
};

export type DashboardPatchOperation =
  | {
      op: "updateWidget";
      widgetId: string;
      changes: Partial<Pick<WidgetPlan, "title" | "subtitle" | "intent" | "metric" | "accent">>;
    }
  | {
      op: "resizeWidget";
      widgetId: string;
      layout: GridRect;
    }
  | {
      op: "replaceWidgetType";
      widgetId: string;
      type: DashboardWidgetType;
      metric?: WidgetMetricPlan;
    }
  | {
      op: "updateNarrative";
      widgetId: string;
      bullets: string[];
    };

export type DashboardPatch = {
  operations: DashboardPatchOperation[];
  explanation: string;
  affectedWidgetIds: string[];
};

export type AiPlanResult = {
  plan: DashboardPlan;
  ai: AiRunInfo;
};

export type AiSettings = {
  activeProvider: AiProviderId;
  providers: Array<{
    id: AiProviderId;
    label: string;
    configured: boolean;
    defaultModel: string;
    baseUrl?: string;
  }>;
  limits: {
    maxSampleRows: number;
    maxPromptChars: number;
    maxOutputTokens: number;
    maxPatchOutputTokens: number;
  };
};
