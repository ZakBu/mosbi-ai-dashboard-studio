export type StationType = "all" | "vink" | "other";

export type NetFilter = {
  net: string | null;
  type: StationType;
};

export type Counts3 = [number, number, number];

export type NetSummary = {
  total: number;
  open: number;
  no_fuel: number;
  closed_other: number;
  index?: number;
  avail3?: number;
  bak?: number;
  no_canister?: number;
  queue?: number;
  guns?: {
    gdt: number;
    g92: number;
    g95: number;
  } | null;
  open_full?: number | null;
  open_partial?: number | null;
  closed3h?: number | null;
  closed6h?: number | null;
  closed9h?: number | null;
  closed12h?: number | null;
};

export type RegistryData = {
  region: string;
  all: NetSummary;
  nets: Record<string, NetSummary>;
};

export type QueueData = {
  region: string;
  totalQueue: number;
  nets: Record<string, { queue: number; total: number; share?: number | null }>;
};

export type HourlyPoint = {
  key: string;
  all: {
    c: Counts3;
    nets: Record<string, Counts3>;
  };
  q?: {
    c: [number, number, number, number];
    nets: Record<string, [number, number, number, number]>;
  };
  fuel?: {
    all: { any: number; g92: number; g95: number; gdt: number };
    nets: Record<string, { any: number; g92: number; g95: number; gdt: number }>;
  };
};

export type FuelData = {
  available?: boolean;
  pricesUpdatedAt?: string;
  hourly?: HourlyPoint[];
  pricesByNet?: Record<string, Array<{ code: string; label: string; color: string; avg: number; count: number }>>;
};

export type AzsDataset = {
  registry: RegistryData;
  queues: QueueData;
  fuel: FuelData;
};

export type SeriesPoint = {
  key: string;
  sub?: string;
  available: number;
  diesel: number;
  gas92: number;
  gas95: number;
  queue: number;
  open: number;
};

export type NetStatusRow = {
  name: string;
  total: number;
  withFuel: number;
  noFuel: number;
  closed: number;
  queue: number;
};
