import type { EditorRecord } from "@/lib/editor/csv";
import type { DatasetColumnProfile, DatasetProfile } from "./types";

const MAX_SAMPLE_ROWS = 20;
const MAX_EXAMPLES = 4;
const MAX_TOP_VALUES = 6;

function isEmpty(value: unknown) {
  return value === null || value === undefined || value === "";
}

function isDateLike(value: unknown) {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return false;
  return !Number.isNaN(Date.parse(value));
}

function inferColumnType(values: unknown[]): DatasetColumnProfile["type"] {
  const present = values.filter((value) => !isEmpty(value));
  if (!present.length) return "unknown";

  const numberCount = present.filter((value) => typeof value === "number").length;
  const booleanCount = present.filter((value) => typeof value === "boolean").length;
  const dateCount = present.filter(isDateLike).length;

  if (numberCount / present.length >= 0.8) return "number";
  if (booleanCount / present.length >= 0.8) return "boolean";
  if (dateCount / present.length >= 0.8) return "date";
  return "string";
}

function topValues(values: unknown[]) {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (isEmpty(value)) continue;
    const key = String(value);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_TOP_VALUES);
}

export function createDatasetProfile(records: EditorRecord[], columns: string[]): DatasetProfile {
  const columnProfiles: DatasetColumnProfile[] = columns.map((name) => {
    const values = records.map((record) => record[name]);
    const type = inferColumnType(values);
    const present = values.filter((value) => !isEmpty(value));
    const examples = Array.from(new Set(present.map((value) => String(value))))
      .slice(0, MAX_EXAMPLES)
      .map((value) => {
        const numeric = Number(value);
        return type === "number" && Number.isFinite(numeric) ? numeric : value;
      });

    const numericValues = type === "number"
      ? present.map(Number).filter((value) => Number.isFinite(value))
      : [];

    return {
      name,
      type,
      nonEmpty: present.length,
      examples,
      ...(numericValues.length
        ? {
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
          }
        : {}),
      ...(type === "string" ? { topValues: topValues(values) } : {}),
    };
  });

  const dateColumn = columnProfiles.find((column) => column.type === "date");
  const dateValues = dateColumn
    ? records.map((record) => String(record[dateColumn.name] ?? "")).filter(Boolean).sort()
    : [];

  return {
    rowCount: records.length,
    columnCount: columns.length,
    columns: columnProfiles,
    dateRange: dateColumn && dateValues.length
      ? {
          column: dateColumn.name,
          min: dateValues[0],
          max: dateValues[dateValues.length - 1],
        }
      : undefined,
    sampleRows: records.slice(0, MAX_SAMPLE_ROWS),
  };
}
