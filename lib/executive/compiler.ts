import type { DashboardPlan, DatasetProfile, WidgetMetricPlan } from "@/lib/ai/types";
import type { EditorRecord } from "@/lib/editor/csv";
import type { ExecutiveDashboardSource } from "./types";

function firstColumn(profile: DatasetProfile, type: "string" | "number" | "date") {
  return profile.columns.find((column) => column.type === type)?.name;
}

function planMetricColumns(plan: DashboardPlan) {
  const metrics = plan.widgets.map((widget) => widget.metric).filter(Boolean) as WidgetMetricPlan[];
  return {
    timeColumn: metrics.find((metric) => metric.timeColumn)?.timeColumn,
    statusColumn: metrics.find((metric) => metric.statusColumn)?.statusColumn,
    riskColumn: metrics.find((metric) => metric.riskColumn)?.riskColumn,
    valueColumn: metrics.find((metric) => metric.valueColumn)?.valueColumn,
    groupBy: metrics.find((metric) => metric.groupBy)?.groupBy,
  };
}

export function createExecutiveDashboardSource(args: {
  plan: DashboardPlan;
  profile: DatasetProfile;
  records: EditorRecord[];
}): ExecutiveDashboardSource {
  const inferred = planMetricColumns(args.plan);
  const dateColumn = inferred.timeColumn ?? args.profile.dateRange?.column ?? firstColumn(args.profile, "date");
  const categoryColumn = inferred.groupBy ?? args.plan.filters.find((filter) => filter.sourceColumn)?.sourceColumn ?? firstColumn(args.profile, "string");
  const valueColumn = inferred.valueColumn ?? firstColumn(args.profile, "number");
  const statusColumn = inferred.statusColumn;
  const riskColumn = inferred.riskColumn;

  return {
    plan: {
      ...args.plan,
      filters: args.plan.filters.length
        ? args.plan.filters
        : categoryColumn
          ? [{ id: "category", label: categoryColumn, type: "multi_select", sourceColumn: categoryColumn, defaultValue: "Все" }]
          : [],
      widgets: args.plan.widgets.map((widget) => ({
        ...widget,
        metric: {
          ...widget.metric,
          timeColumn: widget.metric?.timeColumn ?? dateColumn,
          groupBy: widget.metric?.groupBy ?? categoryColumn,
          valueColumn: widget.metric?.valueColumn ?? valueColumn,
          statusColumn: widget.metric?.statusColumn ?? statusColumn,
          riskColumn: widget.metric?.riskColumn ?? riskColumn,
        },
      })),
    },
    profile: args.profile,
    records: args.records,
  };
}
