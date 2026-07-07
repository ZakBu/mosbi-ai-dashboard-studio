import type { ComponentRegistryItem } from "./types";

export const COMPONENT_REGISTRY: ComponentRegistryItem[] = [
  {
    type: "kpi",
    purpose: "Single executive value with optional delta.",
    requiredPlanFields: ["metric.aggregation", "metric.sourceColumn"],
    minSize: { x: 0, y: 0, w: 2, h: 2 },
    maxSize: { x: 0, y: 0, w: 4, h: 3 },
  },
  {
    type: "status_kpi",
    purpose: "Status value, threshold, risk or availability card.",
    requiredPlanFields: ["metric.aggregation", "metric.sourceColumn"],
    minSize: { x: 0, y: 0, w: 2, h: 2 },
    maxSize: { x: 0, y: 0, w: 4, h: 3 },
  },
  {
    type: "line",
    purpose: "Time trend. Can be generic value over time or status shares over time.",
    requiredPlanFields: ["metric.timeColumn"],
    minSize: { x: 0, y: 0, w: 5, h: 3 },
    maxSize: { x: 0, y: 0, w: 8, h: 5 },
  },
  {
    type: "bar",
    purpose: "Ranking or comparison by category.",
    requiredPlanFields: ["metric.groupBy"],
    minSize: { x: 0, y: 0, w: 3, h: 3 },
    maxSize: { x: 0, y: 0, w: 6, h: 5 },
  },
  {
    type: "stacked_bar",
    purpose: "Status composition by category.",
    requiredPlanFields: ["metric.groupBy", "metric.statusColumn"],
    minSize: { x: 0, y: 0, w: 3, h: 3 },
    maxSize: { x: 0, y: 0, w: 6, h: 5 },
  },
  {
    type: "map",
    purpose: "Territory or geo-like risk block. Use only when a district/region/area column exists.",
    requiredPlanFields: ["metric.groupBy"],
    minSize: { x: 0, y: 0, w: 4, h: 3 },
    maxSize: { x: 0, y: 0, w: 6, h: 5 },
  },
  {
    type: "table",
    purpose: "Top exceptions, detail rows, audit list or objects requiring action.",
    requiredPlanFields: [],
    minSize: { x: 0, y: 0, w: 4, h: 3 },
    maxSize: { x: 0, y: 0, w: 6, h: 5 },
  },
  {
    type: "ai_summary",
    purpose: "Short management conclusion grounded in visible widgets.",
    requiredPlanFields: [],
    minSize: { x: 0, y: 0, w: 6, h: 2 },
    maxSize: { x: 0, y: 0, w: 12, h: 3 },
  },
];

export function getCompactComponentRegistry() {
  return COMPONENT_REGISTRY.map((component) => ({
    type: component.type,
    purpose: component.purpose,
    requiredPlanFields: component.requiredPlanFields,
    minSize: { w: component.minSize.w, h: component.minSize.h },
    maxSize: { w: component.maxSize.w, h: component.maxSize.h },
  }));
}
