"use client";

import {
  Badge,
  BadgeDelta,
  AreaChart,
  BarChart,
  BarList,
  Card,
  CategoryBar,
  DeltaBar,
  DonutChart,
  FunnelChart,
  LineChart,
  MarkerBar,
  Metric,
  ProgressBar,
  ProgressCircle,
  ScatterChart,
  SparkAreaChart,
  SparkBarChart,
  SparkLineChart,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
  Tracker,
} from "@tremor/react";
import { AzsDashboardWidget } from "@/components/azs/AzsDashboardWidget";
import { ExecutiveDashboardWidget } from "@/components/executive/ExecutiveDashboardWidget";
import type { ExecutiveDashboardSource } from "@/lib/executive/types";
import type { CanvasWidget } from "@/lib/editor/types";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export function WidgetRenderer({ widget }: { widget: CanvasWidget }) {
  const props = widget.props;

  if (widget.componentId === "azs.dashboard-shell") {
    return <AzsDashboardWidget data={props.data} initialView={props.initialView === "fuel" || props.initialView === "prices" || props.initialView === "reports" ? props.initialView : "dashboard"} />;
  }

  if (widget.componentId === "executive.dashboard-shell") {
    return <ExecutiveDashboardWidget source={props.source as ExecutiveDashboardSource | undefined} />;
  }

  if (widget.componentId === "tremor.metric-card") {
    const tone = String(props.tone ?? "blue");
    const value = Number(props.value ?? 0);
    const progress = Number(props.progress ?? 0);
    return (
      <Card className="editor-widget-tremor-card">
        <Text>{widget.title}</Text>
        <Metric>{value.toLocaleString("ru-RU")}</Metric>
        <div className="editor-widget-tremor-card__row">
          <BadgeDelta deltaType={String(props.delta ?? "").startsWith("-") ? "moderateDecrease" : "increase"}>{String(props.delta ?? "+0%")}</BadgeDelta>
          <Badge color={tone === "red" ? "rose" : tone === "green" ? "emerald" : "blue"}>{widget.sourceLibrary}</Badge>
        </div>
        <ProgressBar value={progress} color={tone === "red" ? "rose" : tone === "green" ? "emerald" : "blue"} className="mt-4" />
        {widget.subtitle && <Text className="mt-2">{widget.subtitle}</Text>}
      </Card>
    );
  }

  if (widget.componentId === "tremor.line-chart") {
    return (
      <Card className="editor-widget-tremor-card">
        <Title>{widget.title}</Title>
        {widget.subtitle && <Text>{widget.subtitle}</Text>}
        <LineChart
          className="mt-4 h-44"
          data={asArray<{ name: string; value: number }>(props.data)}
          index={String(props.index ?? "date")}
          categories={asStringArray(props.categories)}
          colors={asStringArray(props.colors)}
          showAnimation
        />
      </Card>
    );
  }

  if (widget.componentId === "tremor.area-chart") {
    return (
      <Card className="editor-widget-tremor-card">
        <Title>{widget.title}</Title>
        {widget.subtitle && <Text>{widget.subtitle}</Text>}
        <AreaChart
          className="mt-4 h-44"
          data={asArray<{ name: string; value: number }>(props.data)}
          index={String(props.index ?? "date")}
          categories={asStringArray(props.categories)}
          colors={asStringArray(props.colors)}
          showAnimation
        />
      </Card>
    );
  }

  if (widget.componentId === "tremor.bar-chart") {
    return (
      <Card className="editor-widget-tremor-card">
        <Title>{widget.title}</Title>
        {widget.subtitle && <Text>{widget.subtitle}</Text>}
        <BarChart
          className="mt-4 h-44"
          data={asArray<Record<string, unknown>>(props.data)}
          index={String(props.index ?? "company")}
          categories={asStringArray(props.categories)}
          colors={asStringArray(props.colors)}
          showAnimation
        />
      </Card>
    );
  }

  if (widget.componentId === "tremor.donut-chart") {
    return (
      <Card className="editor-widget-tremor-card">
        <Title>{widget.title}</Title>
        {widget.subtitle && <Text>{widget.subtitle}</Text>}
        <DonutChart
          className="mt-4 h-44"
          data={asArray<Record<string, unknown>>(props.data)}
          category={String(props.category ?? "value")}
          index={String(props.index ?? "name")}
          colors={asStringArray(props.colors)}
          showAnimation
        />
      </Card>
    );
  }

  if (widget.componentId === "tremor.funnel-chart") {
    return (
      <Card className="editor-widget-tremor-card">
        <Title>{widget.title}</Title>
        {widget.subtitle && <Text>{widget.subtitle}</Text>}
        <FunnelChart className="mt-4 h-44" data={asArray<{ name: string; value: number }>(props.data)} color="blue" />
      </Card>
    );
  }

  if (widget.componentId === "tremor.scatter-chart") {
    return (
      <Card className="editor-widget-tremor-card">
        <Title>{widget.title}</Title>
        {widget.subtitle && <Text>{widget.subtitle}</Text>}
        <ScatterChart
          className="mt-4 h-44"
          data={asArray<Record<string, unknown>>(props.data)}
          category={String(props.category ?? "district")}
          x={String(props.x ?? "risk")}
          y={String(props.y ?? "queue")}
          colors={asStringArray(props.colors)}
        />
      </Card>
    );
  }

  if (widget.componentId === "tremor.spark-area-chart") {
    return (
      <Card className="editor-widget-tremor-card">
        <Title>{widget.title}</Title>
        <SparkAreaChart className="mt-8 h-24" data={asArray<Record<string, unknown>>(props.data)} index={String(props.index ?? "date")} categories={asStringArray(props.categories)} colors={asStringArray(props.colors)} />
      </Card>
    );
  }

  if (widget.componentId === "tremor.spark-line-chart") {
    return (
      <Card className="editor-widget-tremor-card">
        <Title>{widget.title}</Title>
        <SparkLineChart className="mt-8 h-24" data={asArray<Record<string, unknown>>(props.data)} index={String(props.index ?? "date")} categories={asStringArray(props.categories)} colors={asStringArray(props.colors)} />
      </Card>
    );
  }

  if (widget.componentId === "tremor.spark-bar-chart") {
    return (
      <Card className="editor-widget-tremor-card">
        <Title>{widget.title}</Title>
        <SparkBarChart className="mt-8 h-24" data={asArray<Record<string, unknown>>(props.data)} index={String(props.index ?? "date")} categories={asStringArray(props.categories)} colors={asStringArray(props.colors)} />
      </Card>
    );
  }

  if (widget.componentId === "tremor.bar-list") {
    return (
      <Card className="editor-widget-tremor-card">
        <Title>{widget.title}</Title>
        <BarList data={asArray<{ name: string; value: number }>(props.data)} className="mt-4" />
      </Card>
    );
  }

  if (widget.componentId === "tremor.category-bar") {
    return (
      <Card className="editor-widget-tremor-card">
        <Title>{widget.title}</Title>
        <CategoryBar className="mt-8" values={asArray<number>(props.values)} colors={["emerald", "yellow", "orange", "rose"]} markerValue={Number(props.markerValue ?? 60)} />
      </Card>
    );
  }

  if (widget.componentId === "tremor.delta-bar") {
    return (
      <Card className="editor-widget-tremor-card">
        <Title>{widget.title}</Title>
        <DeltaBar className="mt-8" value={Number(props.value ?? 24)} />
      </Card>
    );
  }

  if (widget.componentId === "tremor.marker-bar") {
    return (
      <Card className="editor-widget-tremor-card">
        <Title>{widget.title}</Title>
        <MarkerBar className="mt-8" value={Number(props.value ?? 62)} />
      </Card>
    );
  }

  if (widget.componentId === "tremor.progress") {
    return (
      <Card className="editor-widget-tremor-card">
        <Title>{widget.title}</Title>
        <div className="mt-6 flex items-center gap-8">
          <ProgressCircle value={Number(props.value ?? 72)} radius={42} strokeWidth={8} />
          <div className="flex-1">
            <ProgressBar value={Number(props.value ?? 72)} />
          </div>
        </div>
      </Card>
    );
  }

  if (widget.componentId === "tremor.tracker") {
    return (
      <Card className="editor-widget-tremor-card">
        <Title>{widget.title}</Title>
        <Tracker data={asArray<{ color: string; tooltip: string }>(props.data)} className="mt-8" />
      </Card>
    );
  }

  if (widget.componentId === "tremor.table") {
    const rows = asArray<Record<string, string | number>>(props.rows);
    const columns = asStringArray(props.columns);
    return (
      <Card className="editor-widget-tremor-card editor-widget-table">
        <Title>{widget.title}</Title>
        <Table className="mt-3">
          <TableHead>
            <TableRow>{columns.map((column) => <TableHeaderCell key={column}>{column}</TableHeaderCell>)}</TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={`${row.station ?? index}`}>
                {columns.map((column) => <TableCell key={column}>{row[column]}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  return <div className="editor-widget-missing">Unknown component: {widget.componentId}</div>;
}
