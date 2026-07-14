"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  IconBarrel,
  IconBottle,
  IconCar,
  IconChartDots3,
  IconCircleCheck,
  IconCurrencyRubel,
  IconDashboard,
  IconFileText,
  IconGasStation,
  IconInfoCircle,
} from "@tabler/icons-react";
import { NET_LOGOS } from "./netLogos";
import {
  buildSeries,
  brandColor,
  EMPTY_FILTER,
  fmtInt,
  fmtPct,
  NET_ORDER,
  netLabel,
  netRows,
  resolveDataset,
  selectSummary,
  updatedLabel,
} from "@/lib/azs/data";
import type { AzsDataset, NetFilter, NetStatusRow, NetSummary, StationType } from "@/lib/azs/types";

type ViewMode = "dashboard" | "fuel" | "prices" | "reports";

type AzsDashboardWidgetProps = {
  data?: unknown;
  initialView?: ViewMode;
};

const VIEW_TABS: Array<{ value: ViewMode; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
  { value: "dashboard", label: "Свод", icon: IconDashboard },
  { value: "fuel", label: "Топливо", icon: IconGasStation },
  { value: "prices", label: "Цены", icon: IconCurrencyRubel },
  { value: "reports", label: "Доклады", icon: IconFileText },
];

const FILTERS: Array<{ value: string; label: string; type?: StationType; net?: string | null }> = [
  { value: "all", label: "Все", type: "all" },
  ...NET_ORDER.map((net) => ({ value: net, label: netLabel(net), net })),
  { value: "vink", label: "ВИНК", type: "vink" },
  { value: "other", label: "Прочие", type: "other" },
];

const FUEL_LINES = [
  { key: "available", label: "Доступно", color: "#10b981" },
  { key: "diesel", label: "ДТ, ДТ+", color: "#a855f7" },
  { key: "gas92", label: "92, 92+", color: "#14b8a6" },
  { key: "gas95", label: "95, 95+, 100, 100+", color: "#ef4444" },
] as const;

function percent(part: number | null | undefined, total: number | null | undefined) {
  return total ? (Number(part ?? 0) / total) * 100 : null;
}

function NetBadge({ name, colored = false, className = "" }: { name: string; colored?: boolean; className?: string }) {
  const logo = NET_LOGOS[name];
  if (!logo) {
    return <span className={`azs-net-badge ${className}`}>{name === "Прочие" ? <IconGasStation size={18} /> : name.slice(0, 1)}</span>;
  }

  const color = colored ? brandColor(name) : undefined;
  return (
    <span className={`azs-net-badge ${className}`} title={name}>
      <svg viewBox={logo.viewBox} style={color ? { color } : undefined} aria-hidden="true">
        {logo.paths.map((path, index) => (
          <path key={index} d={path} fill={colored ? logo.brandPathColors?.[index] : undefined} />
        ))}
      </svg>
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`azs-card ${className}`}>{children}</section>;
}

function PanelTitle({ children, tip }: { children: React.ReactNode; tip?: string }) {
  return (
    <div className="azs-panel-title">
      <span>{children}</span>
      {tip && <IconInfoCircle size={16} title={tip} />}
    </div>
  );
}

function ViewTabs({ view, onView }: { view: ViewMode; onView: (view: ViewMode) => void }) {
  return (
    <Card className="azs-tabs-card">
      <div className="azs-view-tabs">
        {VIEW_TABS.map(({ value, label, icon: Icon }) => (
          <button key={value} type="button" className={view === value ? "is-active" : ""} onClick={() => onView(value)} title={label}>
            <Icon size={24} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function CompanyFilterBar({ filter, onChange }: { filter: NetFilter; onChange: (filter: NetFilter) => void }) {
  const active = filter.net ?? filter.type;
  return (
    <Card className="azs-filters-card">
      <div className="azs-filter-bar">
        {FILTERS.map((item) => {
          const isActive = active === (item.net ?? item.type);
          return (
            <button
              key={item.value}
              type="button"
              className={isActive ? "is-active" : ""}
              onClick={() => onChange({ net: item.net ?? null, type: item.type ?? "all" })}
            >
              {item.net ? <NetBadge name={item.net} /> : item.value === "all" ? <IconCircleCheck size={18} /> : item.value === "vink" ? <IconBarrel size={18} /> : <IconGasStation size={18} />}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function FuelChips({ s }: { s: NetSummary }) {
  const guns = s.guns;
  const chips = [
    ["gdt", "ДТ", "#a855f7"],
    ["g92", "АИ-92", "#14b8a6"],
    ["g95", "АИ-95 и выше", "#ef4444"],
  ] as const;
  return (
    <div className="azs-fuel-chips">
      <span>количество заправочных пистолетов на них (шт.)</span>
      <div>
        {chips.map(([key, label, color]) => (
          <b key={key} style={{ background: color }}>{fmtInt(guns?.[key])} <small>{label}</small></b>
        ))}
      </div>
    </div>
  );
}

function SidebarBlock({
  dot,
  label,
  value,
  pct,
  caption,
  children,
  className = "",
}: {
  dot?: string;
  label: string;
  value: number | null | undefined;
  pct?: number | null;
  caption?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`azs-side-block ${className}`}>
      <div className="azs-side-block__row">
        <span className="azs-side-block__label">{dot && <i style={{ background: dot }} />}{label}</span>
        <span className="azs-side-block__metric"><b>{fmtInt(value)}</b><em>{pct == null ? "" : fmtPct(pct)}</em></span>
      </div>
      {caption && <p>{caption}</p>}
      {children}
    </div>
  );
}

function SidebarHierarchy({ summary, title, filter }: { summary: NetSummary; title: string; filter: NetFilter }) {
  const available = summary.avail3 ?? summary.open;
  return (
    <Card className="azs-sidebar">
      <h2>{title}</h2>
      <div className="azs-total-block">
        <div>
          <span>Всего заправок</span>
          <strong>
            <b>{fmtInt(summary.total)}</b>
            {filter.net ? <NetBadge name={filter.net} colored className="is-large" /> : <IconChartDots3 size={42} />}
          </strong>
        </div>
        <FuelChips s={summary} />
      </div>
      <SidebarBlock dot="#22c55e" label="Работает" value={summary.open} pct={percent(summary.open, summary.total)} />
      <div className="azs-side-branch">
        <SidebarBlock label="Доступны для заправки в течении всего дня" value={available} pct={percent(available, summary.total)} />
        <div className="azs-mini-grid">
          <SidebarBlock dot="#22c55e" label="Полностью доступны" value={summary.open_full} pct={percent(summary.open_full, summary.open)} caption="отпускаются все имеющиеся виды топлива на АЗС" />
          <SidebarBlock dot="#f59e0b" label="Частично доступны" value={summary.open_partial} pct={percent(summary.open_partial, summary.open)} caption="отсутствует один или более вид топлива" />
        </div>
        <SidebarBlock label="Закрывались в течение дня" value={summary.no_fuel} pct={percent(summary.no_fuel, summary.total)}>
          <div className="azs-duration-grid">
            {[
              ["от 3 ч", summary.closed3h],
              ["от 6 ч", summary.closed6h],
              ["от 9 ч", summary.closed9h],
              ["от 12 ч", summary.closed12h],
            ].map(([label, value]) => (
              <span key={String(label)}><small>{label}</small><b>{fmtInt(value as number | null)}</b></span>
            ))}
          </div>
        </SidebarBlock>
      </div>
      <SidebarBlock dot="#ef4444" label="Закрыто" value={summary.closed_other} pct={percent(summary.closed_other, summary.total)} caption="на профилактические работы и технологическое переоснащение" />
    </Card>
  );
}

function Segment({ value, onChange }: { value: "hour" | "day"; onChange: (value: "hour" | "day") => void }) {
  return (
    <div className="azs-segment">
      <button type="button" className={value === "hour" ? "is-active" : ""} onClick={() => onChange("hour")}>Часы</button>
      <button type="button" className={value === "day" ? "is-active" : ""} onClick={() => onChange("day")}>Дни</button>
    </div>
  );
}

function FuelTrendPanel({ dataset, filter }: { dataset: AzsDataset; filter: NetFilter }) {
  const [granularity, setGranularity] = useState<"hour" | "day">("hour");
  const series = useMemo(() => buildSeries(dataset, filter), [dataset, filter]);
  return (
    <Card className="azs-chart-card">
      <header>
        <div>
          <PanelTitle tip="Работающие АЗС, на которых реализуются основные виды топлива на момент мониторинга.">
            Доступность топлива <small>(количество АЗС, шт.)</small>
          </PanelTitle>
          <p>{updatedLabel(dataset)}</p>
        </div>
        <Segment value={granularity} onChange={setGranularity} />
      </header>
      <div className="azs-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 28, right: 24, bottom: 2, left: 4 }}>
            <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
            <XAxis dataKey="key" tick={{ fill: "#d8d8d8", fontSize: 13 }} axisLine={false} tickLine={false} interval={0} tickFormatter={(value, index) => `${value}\n${series[index]?.sub ?? ""}`} />
            <YAxis tick={{ fill: "#d8d8d8", fontSize: 13 }} axisLine={false} tickLine={false} width={42} />
            <Tooltip contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, color: "#fff" }} />
            {FUEL_LINES.map((line) => (
              <Line key={line.key} type="monotone" dataKey={line.key} name={line.label} stroke={line.color} strokeWidth={3} dot={{ r: 4, fill: line.color, strokeWidth: 0 }} activeDot={{ r: 6 }} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="azs-legend">
        {FUEL_LINES.map((line) => <span key={line.key}><i style={{ background: line.color }} />{line.label}</span>)}
      </div>
    </Card>
  );
}

function QueueTrendPanel({ dataset, filter }: { dataset: AzsDataset; filter: NetFilter }) {
  const [granularity, setGranularity] = useState<"hour" | "day">("hour");
  const color = filter.net ? brandColor(filter.net) : "#10b981";
  const series = useMemo(() => buildSeries(dataset, filter), [dataset, filter]);
  return (
    <Card className="azs-chart-card">
      <header>
        <PanelTitle tip="Работающие АЗС, очередь из автомобилей на которых составляет более 5 машин.">
          Очереди <small>(количество АЗС, шт.)</small>
        </PanelTitle>
        <Segment value={granularity} onChange={setGranularity} />
      </header>
      <div className="azs-chart azs-chart--queue">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 34, right: 34, bottom: 6, left: 6 }}>
            <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
            <XAxis dataKey="key" tick={{ fill: "#d8d8d8", fontSize: 13 }} axisLine={false} tickLine={false} interval={0} />
            <YAxis tick={{ fill: "#d8d8d8", fontSize: 13 }} axisLine={false} tickLine={false} width={42} />
            <Tooltip contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, color: "#fff" }} />
            <Line type="monotone" dataKey="queue" name="Очередь" stroke={color} strokeWidth={4} dot={{ r: 5, fill: color, strokeWidth: 0 }} activeDot={{ r: 7 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function RestrictionRow({ icon, tag, value, total, caption }: { icon: React.ReactNode; tag: string; value?: number; total: number; caption: string }) {
  return (
    <div className="azs-restriction-row">
      <div>
        <span>{icon}</span>
        <b>По объёму отпуска <em>{tag}</em></b>
      </div>
      <strong>{fmtInt(value)} <small>из {fmtInt(total)} АЗС</small></strong>
      <p>{caption}</p>
    </div>
  );
}

function RestrictionsPanel({ summary }: { summary: NetSummary }) {
  return (
    <Card className="azs-restrictions">
      <h3>Ограничения на покупку топлива</h3>
      <RestrictionRow icon={<IconCar size={17} />} tag="В бак" value={summary.bak} total={summary.total} caption="не более 20–50 л топлива" />
      <RestrictionRow icon={<IconBottle size={18} />} tag="В канистры" value={summary.no_canister} total={summary.total} caption="не заправляют в канистры" />
    </Card>
  );
}

function Donut({ row }: { row: NetStatusRow }) {
  const data = [
    { name: "Работает", value: Math.max(0, row.withFuel), color: "#10b981" },
    { name: "Топливо не реализуется", value: row.noFuel, color: "#f43f5e" },
    { name: "Закрыто", value: row.closed, color: "#8b5cf6" },
  ];
  return (
    <div className="azs-net-donut">
      <div className="azs-net-donut__chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius="62%" outerRadius="88%" startAngle={90} endAngle={-270} stroke="none">
              {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <NetBadge name={row.name} />
      </div>
      <b>{fmtPct(percent(row.withFuel, row.total))}</b>
      <span>{fmtInt(row.withFuel)}/{fmtInt(row.total)}</span>
      <em>{netLabel(row.name)}</em>
    </div>
  );
}

function NetColumns({ rows }: { rows: NetStatusRow[] }) {
  return (
    <Card className="azs-net-panel">
      <PanelTitle tip="Распределение АЗС Москвы по сетевым компаниям.">АЗС по сетевым компаниям</PanelTitle>
      <div className="azs-net-grid">
        {rows.map((row) => <Donut key={row.name} row={row} />)}
      </div>
      <div className="azs-legend azs-legend--stacked">
        <span><i style={{ background: "#10b981" }} />Работает</span>
        <span><i style={{ background: "#8b5cf6" }} />Закрыто</span>
        <span><i style={{ background: "#f43f5e" }} />Топливо не реализуется на момент мониторинга</span>
      </div>
    </Card>
  );
}

function FuelSupplyView({ dataset, filter }: { dataset: AzsDataset; filter: NetFilter }) {
  const series = buildSeries(dataset, filter);
  return (
    <Card className="azs-wide-panel">
      <header>
        <PanelTitle tip="Динамика обеспеченности по видам топлива из текущего набора данных.">Топливная обеспеченность</PanelTitle>
        <span>{updatedLabel(dataset)}</span>
      </header>
      <div className="azs-supply-grid">
        {FUEL_LINES.map((line) => {
          const latest = series.at(-1)?.[line.key] ?? 0;
          const previous = series.at(-2)?.[line.key] ?? latest;
          const delta = Number(latest) - Number(previous);
          return (
            <div key={line.key} className="azs-supply-card">
              <i style={{ background: line.color }} />
              <span>{line.label}</span>
              <b>{fmtInt(Number(latest))}</b>
              <em>{delta >= 0 ? "+" : ""}{fmtInt(delta)} к прошлому срезу</em>
            </div>
          );
        })}
      </div>
      <FuelTrendPanel dataset={dataset} filter={filter} />
    </Card>
  );
}

function PricesView({ dataset, filter }: { dataset: AzsDataset; filter: NetFilter }) {
  const company = filter.net ?? "Роснефть";
  const rows = dataset.fuel.pricesByNet?.[company] ?? [];
  return (
    <div className="azs-prices-view">
      <FuelTrendPanel dataset={dataset} filter={filter} />
      <Card className="azs-price-table">
        <PanelTitle tip="Средняя цена отпускаемого топлива по выбранной группе АЗС.">Средние цены на отпускаемое топливо</PanelTitle>
        <div>
          {rows.map((row) => (
            <span key={row.code}>
              <i style={{ background: row.color }} />
              <b>{row.label}</b>
              <strong>{row.avg.toFixed(2).replace(".", ",")}</strong>
              <em>{fmtInt(row.count)} АЗС</em>
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ReportsView({ summary, rows }: { summary: NetSummary; rows: NetStatusRow[] }) {
  return (
    <Card className="azs-reports-view">
      <PanelTitle tip="Сводка собирается из тех же агрегатов, что и dashboard.">Доклады</PanelTitle>
      <div className="azs-report-paper">
        <h3>Оперативная сводка по АЗС Москвы</h3>
        <p>Всего в контуре {fmtInt(summary.total)} АЗС, работает {fmtInt(summary.open)}, доступно для заправки {fmtInt(summary.avail3 ?? summary.open)}.</p>
        <p>Ограничения в бак отмечены на {fmtInt(summary.bak)} АЗС, запрет канистр на {fmtInt(summary.no_canister)} АЗС.</p>
        <ul>
          {rows.slice(0, 5).map((row) => <li key={row.name}>{netLabel(row.name)}: {fmtPct(percent(row.withFuel, row.total))}, очередь {fmtInt(row.queue)}.</li>)}
        </ul>
      </div>
    </Card>
  );
}

export function AzsDashboardWidget({ data, initialView = "dashboard" }: AzsDashboardWidgetProps) {
  const dataset = useMemo(() => resolveDataset(data), [data]);
  const [view, setView] = useState<ViewMode>(initialView);
  const [filter, setFilter] = useState<NetFilter>(EMPTY_FILTER);
  const summary = useMemo(() => selectSummary(dataset, filter), [dataset, filter]);
  const rows = useMemo(() => netRows(dataset, filter), [dataset, filter]);
  const title = filter.net ?? (filter.type === "vink" ? "АЗС ВИНК" : filter.type === "other" ? "Прочие АЗС" : "АЗС Москвы");

  return (
    <div className="azs-dashboard-widget">
      <div className="azs-top-row">
        <ViewTabs view={view} onView={setView} />
        {view !== "reports" && <CompanyFilterBar filter={filter} onChange={setFilter} />}
      </div>

      {view === "dashboard" ? (
        <div className="azs-dashboard-grid">
          <SidebarHierarchy summary={summary} title={title} filter={filter} />
          <div className="azs-main-column">
            <FuelTrendPanel dataset={dataset} filter={filter} />
            <QueueTrendPanel dataset={dataset} filter={filter} />
          </div>
          <div className="azs-right-column">
            <RestrictionsPanel summary={summary} />
            <NetColumns rows={rows} />
          </div>
        </div>
      ) : view === "fuel" ? (
        <FuelSupplyView dataset={dataset} filter={filter} />
      ) : view === "prices" ? (
        <PricesView dataset={dataset} filter={filter} />
      ) : (
        <ReportsView summary={summary} rows={rows} />
      )}
    </div>
  );
}
