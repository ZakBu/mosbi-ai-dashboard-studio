import Link from "next/link";
import {
  ArrowRight,
  Braces,
  Database,
  LockKeyhole,
  MessageSquareText,
  MonitorUp,
  ShieldCheck,
} from "lucide-react";

const widgetRows = [
  ["01", "KPI", "Большое число, динамика, цель", "scalar / target"],
  ["02", "Trend", "Линия, площадь, прогноз", "time-series"],
  ["03", "Rank", "Топ / низ, сравнение сегментов", "ranked"],
  ["04", "Map", "Округа, объекты, гео-риск", "geo"],
  ["05", "Heatmap", "Плотность, пики, аномалии", "matrix"],
  ["06", "Insight", "Короткий вывод с источниками", "narrative"],
  ["07", "Table", "Drilldown, аудит, экспорт", "tabular"],
  ["08", "Trust", "Lineage для каждого числа", "meta"],
];

const principles = [
  {
    n: "01",
    title: "Вопрос",
    text: "Пользователь формулирует управленческую задачу без SQL и ручной сборки.",
    icon: MessageSquareText,
  },
  {
    n: "02",
    title: "Метрика",
    text: "Система работает только с утвержденными показателями, фильтрами и правами.",
    icon: Database,
  },
  {
    n: "03",
    title: "Экран",
    text: "Результат — редактируемый 16:9, mobile или TV dashboard в едином стиле.",
    icon: MonitorUp,
  },
];

function MosMark({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={small ? "relative h-6 w-10" : "relative h-8 w-12"}>
        <span className="absolute left-0 top-0 h-6 w-6 rounded-full bg-[#E46A5D]" />
        <span className="absolute left-4 top-0 h-6 w-6 rounded-full bg-[#F4B88E]" />
        <span className="absolute left-[14px] top-0 h-6 w-4 rounded-full bg-[#080A0C]" />
      </div>
      <div>
        <div className={small ? "text-xl font-semibold leading-none" : "text-2xl font-semibold leading-none"}>
          mos<span className="text-[#E46A5D]">.</span>bi
        </div>
        {!small && (
          <div className="mt-1 text-[10px] font-medium leading-none text-white/38">
            Интеллектуальный слой Москвы
          </div>
        )}
      </div>
    </div>
  );
}

function MiniTrend({ coral = true }: { coral?: boolean }) {
  return (
    <svg viewBox="0 0 260 72" className="h-16 w-full" aria-hidden="true">
      <path
        d="M4 56 C28 38 46 48 67 31 C91 11 111 43 132 29 C155 13 174 38 197 25 C220 12 238 18 256 6"
        fill="none"
        stroke={coral ? "#E46A5D" : "#8A929C"}
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

function ProductFrame() {
  return (
    <div className="quiet-product">
      <div className="quiet-product__bar">
        <span>Экран 1 · Выручка малого бизнеса</span>
        <span>16:9 · MTD · RUB · approved</span>
      </div>

      <div className="quiet-product__grid">
        {[
          ["Выручка всего", "12 340", "млн ₽", "+12,5%"],
          ["Средний чек", "2 870", "₽", "+8,2%"],
          ["Компаний", "45 672", "", "+6,7%"],
        ].map(([label, value, unit, delta]) => (
          <div key={label} className="quiet-card">
            <div className="text-[12px] text-white/46">{label}</div>
            <div className="mt-5 flex items-end gap-2">
              <span className="text-3xl font-semibold text-white">{value}</span>
              <span className="pb-1 text-[11px] text-white/34">{unit}</span>
            </div>
            <div className="mt-1 text-[12px] font-semibold text-[#31B27A]">{delta}</div>
            <MiniTrend />
          </div>
        ))}

        <div className="quiet-card quiet-card--wide">
          <div className="mb-7 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-white">Динамика по дням</span>
            <span className="text-[11px] text-white/32">текущий · прошлый</span>
          </div>
          <div className="relative h-52 overflow-hidden rounded-md border border-white/8 bg-[#0B0F12] p-4">
            <span className="absolute inset-x-4 top-1/3 border-t border-dashed border-white/10" />
            <span className="absolute inset-x-4 top-2/3 border-t border-dashed border-white/10" />
            <svg viewBox="0 0 560 210" className="relative h-full w-full">
              <path d="M4 166 C45 112 76 142 116 93 C161 38 194 157 238 100 C286 38 320 139 365 92 C412 42 450 86 502 44 C528 24 544 22 556 14" fill="none" stroke="#E46A5D" strokeWidth="4" strokeLinecap="round" />
              <path d="M4 184 C52 148 83 156 127 122 C170 90 210 137 257 117 C302 98 348 116 389 78 C432 40 484 70 556 26" fill="none" stroke="#8A929C" strokeWidth="3" strokeLinecap="round" opacity=".7" />
            </svg>
          </div>
        </div>

        <div className="quiet-card">
          <div className="mb-6 text-[12px] font-semibold text-white">Топ округов</div>
          {[
            ["ЦАО", "2 840", "92%"],
            ["ЮАО", "1 980", "74%"],
            ["САО", "1 720", "61%"],
            ["ЗАО", "1 540", "49%"],
            ["СВАО", "1 290", "39%"],
          ].map(([name, value, width]) => (
            <div key={name} className="mb-4 grid grid-cols-[38px_1fr_48px] items-center gap-3 text-[12px]">
              <span className="text-white/50">{name}</span>
              <span className="h-1 overflow-hidden rounded-full bg-white/8">
                <span className="block h-full rounded-full bg-[#E46A5D]" style={{ width }} />
              </span>
              <span className="text-right text-white/62">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E46A5D]">{children}</div>;
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080A0C] text-white">
      <header className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-8 md:px-10">
        <Link href="/" aria-label="mos.bi home">
          <MosMark />
        </Link>
        <nav className="hidden items-center gap-9 text-sm text-white/50 md:flex">
          <a href="#product" className="transition hover:text-white">Продукт</a>
          <a href="#system" className="transition hover:text-white">Система</a>
          <a href="#widgets" className="transition hover:text-white">Виджеты</a>
          <a href="#trust" className="transition hover:text-white">Доверие</a>
        </nav>
        <Link href="/dashboard-kit" className="quiet-button quiet-button--filled">
          Открыть библиотеку
          <ArrowRight size={16} />
        </Link>
      </header>

      <section className="mx-auto max-w-[1440px] px-6 pb-28 pt-20 md:px-10 md:pb-36 md:pt-32">
        <div className="hero-grid">
          <div className="min-w-0">
            <h1 className="hero-title">
              <span>Дашборд из</span>
              <span>управленческого</span>
              <span>вопроса.</span>
            </h1>
          </div>
          <div className="min-w-0 max-w-md lg:pb-4">
            <p className="text-pretty text-xl leading-9 text-white/58">
              mos.bi превращает запрос руководителя в редактируемый экран на
              доверенных метриках. Без ручной сборки. Без хаоса в формулах.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/dashboard-kit" className="quiet-button quiet-button--filled">
                Создать экран
                <ArrowRight size={16} />
              </Link>
              <a href="#product" className="quiet-button">
                Смотреть продукт
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="mx-auto max-w-[1440px] px-6 pb-36 md:px-10">
        <div className="mb-8 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-[1fr_420px]">
          <SectionLabel>Product proof</SectionLabel>
          <p className="text-lg leading-8 text-white/52">
            Первый результат не картинка. Это dashboard schema, виджеты, данные,
            доверие к метрикам и возможность править экран руками или через чат.
          </p>
        </div>
        <ProductFrame />
      </section>

      <section id="system" className="border-y border-white/10">
        <div className="mx-auto grid max-w-[1440px] gap-16 px-6 py-32 md:px-10 lg:grid-cols-[420px_1fr]">
          <div>
            <SectionLabel>System</SectionLabel>
            <h2 className="mt-6 max-w-lg text-balance text-5xl font-semibold leading-[1] tracking-[-0.015em] md:text-7xl">
              Не генератор графиков. Слой принятия решений.
            </h2>
          </div>
          <div className="grid gap-px border border-white/10 bg-white/10 md:grid-cols-3">
            {principles.map((item) => (
              <div key={item.n} className="bg-[#080A0C] p-7 md:min-h-[320px]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#E46A5D]">{item.n}</span>
                  <item.icon size={22} strokeWidth={1.5} className="text-white/42" />
                </div>
                <h3 className="mt-16 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/48">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="widgets" className="mx-auto grid max-w-[1440px] gap-20 px-6 py-36 md:px-10 lg:grid-cols-[420px_1fr]">
        <div>
          <SectionLabel>Widget library</SectionLabel>
          <h2 className="mt-6 max-w-md text-balance text-5xl font-semibold leading-[1] tracking-[-0.015em] md:text-7xl">
            Меньше вариантов. Больше точности.
          </h2>
          <p className="mt-8 max-w-sm text-base leading-8 text-white/48">
            Каждый виджет описан как продуктовый компонент: размеры, данные,
            мобильный вариант, ограничения и trust-информация.
          </p>
        </div>
        <div className="quiet-table">
          {widgetRows.map(([n, name, text, type]) => (
            <div key={n} className="quiet-row">
              <span className="text-white/28">{n}</span>
              <span className="font-semibold text-white">{name}</span>
              <span className="text-white/54">{text}</span>
              <span className="hidden font-mono text-[12px] text-[#F4B88E]/70 md:block">{type}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="trust" className="mx-auto max-w-[1440px] px-6 pb-36 md:px-10">
        <div className="grid gap-10 border-y border-white/10 py-20 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionLabel>Trust layer</SectionLabel>
            <h2 className="mt-6 max-w-xl text-balance text-5xl font-semibold leading-[1] tracking-[-0.015em] md:text-7xl">
              Число должно объяснять себя.
            </h2>
          </div>
          <div className="grid gap-5">
            {[
              [Braces, "Dashboard schema", "Экран хранится как проверяемая JSON-схема, а не как набор случайных блоков."],
              [Database, "Semantic layer", "AI выбирает только утвержденные метрики, измерения и фильтры."],
              [ShieldCheck, "Provenance", "Каждый виджет показывает источник, период, владельца и время обновления."],
              [LockKeyhole, "Read-only access", "MCP и ChatGPT работают через ограниченные tools и audit trail."],
            ].map(([Icon, title, text]) => {
              const TypedIcon = Icon as typeof Braces;
              return (
                <div key={title as string} className="quiet-proof">
                  <TypedIcon size={20} strokeWidth={1.5} className="text-[#F4B88E]" />
                  <div>
                    <h3 className="text-lg font-semibold">{title as string}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/48">{text as string}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-20 md:px-10">
        <div className="grid min-h-[480px] items-end border border-white/10 p-8 md:p-12 lg:grid-cols-[1fr_420px]">
          <div>
            <h2 className="max-w-3xl text-balance text-5xl font-semibold leading-[1] tracking-[-0.015em] md:text-8xl">
              Первый экран можно собрать сегодня.
            </h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-white/52">
              Начните с executive 16:9: выручка, план-факт, регионы, риски и
              короткий вывод на доверенных метриках.
            </p>
            <Link href="/dashboards/editor" className="quiet-button quiet-button--filled mt-8">
              Открыть редактор
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1440px] flex-col justify-between gap-6 border-t border-white/10 px-6 py-8 text-sm text-white/36 md:flex-row md:items-center md:px-10">
        <MosMark small />
        <div className="flex flex-wrap gap-5">
          <span>Prompt-to-dashboard</span>
          <span>Semantic layer</span>
          <span>MCP-ready</span>
          <span>© 2026 mos.bi</span>
        </div>
      </footer>
    </main>
  );
}
