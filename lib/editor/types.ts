import type { AiRunInfo } from "@/lib/ai/types";

export type EditorSourceLibrary = "tremor";

export type EditorComponentCategory =
  | "kpi"
  | "chart"
  | "table";

export type EditorRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type EditorComponentRegistryItem = {
  componentId: string;
  sourceLibrary: EditorSourceLibrary;
  category: EditorComponentCategory;
  displayName: string;
  adapter: string;
  propsSchema: Record<string, string>;
  dataRequirements: string[];
  minSize: Pick<EditorRect, "w" | "h">;
  defaultSize: Pick<EditorRect, "w" | "h">;
  supportedIntents: string[];
  aiDescription: string;
  sourceUrl: string;
};

export type CanvasWidget = {
  id: string;
  componentId: string;
  sourceLibrary: EditorSourceLibrary;
  title: string;
  subtitle?: string;
  layout: EditorRect;
  props: Record<string, unknown>;
  dataBinding?: {
    datasetId: string;
    columns: string[];
    transform: string;
  };
  locked?: boolean;
};

export type DashboardPage = {
  id: string;
  name: string;
  format: "16:9";
  width: number;
  height: number;
  widgets: CanvasWidget[];
};

export type DashboardDocument = {
  id: string;
  title: string;
  prompt: string;
  theme: "executive-dark" | "editorial-light";
  pages: DashboardPage[];
  dataSources: Array<{
    id: string;
    type: "csv" | "mock";
    label: string;
    rowCount: number;
    columns: string[];
  }>;
  variables: Record<string, string | number | boolean>;
  comments: Array<{
    id: string;
    widgetIds: string[];
    text: string;
    createdAt: string;
  }>;
  versions: Array<{
    id: string;
    label: string;
    createdAt: string;
  }>;
  embedUrl?: string;
  ai?: AiRunInfo;
};

export type EditorPatchOperation =
  | {
      op: "createWidget";
      widget: CanvasWidget;
    }
  | {
      op: "updateWidget";
      widgetId: string;
      changes: Partial<Pick<CanvasWidget, "title" | "subtitle" | "props" | "dataBinding" | "locked">>;
    }
  | {
      op: "moveWidget" | "resizeWidget";
      widgetId: string;
      layout: EditorRect;
    }
  | {
      op: "deleteWidget";
      widgetId: string;
    }
  | {
      op: "replaceWidget";
      widgetId: string;
      componentId: string;
      props?: Record<string, unknown>;
    };

export type EditorPatch = {
  operations: EditorPatchOperation[];
  affectedWidgetIds: string[];
  lockedWidgetIds: string[];
  explanation: string;
};
