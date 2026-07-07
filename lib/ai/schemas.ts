import { z } from "zod";

const GridRectSchema = z.object({
  x: z.number().int().min(0).max(11),
  y: z.number().int().min(0).max(10),
  w: z.number().int().min(1).max(12),
  h: z.number().int().min(1).max(11),
});

export const WidgetMetricPlanSchema = z.object({
  aggregation: z.enum(["count", "count_distinct", "sum", "avg"]).optional(),
  sourceColumn: z.string().optional(),
  valueColumn: z.string().optional(),
  groupBy: z.string().optional(),
  timeColumn: z.string().optional(),
  statusColumn: z.string().optional(),
  riskColumn: z.string().optional(),
});

export const WidgetPlanSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/).min(2).max(48),
  type: z.enum(["kpi", "status_kpi", "line", "bar", "stacked_bar", "map", "table", "ai_summary"]),
  title: z.string().min(2).max(80),
  subtitle: z.string().max(120).optional(),
  intent: z.string().min(4).max(220),
  metric: WidgetMetricPlanSchema.optional(),
  layout: GridRectSchema,
  accent: z.enum(["green", "red", "violet", "orange", "coral", "neutral"]).optional(),
});

export const FilterPlanSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/).min(2).max(48),
  label: z.string().min(2).max(50),
  type: z.enum(["select", "multi_select", "period", "toggle"]),
  sourceColumn: z.string().optional(),
  defaultValue: z.string().optional(),
});

export const DashboardPlanSchema = z.object({
  title: z.string().min(3).max(100),
  audience: z.enum(["executive", "analyst", "operator"]),
  format: z.literal("16:9"),
  theme: z.literal("executive-dark"),
  intent: z.enum(["fuel_moscow", "generic_operations", "financial_plan_fact", "workload", "population"]),
  filters: z.array(FilterPlanSchema).max(6),
  widgets: z.array(WidgetPlanSchema).min(4).max(10),
  narrative: z.array(z.string().min(4).max(220)).min(1).max(4),
  needsClarification: z.string().max(240).nullable().optional(),
});

export const DashboardPatchSchema = z.object({
  operations: z.array(z.discriminatedUnion("op", [
    z.object({
      op: z.literal("updateWidget"),
      widgetId: z.string(),
      changes: z.object({
        title: z.string().max(80).optional(),
        subtitle: z.string().max(120).optional(),
        intent: z.string().max(220).optional(),
        metric: WidgetMetricPlanSchema.optional(),
        accent: z.enum(["green", "red", "violet", "orange", "coral", "neutral"]).optional(),
      }),
    }),
    z.object({
      op: z.literal("resizeWidget"),
      widgetId: z.string(),
      layout: GridRectSchema,
    }),
    z.object({
      op: z.literal("replaceWidgetType"),
      widgetId: z.string(),
      type: z.enum(["kpi", "status_kpi", "line", "bar", "stacked_bar", "map", "table", "ai_summary"]),
      metric: WidgetMetricPlanSchema.optional(),
    }),
    z.object({
      op: z.literal("updateNarrative"),
      widgetId: z.string(),
      bullets: z.array(z.string().min(4).max(220)).min(1).max(4),
    }),
  ])).min(1).max(10),
  explanation: z.string().min(4).max(400),
  affectedWidgetIds: z.array(z.string()).min(1).max(10),
});

export const DashboardPatchJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["operations", "explanation", "affectedWidgetIds"],
  properties: {
    operations: {
      type: "array",
      minItems: 1,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: true,
        required: ["op", "widgetId"],
        properties: {
          op: {
            type: "string",
            enum: ["updateWidget", "resizeWidget", "replaceWidgetType", "updateNarrative"],
          },
          widgetId: { type: "string" },
          changes: { type: "object" },
          layout: {
            type: "object",
            properties: {
              x: { type: "integer" },
              y: { type: "integer" },
              w: { type: "integer" },
              h: { type: "integer" },
            },
          },
          type: {
            type: "string",
            enum: ["kpi", "status_kpi", "line", "bar", "stacked_bar", "map", "table", "ai_summary"],
          },
          metric: { type: "object" },
          bullets: { type: "array", items: { type: "string" } },
        },
      },
    },
    explanation: { type: "string" },
    affectedWidgetIds: { type: "array", minItems: 1, maxItems: 10, items: { type: "string" } },
  },
} as const;

export const DashboardPlanJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "audience", "format", "theme", "intent", "filters", "widgets", "narrative"],
  properties: {
    title: { type: "string" },
    audience: { type: "string", enum: ["executive", "analyst", "operator"] },
    format: { type: "string", enum: ["16:9"] },
    theme: { type: "string", enum: ["executive-dark"] },
    intent: {
      type: "string",
      enum: ["fuel_moscow", "generic_operations", "financial_plan_fact", "workload", "population"],
    },
    filters: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "label", "type"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          type: { type: "string", enum: ["select", "multi_select", "period", "toggle"] },
          sourceColumn: { type: "string" },
          defaultValue: { type: "string" },
        },
      },
    },
    widgets: {
      type: "array",
      minItems: 4,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "type", "title", "intent", "layout"],
        properties: {
          id: { type: "string" },
          type: {
            type: "string",
            enum: ["kpi", "status_kpi", "line", "bar", "stacked_bar", "map", "table", "ai_summary"],
          },
          title: { type: "string" },
          subtitle: { type: "string" },
          intent: { type: "string" },
          metric: {
            type: "object",
            additionalProperties: false,
            properties: {
              aggregation: { type: "string", enum: ["count", "count_distinct", "sum", "avg"] },
              sourceColumn: { type: "string" },
              valueColumn: { type: "string" },
              groupBy: { type: "string" },
              timeColumn: { type: "string" },
              statusColumn: { type: "string" },
              riskColumn: { type: "string" },
            },
          },
          layout: {
            type: "object",
            additionalProperties: false,
            required: ["x", "y", "w", "h"],
            properties: {
              x: { type: "integer" },
              y: { type: "integer" },
              w: { type: "integer" },
              h: { type: "integer" },
            },
          },
          accent: { type: "string", enum: ["green", "red", "violet", "orange", "coral", "neutral"] },
        },
      },
    },
    narrative: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string" },
    },
    needsClarification: { type: ["string", "null"] },
  },
} as const;
