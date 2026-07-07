import { fuelCsv } from "@/lib/editor/mockData";

export const editorDefaultPrompt =
  "Собери executive dashboard 16:9 по доступности топлива в Москве: текущая ситуация, закрытые АЗС, очереди, районы риска, причины и действия.";

export const editorDefaultCsv = fuelCsv;

export const trendData = [
  { date: "01.07", Открыто: 46, "Нет топлива": 21, "Иные причины": 4 },
  { date: "02.07", Открыто: 45, "Нет топлива": 29, "Иные причины": 0 },
  { date: "03.07", Открыто: 31, "Нет топлива": 46, "Иные причины": 0 },
  { date: "04.07", Открыто: 31, "Нет топлива": 46, "Иные причины": 0 },
];

export const queueData = [
  { company: "Роснефть", Очередь: 68 },
  { company: "Лукойл", Очередь: 24 },
  { company: "Татнефть", Очередь: 23 },
  { company: "Газпром", Очередь: 22 },
  { company: "Teboil", Очередь: 15 },
  { company: "Прочие", Очередь: 14 },
];

export const donutData = [
  { name: "Открыто", value: 31 },
  { name: "Нет топлива", value: 46 },
  { name: "Иные причины", value: 8 },
];

export const exceptionRows = [
  { station: "NM-001", company: "Нефтемагистраль", district: "ЗАО", status: "no_fuel", queue: 16, risk: 98 },
  { station: "LK-002", company: "Лукойл", district: "ЦАО", status: "no_fuel", queue: 21, risk: 86 },
  { station: "GP-017", company: "Газпром", district: "ЮАО", status: "closed", queue: 8, risk: 77 },
  { station: "TN-004", company: "Татнефть", district: "САО", status: "open", queue: 3, risk: 34 },
];
