/**
 * Генерирует KML для Google My Maps и список ссылок на маршруты из данных поездки.
 *
 * Данные читаются из самого TypeScript-модуля (транспиляция + import), а не регулярками
 * по тексту: в japan.ts соседствуют строки в одинарных и двойных кавычках, и парсер на
 * regexp уже однажды молча потерял целый день.
 *
 * Запуск: node scripts/export-kml.mjs
 */
import ts from "typescript";
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { escape } from "node:querystring";

const OUT_DIR = "docs/exports";
const TMP = "node_modules/.cache/trip-data.mjs";

async function loadTrip() {
  // В japan.ts единственный импорт — `import type`, он стирается при транспиляции,
  // так что на выходе получается чистый модуль с данными.
  const source = await readFile("src/data/trips/japan.ts", "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
    },
  });
  await mkdir("node_modules/.cache", { recursive: true });
  await writeFile(TMP, outputText);
  const mod = await import(new URL(`../${TMP}`, import.meta.url).href);
  await rm(TMP, { force: true });
  return mod.japanTrip;
}

const xml = (s) =>
  String(s).replace(
    /[<>&]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c],
  );

/**
 * Google My Maps берёт максимум 10 слоёв на карту и импортирует одну KML-папку как слой.
 * Лишние папки он отбрасывает молча — на 14 днях так потерялись все четыре токийских.
 * Поэтому дни склеиваются в группы, чтобы папок было не больше десяти.
 */
const MY_MAPS_LAYER_LIMIT = 10;

function groupDays(days) {
  const perGroup = Math.ceil(days.length / MY_MAPS_LAYER_LIMIT);
  const groups = [];
  for (let i = 0; i < days.length; i += perGroup) {
    const chunk = days.slice(i, i + perGroup);
    const label =
      chunk.length === 1
        ? `${chunk[0].label} · ${chunk[0].city}`
        : `${chunk[0].label}–${chunk[chunk.length - 1].label} · ${[...new Set(chunk.map((d) => d.city))].join(", ")}`;
    groups.push({ label, days: chunk });
  }
  return groups;
}

/** Цвета KML идут в порядке aabbggrr, а не привычном rrggbb. */
function kmlColor(hex) {
  const h = hex.replace("#", "");
  return `ff${h.slice(4, 6)}${h.slice(2, 4)}${h.slice(0, 2)}`.toLowerCase();
}

function buildKml(trip) {
  const parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<kml xmlns="http://www.opengis.net/kml/2.2">',
    "<Document>",
    `<name>${xml(trip.meta.kicker)} · ${xml(trip.meta.routeSummary)}</name>`,
    "<description>Координаты — Nominatim, пешие и автобусные трассы — OSRM (OpenStreetMap, ODbL). " +
      "Рельсовые, канатные и паромные участки показаны прямой линией: реальной геометрии для них не строилось.</description>",
  ];

  const styleId = (day) => `s-${day.id}`;
  for (const day of trip.days) {
    const color = kmlColor(
      trip.cities[day.city] ??
        trip.cities[day.city.split(/[/→]/)[0]?.trim()] ??
        "#8A94A6",
    );
    parts.push(
      `<Style id="${styleId(day)}">` +
        `<IconStyle><color>${color}</color><scale>1.1</scale></IconStyle>` +
        `<LineStyle><color>${color}</color><width>4</width></LineStyle>` +
        "</Style>",
    );
  }

  for (const group of groupDays(trip.days)) {
    parts.push("<Folder>", `<name>${xml(group.label)}</name>`);
    for (const day of group.days) {
      day.points.forEach((point, i) => {
        parts.push(
          "<Placemark>",
          `<name>${xml(day.label)}.${i + 1} ${xml(point.name)}</name>`,
          `<description>${xml(point.desc)}</description>`,
          `<styleUrl>#${styleId(day)}</styleUrl>`,
          `<Point><coordinates>${point.coords[1]},${point.coords[0]},0</coordinates></Point>`,
          "</Placemark>",
        );
      });

      day.legs.forEach((leg, i) => {
        const from = day.points[i];
        const to = day.points[i + 1];
        if (!from || !to) return;
        const line = [from.coords, ...(leg.path ?? []), to.coords];
        const schematic = leg.path?.length
          ? ""
          : " (схематично: прямая, реальной трассы нет)";
        const cost = leg.cost ? `${leg.cost} ¥` : "бесплатно";
        parts.push(
          "<Placemark>",
          `<name>${xml(day.label)} · ${xml(leg.tag)} ${xml(leg.line)}${schematic}</name>`,
          `<description>${xml(leg.time)} · ${cost}</description>`,
          `<styleUrl>#${styleId(day)}</styleUrl>`,
          `<LineString><tessellate>1</tessellate><coordinates>${line
            .map(([lat, lon]) => `${lon},${lat},0`)
            .join(" ")}</coordinates></LineString>`,
          "</Placemark>",
        );
      });
    }
    parts.push("</Folder>");
  }

  parts.push("</Document>", "</kml>");
  return parts.join("\n");
}

function buildLinks(trip) {
  const lines = [
    "# Маршруты по дням в Google Maps",
    "",
    "Каждая ссылка открывает день как маршрут с промежуточными точками. Маршрут строит сам Google — он будет отличаться от трасс в приложении, те из OSRM. Совпадают точки, а не геометрия.",
    "",
    "Чтобы положить всё разом в «Мои карты»: [mymaps.google.com](https://www.google.com/mymaps) → **Создать карту** → **Импорт** → файл [japan-2026.kml](japan-2026.kml).",
    "",
  ];
  for (const day of trip.days) {
    if (day.points.length < 2) {
      lines.push(
        `- **${day.label} · ${day.city}** — ${day.title}: точек на карте пока нет`,
      );
      continue;
    }
    const at = (p) => `${p.coords[0]},${p.coords[1]}`;
    const params = new URLSearchParams({
      api: "1",
      origin: at(day.points[0]),
      destination: at(day.points[day.points.length - 1]),
      travelmode: "walking",
    });
    const waypoints = day.points.slice(1, -1).map(at).join("|");
    let url = `https://www.google.com/maps/dir/?${params}`;
    if (waypoints) url += `&waypoints=${escape(waypoints)}`;
    lines.push(
      `- **${day.label} · ${day.city}** — ${day.title} (${day.points.length} точек) — [открыть в Google Maps](${url})`,
    );
  }
  return lines.join("\n") + "\n";
}

const trip = await loadTrip();
await mkdir(OUT_DIR, { recursive: true });
await writeFile(`${OUT_DIR}/${trip.id}.kml`, buildKml(trip));
await writeFile(`${OUT_DIR}/google-maps.md`, buildLinks(trip));

const points = trip.days.reduce((n, d) => n + d.points.length, 0);
const legs = trip.days.reduce((n, d) => n + d.legs.length, 0);
const withPath = trip.days.reduce(
  (n, d) => n + d.legs.filter((l) => l.path?.length).length,
  0,
);
console.log(
  `${OUT_DIR}/${trip.id}.kml — дней ${trip.days.length}, точек ${points}, линий ${legs} (с трассой ${withPath})`,
);
for (const d of trip.days) {
  if (!d.points.length) console.log(`  ⚠ ${d.label}: нет точек`);
}
