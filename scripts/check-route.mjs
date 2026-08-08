/**
 * Проверяет геометрию маршрута: длину каждого дня и развороты назад.
 *
 * Читает данные транспиляцией japan.ts, а не регулярками. Разбор regexp'ом здесь уже дважды
 * молча терял день 1 — он записан строками в одинарных кавычках, остальные дни в двойных.
 *
 * Запуск: node scripts/check-route.mjs
 */
import ts from "typescript";
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";

const TMP = "node_modules/.cache/route-check.mjs";
const DETOUR_LIMIT = 2.5;

const source = await readFile("src/data/trips/japan.ts", "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
  },
});
await mkdir("node_modules/.cache", { recursive: true });
await writeFile(TMP, outputText);
const { japanTrip: trip } = await import(
  new URL(`../${TMP}`, import.meta.url).href
);
await rm(TMP, { force: true });

const RAD = Math.PI / 180;
function km([lat1, lon1], [lat2, lon2]) {
  const dLat = (lat2 - lat1) * RAD;
  const dLon = (lon2 - lon1) * RAD;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

let total = 0;
let flagged = 0;
console.log(
  "день  точек     км   развороты назад (путь через точку / напрямую мимо неё)",
);
for (const day of trip.days) {
  const coords = day.points.map((p) => p.coords);
  const length = coords
    .slice(1)
    .reduce((sum, c, i) => sum + km(coords[i], c), 0);
  total += length;

  const detours = [];
  for (let i = 1; i < coords.length - 1; i++) {
    const direct = km(coords[i - 1], coords[i + 1]);
    const via = km(coords[i - 1], coords[i]) + km(coords[i], coords[i + 1]);
    // Точки, стоящие почти вплотную, дают огромное отношение из-за деления на ноль — их пропускаем.
    if (direct > 0.15 && via / direct > DETOUR_LIMIT) {
      detours.push(`${day.points[i].name} ×${(via / direct).toFixed(1)}`);
    }
  }
  flagged += detours.length;

  console.log(
    `${day.label.padStart(4)} ${String(day.points.length).padStart(6)} ${length.toFixed(1).padStart(6)}   ${detours.join("; ") || "—"}`,
  );
}
console.log(
  `\nвсего ${trip.days.reduce((n, d) => n + d.points.length, 0)} точек, ${total.toFixed(0)} км, развороты: ${flagged}`,
);

// Самопроверка: день 1 записан в другом стиле кавычек, чем остальные, и regexp-парсеры его теряли.
const d1 = trip.days.find((d) => d.id === "d1");
if (!d1?.points.length)
  throw new Error("день 1 без точек — данные читаются неверно");
