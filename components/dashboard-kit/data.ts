import type { ReactNode } from "react";

export type StatusKey = "open" | "noFuel" | "other";

export type Company = {
  id: string;
  name: string;
  short: string;
  mark: string;
  color: string;
  total: number;
  open: number;
  noFuel: number;
  other: number;
  availability: number[];
  noFuelTrend: number[];
  otherTrend: number[];
  queue: number;
  queueRatio: string;
};

export type CategoryBar = {
  id: string;
  label: string;
  icon: ReactNode;
  total: number;
  open: number;
  noFuel: number;
  other: number;
  queue: number;
};

export const companies: Company[] = [
  {
    id: "rosneft",
    name: "Роснефть",
    short: "РН",
    mark: "Р",
    color: "#f7c56b",
    total: 157,
    open: 141,
    noFuel: 11,
    other: 5,
    availability: [78.4, 78.2, 76.9, 75.8, 74.6, 73.1, 72.4],
    noFuelTrend: [16.8, 17.1, 18.4, 19.2, 20.1, 21.6, 22.7],
    otherTrend: [4.8, 4.7, 4.7, 5.0, 5.3, 5.3, 4.9],
    queue: 111,
    queueRatio: "78,7%",
  },
  {
    id: "lukoil",
    name: "Лукойл",
    short: "ЛК",
    mark: "ЛК",
    color: "#e2153b",
    total: 684,
    open: 449,
    noFuel: 195,
    other: 40,
    availability: [76.9, 73.4, 72.5, 67.1, 65.6],
    noFuelTrend: [18.4, 21, 22.2, 26.8, 28.5],
    otherTrend: [4.7, 5.6, 5.3, 6.1, 5.8],
    queue: 53,
    queueRatio: "52,0%",
  },
  {
    id: "tatneft",
    name: "Татнефть",
    short: "ТН",
    mark: "Т",
    color: "#16c59a",
    total: 42,
    open: 30,
    noFuel: 9,
    other: 3,
    availability: [73.8, 72.6, 71.4, 71.4],
    noFuelTrend: [19, 20.2, 21.4, 21.4],
    otherTrend: [7.1, 7.1, 7.1, 7.1],
    queue: 7,
    queueRatio: "16,7%",
  },
  {
    id: "gazprom",
    name: "Газпром",
    short: "ГП",
    mark: "Г",
    color: "#4ba9df",
    total: 115,
    open: 59,
    noFuel: 23,
    other: 33,
    availability: [68.4, 66.2, 65.1, 63.7, 61.8],
    noFuelTrend: [17.2, 18.4, 19.8, 20.1, 20.6],
    otherTrend: [8.1, 8.4, 8.7, 9.6, 10.8],
    queue: 23,
    queueRatio: "39,0%",
  },
  {
    id: "neftmagistral",
    name: "Нефтемагистраль",
    short: "НМ",
    mark: "Н",
    color: "#f2f2f2",
    total: 60,
    open: 24,
    noFuel: 26,
    other: 10,
    availability: [66.2, 64.4, 66.8, 68.6, 67.4],
    noFuelTrend: [24.1, 25.5, 26.8, 28.1, 27.4],
    otherTrend: [5.4, 5.8, 5.5, 5.1, 5.2],
    queue: 2,
    queueRatio: "8,3%",
  },
  {
    id: "teboil",
    name: "Teboil",
    short: "TB",
    mark: "T",
    color: "#ffffff",
    total: 60,
    open: 44,
    noFuel: 13,
    other: 3,
    availability: [74.1, 73.3, 73.3, 73.3, 72.9],
    noFuelTrend: [20.5, 21.3, 21.7, 21.9, 22.3],
    otherTrend: [4.6, 4.8, 5.0, 4.8, 4.8],
    queue: 13,
    queueRatio: "29,5%",
  },
  {
    id: "other",
    name: "Прочие",
    short: "П",
    mark: "П",
    color: "#808899",
    total: 101,
    open: 56,
    noFuel: 29,
    other: 16,
    availability: [68.2, 67.6, 66.7, 65.9, 65.6],
    noFuelTrend: [24.9, 25.2, 26.1, 27.4, 28.5],
    otherTrend: [6.1, 6.0, 5.8, 5.8, 5.9],
    queue: 1,
    queueRatio: "1,8%",
  },
];

export const districtStatus: CategoryBar[] = [
  { id: "cao", label: "ЦАО", icon: "Ц", total: 42, open: 16, noFuel: 15, other: 11, queue: 15 },
  { id: "sao", label: "САО", icon: "С", total: 42, open: 11, noFuel: 20, other: 11, queue: 11 },
  { id: "svao", label: "СВАО", icon: "СВ", total: 42, open: 7, noFuel: 25, other: 10, queue: 7 },
  { id: "vao", label: "ВАО", icon: "В", total: 42, open: 4, noFuel: 24, other: 14, queue: 4 },
  { id: "uao", label: "ЮАО", icon: "Ю", total: 42, open: 4, noFuel: 22, other: 16, queue: 3 },
  { id: "zao", label: "ЗАО", icon: "З", total: 42, open: 2, noFuel: 28, other: 12, queue: 2 },
  { id: "other", label: "Прочие", icon: "П", total: 42, open: 2, noFuel: 28, other: 12, queue: 0 },
];

export const timeLabels = ["09:00\n01.07", "12:00\n01.07", "15:00\n01.07", "18:00\n01.07", "21:00\n01.07", "00:00\n02.07", "09:00\n02.07"];

export function getTotalStatus() {
  return companies.reduce(
    (acc, company) => ({
      total: acc.total + company.total,
      open: acc.open + company.open,
      noFuel: acc.noFuel + company.noFuel,
      other: acc.other + company.other,
      queue: acc.queue + company.queue,
    }),
    { total: 0, open: 0, noFuel: 0, other: 0, queue: 0 },
  );
}

export function toPercent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 1000) / 10;
}
