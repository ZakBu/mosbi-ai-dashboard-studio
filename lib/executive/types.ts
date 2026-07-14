import type { DashboardPlan, DatasetProfile } from "@/lib/ai/types";
import type { EditorRecord } from "@/lib/editor/csv";

export type ExecutiveDashboardSource = {
  plan: DashboardPlan;
  profile: DatasetProfile;
  records: EditorRecord[];
};

export type ExecutiveFilterState = Record<string, string>;

export type ExecutiveMetric = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  accent?: "green" | "red" | "violet" | "orange" | "coral" | "neutral";
};

export type ExecutiveSeriesPoint = {
  key: string;
  value: number;
  secondary?: number;
};

export type ExecutiveCategoryRow = {
  name: string;
  value: number;
  total?: number;
};
