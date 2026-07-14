"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  IconAlertTriangle,
  IconChartDots3,
  IconCircleCheck,
  IconDashboard,
  IconFilter,
  IconInfoCircle,
  IconTable,
} from "@tabler/icons-react";
import type { DashboardPlan, DatasetProfile, FilterPlan } from "@/lib/ai/types";
import type { EditorRecord } from "@/lib/editor/csv";
import type { ExecutiveCategoryRow, ExecutiveDashboardSource, ExecutiveFilterState, ExecutiveMetric, ExecutiveSeriesPoint } from "@/lib/executive/types";
import { fmtInt, fmtPct } from "@/lib/azs/data";

type Props = {
  source?: ExecutiveDashboardSource;
};

const FALLBACK_SOURCE: ExecutiveDashboardSource = {
  plan: {
    title: "Executive dashboard",
    audience: "executive",
    format: "16:9",
    theme: "executive-dark",
    intent: "generic_operations",
    filters: [],
    widgets: [],
    narrative: ["Загрузите CSV и нажмите Build with AI, чтобы собрать dashboard."],
  },
  profile: { rowCount: 0, columnCount: 0, columns: [], sampleRows: [] },
  records: [],
};

const COLORS = ["#10b981", "#8b5cf6", "#14b8a6", "#ef4444", "#f59e0b", "#0ea5e9"];

function valueKey(record: EditorRecord, column?: string) {
  if (!column) return null;
  const value = record[column];
  return value == null ? null : String(value);
}

function numeric(record: EditorRecord, column?: string) {
  if (!column) return 0;
  const value = record[column];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function numberColumn(profile: DatasetProfile, preferred?: string) {
  if (preferred && profile.columns.some((column) => column.name === preferred && column.type === "number")) return preferred;
  return profile.columns.find((column) => column.type === "number")?.name;
}

function stringColumn(profile: DatasetProfile, preferred?: string) {
  if (preferred && profile.columns.some((column) => column.name === preferred)) return preferred;
  return profile.columns.find((column) => column.type === "string")?.name ?? profile.columns[0]?.name;
}

function dateColumn(profile: DatasetProfile, preferred?: string) {
  if (preferred && profile.columns.some((column) => column.name === preferred)) return preferred;
  return profile.dateRange?.column ?? profile.columns.find((column) => column.type === "date")?.name;
}

function metricColumns(plan: DashboardPlan, profile: DatasetProfile) {
  const metrics = plan.widgets.map((widget) => widget.metric).filter(Boolean);
  const value = numberColumn(profile, metrics.find((metric) => metric?.valueColumn)?.valueColumn);
  const category = stringColumn(profile, metrics.find((metric) => metric?.groupBy)?.groupBy ?? plan.filters.find((filter) => filter.sourceColumn)?.sourceColumn);
  const time = dateColumn(profile, metrics.find((metric) => metric?.timeColumn)?.timeColumn);
  const status = stringColumn(profile, metrics.find((metric) => metric?.statusColumn)?.statusColumn);
  const risk = numberColumn(profile, metrics.find((metric) => metric?.riskColumn)?.riskColumn);
  return { value, category, time, status, risk };
}

function filterOptions(records: EditorRecord[], filter: FilterPlan) {
  if (!filter.sourceColumn) return [];
  const counts = new Map<string, number>();
  for (const record of records) {
    const key = valueKey(record, filter.sourceColumn);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([value]) => value);
}

function applyFilters(records: EditorRecord[], filters: FilterPlan[], state: ExecutiveFilterState) {
  return records.filter((record) =>
    filters.every((filter) => {
      if (!filter.sourceColumn) return true;
      const selected = state[filter.id];
      if (!selected || selected === "Все") return true;
      return valueKey(record, filter.sourceColumn) === selected;
    }),
  );
}

function sum(records: EditorRecord[], column?: string) {
  if (!column) return records.length;
  return records.reduce((total, record) => total + numeric(record, column), 0);
}

function avg(records: EditorRecord[], column?: string) {
  if (!column || !records.length) return records.length;
  return sum(records, column) / records.length;
}

function topCategories(records: EditorRecord[], categoryColumn?: string, valueColumn?: string, limit = 6): ExecutiveCategoryRow[] {
  if (!categoryColumn) return [];
  const totals = new Map<string, { value: number; total: number }>();
  for (const record of records) {
    const key = valueKey(record, categoryColumn);
    if (!key) continue;
    const current = totals.get(key) ?? { value: 0, total: 0 };
    current.value += valueColumn ? numeric(record, valueColumn) : 1;
    current.total += 1;
    totals.set(key, current);
  }
  return [...totals.entries()]
    .map(([name, row]) => ({ name, value: row.value, total: row.total }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function trend(records: EditorRecord[], timeColumn?: string, valueColumn?: string): ExecutiveSeriesPoint[] {
  if (!timeColumn) return [];
  const totals = new Map<string, { value: number; total: number }>();
  for (const record of records) {
    const raw = valueKey(record, timeColumn);
    if (!raw) continue;
    const key = raw.slice(0, 10);
    const current = totals.get(key) ?? { value: 0, total: 0 };
    current.value += valueColumn ? numeric(record, valueColumn) : 1;
    current.total += 1;
    totals.set(key, current);
  }
  return [...totals.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-10)
    .map(([key, row]) => ({ key, value: Math.round(row.value * 10) / 10, secondary: row.total }));
}

function statusRows(records: EditorRecord[], statusColumn?: string): ExecutiveCategoryRow[] {
  return topCategories(records, statusColumn, undefined, 4);
}

function buildMetrics(records: EditorRecord[], profile: DatasetProfile, plan: DashboardPlan): ExecutiveMetric[] {
  const columns = metricColumns(plan, profile);
  const totalValue = columns.value ? sum(records, columns.value) : records.length;
  const averageValue = columns.value ? avg(records, columns.value) : records.length;
  const categoryCount = columns.category ? new Set(records.map((record) => valueKey(record, columns.category)).filter(Boolean)).size : profile.columnCount;
  const riskValues = columns.risk ? records.map((record) => numeric(record, columns.risk)).filter((value) => value > 0) : [];
  const riskThreshold = riskValues.length ? Math.max(...riskValues) * 0.75 : 0;
  const risky = columns.risk ? riskValues.filter((value) => value >= riskThreshold).length : 0;
  const primaryWidget = plan.widgets.find((widget) => widget.type === "kpi");
  return [
    { id: "total", label: primaryWidget?.title ?? (columns.value ? `Итого ${columns.value}` : "Всего строк"), value: totalValue, accent: "neutral" },
    { id: "avg", label: columns.value ? `Среднее ${columns.value}` : "Записей в выборке", value: averageValue, accent: "green" },
    { id: "categories", label: columns.category ? `Категорий ${columns.category}` : "Колонок", value: categoryCount, accent: "violet" },
    { id: "risk", label: columns.risk ? `Высокий ${columns.risk}` : "Фильтров", value: columns.risk ? risky : plan.filters.length, accent: "red" },
  ];
}

function fmtMetric(value: number) {
  if (Math.abs(value) >= 1000) return fmtInt(value);
  if (!Number.isInteger(value)) return value.toFixed(1).replace(".", ",");
  return fmtInt(value);
}

function FilterBar({
  filters,
  records,
  state,
  onChange,
}: {
  filters: FilterPlan[];
  records: EditorRecord[];
  state: ExecutiveFilterState;
  onChange: (state: ExecutiveFilterState) => void;
}) {
  const visibleFilters = filters.filter((filter) => filter.sourceColumn).slice(0, 4);
  if (!visibleFilters.length) return null;
  return (
    <section className="azs-card executive-filter-card">
      {visibleFilters.map((filter) => (
        <div key={filter.id} className="executive-filter-group">
          <span><IconFilter size={15} />{filter.label}</span>
          <div>
            {["Все", ...filterOptions(records, filter)].map((option) => {
              const selected = (state[filter.id] ?? "Все") === option;
              return (
                <button
                  key={option}
                  type="button"
                  className={selected ? "is-active" : ""}
                  onClick={() => onChange({ ...state, [filter.id]: option })}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

function Sidebar({ plan, metrics, status, rowCount }: { plan: DashboardPlan; metrics: ExecutiveMetric[]; status: ExecutiveCategoryRow[]; rowCount: number }) {
  const statusTotal = Math.max(1, status.reduce((total, row) => total + row.value, 0));
  const tail = Math.max(0, rowCount - status.slice(0, 2).reduce((total, row) => total + (row.total ?? row.value), 0));
  return (
    <section className="azs-card azs-sidebar executive-sidebar">
      <h2>{plan.title}</h2>
      <div className="azs-total-block">
        <div>
          <span>{metrics[0]?.label ?? "Всего"}</span>
          <strong><b>{fmtMetric(metrics[0]?.value ?? 0)}</b><IconChartDots3 size={42} /></strong>
        </div>
        <div className="azs-fuel-chips">
          <span>ключевые показатели из CSV</span>
          <div>
            {metrics.slice(1, 4).map((metric, index) => (
              <b key={metric.id} style={{ background: COLORS[index + 1] }}>{fmtMetric(metric.value)} <small>{metric.label}</small></b>
            ))}
          </div>
        </div>
      </div>
      {metrics.slice(1, 4).map((metric, index) => (
        <div key={metric.id} className="azs-side-block">
          <div className="azs-side-block__row">
            <span className="azs-side-block__label"><i style={{ background: COLORS[index] }} />{metric.label}</span>
            <span className="azs-side-block__metric"><b>{fmtMetric(metric.value)}</b></span>
          </div>
        </div>
      ))}
      <div className="azs-side-branch">
        <div className="azs-mini-grid">
          {status.slice(0, 2).map((row, index) => (
            <div key={row.name} className="azs-side-block">
              <div className="azs-side-block__row">
                <span className="azs-side-block__label"><i style={{ background: COLORS[index] }} />{row.name}</span>
                <span className="azs-side-block__metric"><b>{fmtMetric(row.value)}</b><em>{fmtPct((row.value / statusTotal) * 100)}</em></span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="azs-side-block">
        <div className="azs-side-block__row">
          <span className="azs-side-block__label"><i style={{ background: "#ef4444" }} />Исключения / хвост</span>
          <span className="azs-side-block__metric"><b>{fmtMetric(tail)}</b></span>
        </div>
        <p>Автоматически рассчитано из выбранных строк и доступных числовых колонок.</p>
      </div>
    </section>
  );
}

function TrendPanel({ points, valueColumn }: { points: ExecutiveSeriesPoint[]; valueColumn?: string }) {
  return (
    <section className="azs-card azs-chart-card">
      <header>
        <div>
          <div className="azs-panel-title">
            <span>Динамика {valueColumn ?? "записей"} <small>(по времени)</small></span>
            <IconInfoCircle size={16} />
          </div>
          <p>собрано из date/time колонки CSV</p>
        </div>
      </header>
      <div className="azs-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 28, right: 24, bottom: 2, left: 4 }}>
            <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
            <XAxis dataKey="key" tick={{ fill: "#d8d8d8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#d8d8d8", fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
            <Tooltip contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, color: "#fff" }} />
            <Line type="monotone" dataKey="value" name={valueColumn ?? "Строк"} stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function RankingPanel({ rows, categoryColumn }: { rows: ExecutiveCategoryRow[]; categoryColumn?: string }) {
  return (
    <section className="azs-card azs-chart-card">
      <header>
        <div className="azs-panel-title">
          <span>Рейтинг {categoryColumn ?? "категорий"}</span>
          <IconInfoCircle size={16} />
        </div>
      </header>
      <div className="azs-chart azs-chart--queue">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 18, right: 18, bottom: 4, left: 4 }}>
            <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#d8d8d8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#d8d8d8", fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
            <Tooltip contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, color: "#fff" }} />
            <Bar dataKey="value" radius={[7, 7, 0, 0]} isAnimationActive={false}>
              {rows.map((row, index) => <Cell key={row.name} fill={COLORS[index % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function DonutPanel({ rows }: { rows: ExecutiveCategoryRow[] }) {
  return (
    <section className="azs-card azs-net-panel">
      <div className="azs-panel-title"><span>Структура данных</span><IconInfoCircle size={16} /></div>
      <div className="executive-donut-list">
        {rows.slice(0, 4).map((row, index) => {
          const total = rows.reduce((acc, item) => acc + item.value, 0) || 1;
          const data = [{ name: row.name, value: row.value }, { name: "other", value: Math.max(0, total - row.value) }];
          return (
            <div key={row.name} className="azs-net-donut">
              <div className="azs-net-donut__chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data} dataKey="value" innerRadius="62%" outerRadius="88%" startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
                      <Cell fill={COLORS[index % COLORS.length]} />
                      <Cell fill="rgba(255,255,255,.11)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <b>{fmtPct((row.value / total) * 100)}</b>
              <span>{fmtMetric(row.value)}</span>
              <em>{row.name}</em>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AlertsPanel({ rowCount, profile }: { rowCount: number; profile: DatasetProfile }) {
  const unknownColumns = profile.columns.filter((column) => column.type === "unknown");

  return (
    <section className="azs-card azs-restrictions executive-alerts">
      <h3>Контроль качества и ограничения</h3>
      <div className="azs-restriction-row">
        <div><span><IconCircleCheck size={17} /></span><b>Строк в анализе <em>CSV</em></b></div>
        <strong>{fmtInt(rowCount)} <small>из {fmtInt(profile.rowCount)}</small></strong>
        <p>фильтры применяются без пересборки dashboard</p>
      </div>
      <div className="azs-restriction-row">
        <div><span>{unknownColumns.length ? <IconAlertTriangle size={17} /> : <IconCircleCheck size={17} />}</span><b>{unknownColumns.length ? "Проверить" : "Типы"} <em>{unknownColumns.length ? "данные" : "распознаны"}</em></b></div>
        <strong>{fmtInt(unknownColumns.length || profile.columnCount)} <small>{unknownColumns.length ? "колонок" : "полей"}</small></strong>
        <p>{unknownColumns.length ? "колонки неизвестного типа лучше описать в prompt" : "числовые, временные и категорийные поля готовы к сборке"}</p>
      </div>
    </section>
  );
}

function DetailTable({ records, columns }: { records: EditorRecord[]; columns: string[] }) {
  return (
    <section className="azs-card executive-table">
      <div className="azs-panel-title"><span>Детальные строки</span><IconTable size={16} /></div>
      <div>
        <table>
          <thead>
            <tr>{columns.slice(0, 5).map((column) => <th key={column}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {records.slice(0, 6).map((record, index) => (
              <tr key={index}>{columns.slice(0, 5).map((column) => <td key={column}>{String(record[column] ?? "—")}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ExecutiveDashboardWidget({ source }: Props) {
  const resolved = source ?? FALLBACK_SOURCE;
  const [filters, setFilters] = useState<ExecutiveFilterState>({});
  const columns = useMemo(() => metricColumns(resolved.plan, resolved.profile), [resolved.plan, resolved.profile]);
  const filteredRecords = useMemo(() => applyFilters(resolved.records, resolved.plan.filters, filters), [resolved.records, resolved.plan.filters, filters]);
  const metrics = useMemo(() => buildMetrics(filteredRecords, resolved.profile, resolved.plan), [filteredRecords, resolved.profile, resolved.plan]);
  const status = useMemo(() => statusRows(filteredRecords, columns.status), [filteredRecords, columns.status]);
  const categories = useMemo(() => topCategories(filteredRecords, columns.category, columns.value, 6), [filteredRecords, columns.category, columns.value]);
  const points = useMemo(() => trend(filteredRecords, columns.time, columns.value), [filteredRecords, columns.time, columns.value]);
  const trendPoints = points.length ? points : categories.map((row) => ({ key: row.name, value: row.value }));

  return (
    <div className="azs-dashboard-widget executive-dashboard-widget">
      <div className="azs-top-row executive-top-row">
        <section className="azs-card azs-tabs-card">
          <div className="azs-view-tabs">
            <button type="button" className="is-active"><IconDashboard size={24} /><span>Свод</span></button>
            <button type="button"><IconChartDots3 size={24} /><span>Аналитика</span></button>
            <button type="button"><IconTable size={24} /><span>Данные</span></button>
          </div>
        </section>
        <FilterBar filters={resolved.plan.filters} records={resolved.records} state={filters} onChange={setFilters} />
      </div>

      <div className="azs-dashboard-grid">
        <Sidebar plan={resolved.plan} metrics={metrics} status={status.length ? status : categories} rowCount={filteredRecords.length} />
        <div className="azs-main-column">
          <TrendPanel points={trendPoints} valueColumn={columns.value} />
          <RankingPanel rows={categories} categoryColumn={columns.category} />
        </div>
        <div className="azs-right-column">
          <AlertsPanel rowCount={filteredRecords.length} profile={resolved.profile} />
          <DonutPanel rows={categories.length ? categories : status} />
        </div>
      </div>
      <DetailTable records={filteredRecords} columns={resolved.profile.columns.map((column) => column.name)} />
    </div>
  );
}
