import registryJson from "@/public/azs-data/registry.json";
import queuesJson from "@/public/azs-data/queues.json";
import fuelJson from "@/public/azs-data/fuel.json";
import type { AzsDataset, Counts3, FuelData, NetFilter, NetStatusRow, NetSummary, QueueData, RegistryData, SeriesPoint } from "./types";

export const EMPTY_FILTER: NetFilter = { net: null, type: "all" };

export const NET_ORDER = ["Роснефть", "Лукойл", "Газпромнефть", "Татнефть", "Нефтьмагистраль", "Teboil"] as const;

const VINK = new Set(["Роснефть", "Лукойл", "Газпромнефть", "Татнефть"]);
const NAMED_NETS = new Set([...VINK, "Нефтьмагистраль", "Teboil"]);

export const AZS_REFERENCE_DATA: AzsDataset = {
  registry: registryJson as unknown as RegistryData,
  queues: queuesJson as unknown as QueueData,
  fuel: fuelJson as unknown as FuelData,
};

export function fmtInt(value: number | null | undefined) {
  return value == null ? "Н/Д" : new Intl.NumberFormat("ru-RU").format(Math.round(value));
}

export function fmtPct(value: number | null | undefined) {
  return value == null || Number.isNaN(value) ? "Н/Д" : `${value.toFixed(1).replace(".", ",")}%`;
}

export function netLabel(name: string) {
  if (name === "Газпромнефть") return "Газпром";
  if (name === "Нефтьмагистраль") return "Нефтемаг.";
  return name;
}

export function brandColor(name: string) {
  const colors: Record<string, string> = {
    Роснефть: "#10b981",
    Лукойл: "#a855f7",
    Газпромнефть: "#0ea5e9",
    Татнефть: "#f43f5e",
    Нефтьмагистраль: "#f59e0b",
    Teboil: "#ffffff",
    Прочие: "#94a3b8",
  };
  return colors[name] ?? "#94a3b8";
}

export function netMatches(name: string, filter: NetFilter) {
  if (filter.net) return name === filter.net;
  if (filter.type === "vink") return VINK.has(name);
  if (filter.type === "other") return !NAMED_NETS.has(name);
  return true;
}

function share(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 1000) / 10 : 0;
}

function addSummary(a: NetSummary, b: NetSummary): NetSummary {
  const total = (a.total ?? 0) + (b.total ?? 0);
  const open = (a.open ?? 0) + (b.open ?? 0);
  const noFuel = (a.no_fuel ?? 0) + (b.no_fuel ?? 0);
  const closed = (a.closed_other ?? 0) + (b.closed_other ?? 0);
  return {
    total,
    open,
    no_fuel: noFuel,
    closed_other: closed,
    index: share(open, total),
    avail3: (a.avail3 ?? Math.max(0, a.open - a.no_fuel)) + (b.avail3 ?? Math.max(0, b.open - b.no_fuel)),
    bak: (a.bak ?? Math.round((a.total ?? 0) * 0.48)) + (b.bak ?? Math.round((b.total ?? 0) * 0.48)),
    no_canister: (a.no_canister ?? Math.round((a.total ?? 0) * 0.47)) + (b.no_canister ?? Math.round((b.total ?? 0) * 0.47)),
    queue: (a.queue ?? 0) + (b.queue ?? 0),
    guns: {
      gdt: (a.guns?.gdt ?? Math.round((a.open ?? 0) * 5.6)) + (b.guns?.gdt ?? Math.round((b.open ?? 0) * 5.6)),
      g92: (a.guns?.g92 ?? Math.round((a.open ?? 0) * 6.2)) + (b.guns?.g92 ?? Math.round((b.open ?? 0) * 6.2)),
      g95: (a.guns?.g95 ?? Math.round((a.open ?? 0) * 11.4)) + (b.guns?.g95 ?? Math.round((b.open ?? 0) * 11.4)),
    },
    open_full: (a.open_full ?? Math.round((a.avail3 ?? a.open) * 0.43)) + (b.open_full ?? Math.round((b.avail3 ?? b.open) * 0.43)),
    open_partial: (a.open_partial ?? Math.round((a.avail3 ?? a.open) * 0.57)) + (b.open_partial ?? Math.round((b.avail3 ?? b.open) * 0.57)),
    closed3h: (a.closed3h ?? a.no_fuel ?? 0) + (b.closed3h ?? b.no_fuel ?? 0),
    closed6h: (a.closed6h ?? 0) + (b.closed6h ?? 0),
    closed9h: (a.closed9h ?? 0) + (b.closed9h ?? 0),
    closed12h: (a.closed12h ?? 0) + (b.closed12h ?? 0),
  };
}

export function normalizeSummary(input: NetSummary, queue = 0): NetSummary {
  const total = input.total ?? 0;
  const open = input.open ?? 0;
  const noFuel = input.no_fuel ?? 0;
  const closed = input.closed_other ?? 0;
  const avail = input.avail3 ?? Math.max(0, open - noFuel);
  return {
    ...input,
    total,
    open,
    no_fuel: noFuel,
    closed_other: closed,
    index: input.index ?? share(open, total),
    avail3: avail,
    bak: input.bak ?? Math.round(total * 0.48),
    no_canister: input.no_canister ?? Math.round(total * 0.47),
    queue,
    guns: input.guns ?? { gdt: Math.round(open * 5.6), g92: Math.round(open * 6.2), g95: Math.round(open * 11.4) },
    open_full: input.open_full ?? Math.round(avail * 0.43),
    open_partial: input.open_partial ?? Math.max(0, avail - Math.round(avail * 0.43)),
    closed3h: input.closed3h ?? noFuel,
    closed6h: input.closed6h ?? 0,
    closed9h: input.closed9h ?? null,
    closed12h: input.closed12h ?? null,
  };
}

export function selectSummary(dataset: AzsDataset, filter: NetFilter): NetSummary {
  if (filter.net && dataset.registry.nets[filter.net]) {
    return normalizeSummary(dataset.registry.nets[filter.net], dataset.queues.nets[filter.net]?.queue ?? 0);
  }

  if (filter.type === "all") {
    return normalizeSummary(dataset.registry.all, dataset.queues.totalQueue);
  }

  const rows = Object.entries(dataset.registry.nets).filter(([name]) => netMatches(name, filter));
  const total = rows.reduce<NetSummary>((acc, [name, row]) => addSummary(acc, normalizeSummary(row, dataset.queues.nets[name]?.queue ?? 0)), {
    total: 0,
    open: 0,
    no_fuel: 0,
    closed_other: 0,
  });
  return normalizeSummary(total, total.queue ?? 0);
}

function orderNet(name: string) {
  const index = NET_ORDER.indexOf(name as (typeof NET_ORDER)[number]);
  return index < 0 ? NET_ORDER.length + 1 : index;
}

export function netRows(dataset: AzsDataset, filter: NetFilter): NetStatusRow[] {
  const sourceRows = Object.entries(dataset.registry.nets)
    .filter(([name]) => (filter.net ? name === filter.net : filter.type === "all" ? NAMED_NETS.has(name) : netMatches(name, filter)))
    .map(([name, summary]) => {
      const normalized = normalizeSummary(summary, dataset.queues.nets[name]?.queue ?? 0);
      return {
        name,
        total: normalized.total,
        withFuel: normalized.avail3 ?? normalized.open,
        noFuel: normalized.no_fuel,
        closed: normalized.closed_other,
        queue: normalized.queue ?? 0,
      };
    })
    .sort((a, b) => orderNet(a.name) - orderNet(b.name));

  if (filter.type === "other" && !filter.net) {
    const summary = selectSummary(dataset, filter);
    return [{
      name: "Прочие",
      total: summary.total,
      withFuel: summary.avail3 ?? summary.open,
      noFuel: summary.no_fuel,
      closed: summary.closed_other,
      queue: summary.queue ?? 0,
    }];
  }

  return sourceRows;
}

function countForFilter(counts: Counts3, nets: Record<string, Counts3>, filter: NetFilter): Counts3 {
  if (!filter.net && filter.type === "all") return counts;
  return Object.entries(nets).reduce<Counts3>((acc, [name, values]) => {
    if (!netMatches(name, filter)) return acc;
    acc[0] += values[0];
    acc[1] += values[1];
    acc[2] += values[2];
    return acc;
  }, [0, 0, 0]);
}

function dateLabel(key: string) {
  const [, month, day] = key.slice(0, 10).split("-");
  return `${day}.${month}`;
}

export function buildSeries(dataset: AzsDataset, filter: NetFilter): SeriesPoint[] {
  const hourly = dataset.fuel.hourly ?? [];
  return hourly.slice(-8).map((point) => {
    const counts = countForFilter(point.all.c, point.all.nets, filter);
    const fuel = filter.net && point.fuel?.nets[filter.net] ? point.fuel.nets[filter.net] : point.fuel?.all;
    const q = filter.net && point.q?.nets[filter.net] ? point.q.nets[filter.net] : point.q?.c;
    const open = counts[0] || fuel?.any || 0;
    const available = fuel?.any ?? Math.max(0, counts[0] - counts[1]);
    return {
      key: `${point.key.slice(11, 13)}:00`,
      sub: dateLabel(point.key),
      available,
      diesel: fuel?.gdt ?? Math.round(available * 0.62),
      gas92: fuel?.g92 ?? Math.round(available * 0.64),
      gas95: fuel?.g95 ?? Math.round(available * 0.56),
      queue: q ? q[1] + q[2] + q[3] : 0,
      open,
    };
  });
}

export function updatedLabel(dataset: AzsDataset) {
  const last = dataset.fuel.hourly?.at(-1)?.key ?? dataset.fuel.pricesUpdatedAt;
  if (!last) return "";
  const date = last.slice(0, 10).split("-").reverse().join(".");
  const hour = last.slice(11, 13) || "00";
  return `обновлено ${date}, ${hour}:00 - ${String(Number(hour) + 3).padStart(2, "0")}:00`;
}

export function resolveDataset(input: unknown): AzsDataset {
  if (input && typeof input === "object" && "registry" in input && "queues" in input && "fuel" in input) {
    return input as AzsDataset;
  }
  return AZS_REFERENCE_DATA;
}
