import type { DashboardIntent, DashboardPlan, DatasetProfile, FilterPlan } from "./types";

function column(profile: DatasetProfile, candidates: string[]) {
  const lower = new Map(profile.columns.map((item) => [item.name.toLowerCase(), item.name]));
  for (const candidate of candidates) {
    const exact = lower.get(candidate.toLowerCase());
    if (exact) return exact;
  }

  return profile.columns.find((item) =>
    candidates.some((candidate) => item.name.toLowerCase().includes(candidate.toLowerCase()))
  )?.name;
}

function inferIntent(prompt: string, profile: DatasetProfile): DashboardIntent {
  const text = `${prompt} ${profile.columns.map((item) => item.name).join(" ")}`.toLowerCase();
  if (text.includes("топлив") || text.includes("азс") || text.includes("fuel")) return "fuel_moscow";
  if (text.includes("план") || text.includes("fact") || text.includes("budget") || text.includes("бюдж")) return "financial_plan_fact";
  if (text.includes("сотруд") || text.includes("workload") || text.includes("загруз")) return "workload";
  if (text.includes("населен") || text.includes("population")) return "population";
  return "generic_operations";
}

export function createDemoDashboardPlan(prompt: string, profile: DatasetProfile): DashboardPlan {
  const intent = inferIntent(prompt, profile);
  const dateColumn = profile.dateRange?.column || column(profile, ["date", "day", "created_at"]);
  const companyColumn = column(profile, ["company", "network", "сеть", "компания"]);
  const districtColumn = column(profile, ["district", "район", "area", "region"]);
  const stationColumn = column(profile, ["station_id", "station", "object_id", "object"]);
  const statusColumn = column(profile, ["status", "статус"]);
  const queueColumn = column(profile, ["queue_count", "queue", "очеред"]);
  const riskColumn = column(profile, ["risk_score", "risk", "риск"]);

  if (intent === "fuel_moscow" && statusColumn) {
    return {
      title: "Топливный комплекс Москвы — executive dashboard",
      audience: "executive",
      format: "16:9",
      theme: "executive-dark",
      intent,
      filters: ([
        { id: "period", label: "Период", type: "period", sourceColumn: dateColumn, defaultValue: profile.dateRange?.max },
        { id: "company", label: "Сеть", type: "multi_select", sourceColumn: companyColumn, defaultValue: "Все" },
        { id: "district", label: "Район", type: "multi_select", sourceColumn: districtColumn, defaultValue: "Все" },
        { id: "status", label: "Статус", type: "multi_select", sourceColumn: statusColumn, defaultValue: "Все" },
      ] satisfies FilterPlan[]).filter((filter) => filter.sourceColumn || filter.id === "period"),
      widgets: [
        {
          id: "kpi_total",
          type: "kpi",
          title: "Всего АЗС",
          intent: "Показать масштаб мониторинга на последнем срезе.",
          metric: { aggregation: "count_distinct", sourceColumn: stationColumn || statusColumn },
          layout: { x: 0, y: 0, w: 3, h: 2 },
          accent: "neutral",
        },
        {
          id: "kpi_open",
          type: "status_kpi",
          title: "Доступно",
          intent: "Показать количество открытых АЗС и долю от общего числа.",
          metric: { aggregation: "count", sourceColumn: statusColumn, statusColumn },
          layout: { x: 3, y: 0, w: 3, h: 2 },
          accent: "green",
        },
        {
          id: "kpi_no_fuel",
          type: "status_kpi",
          title: "Нет топлива",
          intent: "Показать критичный статус дефицита топлива.",
          metric: { aggregation: "count", sourceColumn: statusColumn, statusColumn },
          layout: { x: 6, y: 0, w: 3, h: 2 },
          accent: "red",
        },
        {
          id: "kpi_critical",
          type: "status_kpi",
          title: "Критичный риск",
          intent: "Показать объекты с высоким risk_score.",
          metric: { aggregation: "count", sourceColumn: riskColumn, riskColumn },
          layout: { x: 9, y: 0, w: 3, h: 2 },
          accent: "orange",
        },
        {
          id: "trend_availability",
          type: "line",
          title: "Динамика доступности топлива",
          subtitle: "открыто / нет топлива / иные причины",
          intent: "Показать изменение статусов по датам.",
          metric: { timeColumn: dateColumn, statusColumn },
          layout: { x: 0, y: 2, w: 7, h: 4 },
          accent: "green",
        },
        {
          id: "map_risk",
          type: "map",
          title: "Карта районов риска",
          subtitle: "агрегированный risk_score по району",
          intent: "Показать территории с максимальным риском.",
          metric: { groupBy: districtColumn, riskColumn, valueColumn: riskColumn, aggregation: "avg" },
          layout: { x: 7, y: 2, w: 5, h: 4 },
          accent: "coral",
        },
        {
          id: "queue_by_company",
          type: "bar",
          title: "Очереди по сетям",
          subtitle: "суммарное количество ожидающих",
          intent: "Сравнить нагрузку по сетевым компаниям.",
          metric: { groupBy: companyColumn, valueColumn: queueColumn, aggregation: "sum" },
          layout: { x: 0, y: 6, w: 4, h: 3 },
          accent: "orange",
        },
        {
          id: "company_status",
          type: "stacked_bar",
          title: "Статус по сетям",
          subtitle: "открыто / нет топлива / иные причины",
          intent: "Показать состав статусов по сетям.",
          metric: { groupBy: companyColumn, statusColumn },
          layout: { x: 4, y: 6, w: 4, h: 3 },
          accent: "violet",
        },
        {
          id: "exceptions",
          type: "table",
          title: "Проблемные объекты",
          subtitle: "требуют проверки диспетчером",
          intent: "Показать объекты с закрытиями или высоким риском.",
          metric: { statusColumn, riskColumn },
          layout: { x: 8, y: 6, w: 4, h: 3 },
          accent: "neutral",
        },
        {
          id: "ai_summary",
          type: "ai_summary",
          title: "Управленческий вывод",
          intent: "Сформулировать краткий вывод по KPI, рискам и исключениям.",
          layout: { x: 0, y: 9, w: 12, h: 2 },
          accent: "coral",
        },
      ],
      narrative: [
        "Оценить доступность на последнем срезе.",
        "Выделить территорию и сеть с максимальным риском.",
        "Показать, какие объекты требуют проверки.",
      ],
    };
  }

  const categoryColumn = profile.columns.find((item) => item.type === "string")?.name || profile.columns[0]?.name || "category";
  const valueColumn = profile.columns.find((item) => item.type === "number")?.name;

  return {
    title: "AI-generated analytical dashboard",
    audience: "executive",
    format: "16:9",
    theme: "executive-dark",
    intent,
    filters: [{ id: "category", label: categoryColumn, type: "multi_select", sourceColumn: categoryColumn, defaultValue: "Все" }],
    widgets: [
      {
        id: "total",
        type: "kpi",
        title: valueColumn ? `Итого ${valueColumn}` : "Всего строк",
        intent: "Показать общий масштаб данных.",
        metric: { aggregation: valueColumn ? "sum" : "count", sourceColumn: valueColumn || categoryColumn, valueColumn },
        layout: { x: 0, y: 0, w: 3, h: 2 },
        accent: "coral",
      },
      {
        id: "rank",
        type: "bar",
        title: `Рейтинг по ${categoryColumn}`,
        intent: "Показать ведущие категории.",
        metric: { groupBy: categoryColumn, valueColumn, aggregation: valueColumn ? "sum" : "count" },
        layout: { x: 3, y: 0, w: 5, h: 5 },
        accent: "green",
      },
      {
        id: "table",
        type: "table",
        title: "Детальные строки",
        intent: "Дать проверяемую детализацию.",
        layout: { x: 8, y: 0, w: 4, h: 5 },
        accent: "neutral",
      },
      {
        id: "ai_summary",
        type: "ai_summary",
        title: "Вывод",
        intent: "Сформулировать краткий вывод по данным.",
        layout: { x: 0, y: 5, w: 12, h: 2 },
        accent: "coral",
      },
    ],
    narrative: [
      "Собрать управленческий обзор по входным данным.",
      "Показать главный показатель, рейтинг и детализацию.",
      "Оставить структуру проверяемой через исходные строки.",
    ],
  };
}
