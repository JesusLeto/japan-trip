import type { PersistedState } from '../types/state';
import type { ChecklistData, TripData } from '../types/trip';
import { formatLegCost } from './money';

export function checklistItems(section: ChecklistData, custom: PersistedState['custom']) {
  return section.cats.map((cat) => ({
    cat,
    items: [...cat.items, ...(custom[cat.id] ?? []).map((c) => ({ ...c, dl: '', desc: '' }))],
  }));
}

function checklistMarkdown(section: ChecklistData, title: string, state: PersistedState): string {
  const catsWithItems = checklistItems(section, state.custom);
  const allIds = catsWithItems.flatMap(({ items }) => items.map((item) => item.id));
  const done = allIds.filter((id) => state.checked[id]).length;

  let md = `\n## ${title} (${done}/${allIds.length})\n`;
  for (const { cat, items } of catsWithItems) {
    md += `\n### ${cat.name}\n`;
    for (const item of items) {
      const box = state.checked[item.id] ? 'x' : ' ';
      md += `- [${box}] ${item.label}${item.dl ? ` _(${item.dl})_` : ''}\n`;
    }
  }
  return md;
}

function narrativeDayMarkdown(day: TripData['days'][number]): string {
  let md = `\n### ${day.label} · ${day.city} — ${day.title}${day.base ? ` (${day.base})` : ''}\n`;
  if (day.keyTag) md += `_${day.keyTag}_\n\n`;
  if (day.blocks?.morning) md += `**Утро.** ${day.blocks.morning}\n\n`;
  if (day.blocks?.day) md += `**День.** ${day.blocks.day}\n\n`;
  if (day.blocks?.evening) md += `**Вечер.** ${day.blocks.evening}\n\n`;
  if (day.transitNotes?.length) {
    for (const note of day.transitNotes) md += `- → ${note}\n`;
    md += '\n';
  }
  if (day.foodNote) md += `**Еда:** ${day.foodNote}\n\n`;
  if (day.planBNote) md += `**План Б:** ${day.planBNote}\n\n`;
  if (day.skipNote) md += `**Пропустите:** ${day.skipNote}\n\n`;
  return md;
}

function mapDayMarkdown(day: TripData['days'][number]): string {
  let md = `\n### ${day.label} · ${day.city} — ${day.title}\n`;
  day.points.forEach((point, i) => {
    md += `- **${point.arr}** ${point.name}${point.dur !== '—' ? ` (${point.dur})` : ''} — ${point.desc}\n`;
    const leg = day.legs[i];
    if (leg) md += `    - → ${leg.tag} ${leg.line} · ${leg.time} · ${formatLegCost(leg)}\n`;
  });
  return md;
}

export function buildMarkdown(trip: TripData, state: PersistedState): string {
  let md = `# ${trip.meta.kicker} — ${trip.meta.routeSummary}\n`;
  md += checklistMarkdown(trip.pre, '/ 01 До вылета', state);
  md += checklistMarkdown(trip.arrival, '/ 02 Сразу по прилёту', state);

  const hasNarrativeDays = trip.days.some((day) => day.blocks);
  const hasMapPoints = trip.days.some((day) => day.points.length > 0);

  if (hasNarrativeDays) {
    md += '\n## / 03 День за днём\n';
    md += trip.days.map(narrativeDayMarkdown).join('');
  } else if (hasMapPoints) {
    md += '\n## / 03 Маршрут\n';
    md += trip.days.map(mapDayMarkdown).join('');
  }

  if (trip.hotels) {
    md += '\n## / 04 Где спать\n';
    md += `${trip.hotels.intro}\n`;
    for (const card of trip.hotels.cards) {
      md += `\n### ${card.city} (${card.nights})\n${card.description}\n`;
      md += card.names.map((name) => `- ${name}`).join('\n') + '\n';
    }
  }

  if (trip.budget) {
    md += '\n## / 05 Бюджет на двоих\n';
    md += `${trip.budget.intro}\n\n`;
    md += '| Статья | Комментарий | На двоих, $ |\n|---|---|---|\n';
    for (const row of trip.budget.rows) md += `| ${row.item} | ${row.comment} | ${row.costLabel} |\n`;
    md += `| **${trip.budget.totalLabel}** |  | **${trip.budget.totalCostLabel}** |\n`;
    md += `\n${trip.budget.footnote}\n`;
  }

  if (trip.practical) {
    md += '\n## / 06 Практика\n';
    for (const card of trip.practical.cards) md += `\n### ${card.title}\n${card.text}\n`;
  }

  if (trip.skipList) {
    md += '\n## / 07 Куда заходить не обязательно\n';
    md += `${trip.skipList.intro}\n\n`;
    for (const item of trip.skipList.items) md += `- **${item.place}** — ${item.why}\n`;
  }

  return md;
}
