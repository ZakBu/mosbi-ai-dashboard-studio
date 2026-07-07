"use client";

import Link from "next/link";
import {
  AreaChart,
  BadgeDelta,
  BarChart,
  BarList,
  Card,
  CategoryBar,
  DeltaBar,
  DonutChart,
  FunnelChart,
  LineChart,
  List,
  ListItem,
  MarkerBar,
  ProgressBar,
  ProgressCircle,
  ScatterChart,
  SparkAreaChart,
  SparkBarChart,
  SparkLineChart,
  Tracker,
} from "@tremor/react";
import { IconArrowRight, IconCirclePlus } from "@tabler/icons-react";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const monthlyData = [
  { date: "Jan 23", Organic: 232, Sponsored: 0, Direct: 164 },
  { date: "Feb 23", Organic: 241, Sponsored: 0, Direct: 188 },
  { date: "Mar 23", Organic: 291, Sponsored: 0, Direct: 211 },
  { date: "Apr 23", Organic: 101, Sponsored: 0, Direct: 144 },
  { date: "May 23", Organic: 318, Sponsored: 0, Direct: 263 },
  { date: "Jun 23", Organic: 205, Sponsored: 0, Direct: 201 },
  { date: "Jul 23", Organic: 372, Sponsored: 0, Direct: 288 },
  { date: "Aug 23", Organic: 341, Sponsored: 0, Direct: 276 },
  { date: "Sep 23", Organic: 387, Sponsored: 120, Direct: 305 },
  { date: "Oct 23", Organic: 220, Sponsored: 0, Direct: 244 },
  { date: "Nov 23", Organic: 372, Sponsored: 0, Direct: 298 },
  { date: "Dec 23", Organic: 321, Sponsored: 0, Direct: 280 },
];

const revenueData = [
  { month: "Jan", Revenue: 48500, Profit: 26200 },
  { month: "Feb", Revenue: 52300, Profit: 28100 },
  { month: "Mar", Revenue: 61300, Profit: 31800 },
  { month: "Apr", Revenue: 47300, Profit: 22100 },
  { month: "May", Revenue: 70100, Profit: 39200 },
  { month: "Jun", Revenue: 64200, Profit: 33600 },
];

const donutData = [
  { name: "Open", value: 456 },
  { name: "No fuel", value: 351 },
  { name: "Maintenance", value: 271 },
  { name: "Other", value: 191 },
];

const funnelData = [
  { name: "Viewed", value: 1200 },
  { name: "Added", value: 744 },
  { name: "Validated", value: 502 },
  { name: "Published", value: 308 },
];

const scatterData = [
  { risk: 12, queue: 7, district: "CAO" },
  { risk: 33, queue: 12, district: "SAO" },
  { risk: 58, queue: 18, district: "SVAO" },
  { risk: 75, queue: 24, district: "ZAO" },
  { risk: 91, queue: 31, district: "UVAO" },
  { risk: 64, queue: 16, district: "VAO" },
];

const sparkData = [
  { date: "Mon", value: 20 },
  { date: "Tue", value: 32 },
  { date: "Wed", value: 28 },
  { date: "Thu", value: 44 },
  { date: "Fri", value: 40 },
  { date: "Sat", value: 52 },
];

const barListData = [
  { name: "Rosneft", value: 456 },
  { name: "Lukoil", value: 351 },
  { name: "Tatneft", value: 271 },
  { name: "Gazprom", value: 191 },
];

const trackerData = [
  { color: "emerald", tooltip: "Operational" },
  { color: "emerald", tooltip: "Operational" },
  { color: "yellow", tooltip: "Warning" },
  { color: "rose", tooltip: "Critical" },
  { color: "emerald", tooltip: "Recovered" },
  { color: "emerald", tooltip: "Operational" },
  { color: "gray", tooltip: "No data" },
];

const summary = [
  { name: "Organic", value: 3273 },
  { name: "Sponsored", value: 120 },
];

const statusColor: Record<string, string> = {
  Organic: "bg-blue-500",
  Sponsored: "bg-violet-500",
};

const valueFormatter = (number: number) => `${Intl.NumberFormat("us").format(number).toString()}`;
const currencyFormatter = (number: number) => `$${Intl.NumberFormat("us").format(number).toString()}`;

const charts = [
  {
    id: "tremor.area-chart",
    name: "AreaChart",
    description: "Official Tremor area chart card, matching the example structure with Card, AreaChart, List and ListItem.",
    component: (
      <Card className="sm:mx-auto sm:max-w-lg">
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Follower metrics</h3>
        <AreaChart
          data={monthlyData}
          index="date"
          categories={["Organic", "Sponsored"]}
          colors={["blue", "violet"]}
          valueFormatter={valueFormatter}
          showLegend={false}
          showYAxis={false}
          showGradient={false}
          startEndOnly={true}
          className="mt-6 h-32"
        />
        <List className="mt-2">
          {summary.map((item) => (
            <ListItem key={item.name}>
              <div className="flex items-center space-x-2">
                <span className={classNames(statusColor[item.name], "h-0.5 w-3")} aria-hidden={true} />
                <span>{item.name}</span>
              </div>
              <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">{valueFormatter(item.value)}</span>
            </ListItem>
          ))}
        </List>
      </Card>
    ),
  },
  {
    id: "tremor.line-chart",
    name: "LineChart",
    description: "Tremor line chart for multi-series time dynamics.",
    component: (
      <Card>
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Revenue dynamics</h3>
        <LineChart className="mt-6 h-56" data={revenueData} index="month" categories={["Revenue", "Profit"]} colors={["blue", "emerald"]} valueFormatter={currencyFormatter} yAxisWidth={58} />
      </Card>
    ),
  },
  {
    id: "tremor.bar-chart",
    name: "BarChart",
    description: "Tremor bar chart for category comparison and rankings.",
    component: (
      <Card>
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Company queues</h3>
        <BarChart className="mt-6 h-56" data={barListData} index="name" categories={["value"]} colors={["amber"]} valueFormatter={valueFormatter} yAxisWidth={42} />
      </Card>
    ),
  },
  {
    id: "tremor.donut-chart",
    name: "DonutChart",
    description: "Tremor donut chart for compact 2-5 part composition.",
    component: (
      <Card>
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Status mix</h3>
        <DonutChart className="mt-6 h-56" data={donutData} category="value" index="name" colors={["emerald", "rose", "amber", "slate"]} valueFormatter={valueFormatter} />
      </Card>
    ),
  },
  {
    id: "tremor.funnel-chart",
    name: "FunnelChart",
    description: "Tremor funnel chart for conversion or pipeline stages.",
    component: (
      <Card>
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Dashboard publishing funnel</h3>
        <FunnelChart className="mt-6 h-56" data={funnelData} color="blue" valueFormatter={valueFormatter} />
      </Card>
    ),
  },
  {
    id: "tremor.scatter-chart",
    name: "ScatterChart",
    description: "Tremor scatter chart for correlation and quadrant analysis.",
    component: (
      <Card>
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Risk vs queue</h3>
        <ScatterChart className="mt-6 h-56" data={scatterData} category="district" x="risk" y="queue" colors={["blue"]} valueFormatter={{ x: valueFormatter, y: valueFormatter }} />
      </Card>
    ),
  },
  {
    id: "tremor.spark-area-chart",
    name: "SparkAreaChart",
    description: "Tremor spark area chart for compact cards.",
    component: (
      <Card>
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Spark area</h3>
        <p className="mt-2 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">52.4%</p>
        <SparkAreaChart className="mt-6 h-20" data={sparkData} index="date" categories={["value"]} colors={["blue"]} />
      </Card>
    ),
  },
  {
    id: "tremor.spark-line-chart",
    name: "SparkLineChart",
    description: "Tremor spark line chart for minimal trend display.",
    component: (
      <Card>
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Spark line</h3>
        <SparkLineChart className="mt-8 h-24" data={sparkData} index="date" categories={["value"]} colors={["emerald"]} />
      </Card>
    ),
  },
  {
    id: "tremor.spark-bar-chart",
    name: "SparkBarChart",
    description: "Tremor spark bar chart for compact categorical changes.",
    component: (
      <Card>
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Spark bar</h3>
        <SparkBarChart className="mt-8 h-24" data={sparkData} index="date" categories={["value"]} colors={["violet"]} />
      </Card>
    ),
  },
  {
    id: "tremor.bar-list",
    name: "BarList",
    description: "Tremor bar list for rankings.",
    component: (
      <Card>
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Network ranking</h3>
        <BarList data={barListData} className="mt-4" valueFormatter={valueFormatter} />
      </Card>
    ),
  },
  {
    id: "tremor.category-bar",
    name: "CategoryBar",
    description: "Tremor category bar for threshold ranges and segmented states.",
    component: (
      <Card>
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Risk threshold</h3>
        <CategoryBar className="mt-8" values={[25, 35, 25, 15]} colors={["emerald", "yellow", "orange", "rose"]} markerValue={72} />
      </Card>
    ),
  },
  {
    id: "tremor.delta-bar",
    name: "DeltaBar",
    description: "Tremor delta bar for positive/negative variance.",
    component: (
      <Card>
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Plan variance</h3>
        <DeltaBar className="mt-8" value={34} />
      </Card>
    ),
  },
  {
    id: "tremor.marker-bar",
    name: "MarkerBar",
    description: "Tremor marker bar for target progress.",
    component: (
      <Card>
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Target marker</h3>
        <MarkerBar className="mt-8" value={62} markerTooltip="Target" />
      </Card>
    ),
  },
  {
    id: "tremor.progress",
    name: "ProgressBar + ProgressCircle",
    description: "Tremor progress primitives for KPI/status widgets.",
    component: (
      <Card>
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">SLA completion</h3>
        <div className="mt-6 flex items-center justify-between">
          <ProgressCircle value={72} radius={42} strokeWidth={8}>
            <span className="text-tremor-default font-medium text-tremor-content-strong">72%</span>
          </ProgressCircle>
          <div className="w-2/3">
            <ProgressBar value={72} />
            <div className="mt-4 flex items-center gap-2">
              <BadgeDelta deltaType="increase">+12.4%</BadgeDelta>
              <span className="text-tremor-default text-tremor-content">vs previous period</span>
            </div>
          </div>
        </div>
      </Card>
    ),
  },
  {
    id: "tremor.tracker",
    name: "Tracker",
    description: "Tremor tracker for operational state over time.",
    component: (
      <Card>
        <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Operational tracker</h3>
        <Tracker data={trackerData} className="mt-8" />
      </Card>
    ),
  },
];

export function DashboardKit() {
  return (
    <main className="tremor-library">
      <header className="tremor-library__header">
        <div>
          <Link href="/" className="tremor-library__brand">mos<span>.</span>bi</Link>
          <h1>Tremor base chart library.</h1>
          <p>
            Первая базовая библиотека без переизобретения визуала: реальные компоненты из <code>@tremor/react</code>,
            собранные как examples и готовые для подключения к редактору.
          </p>
        </div>
        <div className="tremor-library__actions">
          <Link href="/dashboards/editor" className="tremor-library__primary">
            Открыть редактор <IconArrowRight size={17} />
          </Link>
        </div>
      </header>

      <section className="tremor-library__grid">
        {charts.map((chart) => (
          <article key={chart.id} className="tremor-example-card">
            <header>
              <div>
                <span>@tremor/react</span>
                <h2>{chart.name}</h2>
              </div>
              <Link href={`/dashboards/editor?seed=${encodeURIComponent(chart.id)}`}>
                <IconCirclePlus size={18} />
                Add
              </Link>
            </header>
            <div className="tremor-example-card__preview">{chart.component}</div>
            <p>{chart.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
