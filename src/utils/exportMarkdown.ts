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

export function buildMarkdown(trip: TripData, state: PersistedState): string {
  let md = `# ${trip.meta.kicker} — ${trip.meta.routeSummary}\n`;
  md += checklistMarkdown(trip.pre, '/ 01 До вылета', state);
  md += checklistMarkdown(trip.arrival, '/ 02 Сразу по прилёту', state);

  md += '\n## / 03 Маршрут\n';
  for (const day of trip.days) {
    md += `\n### ${day.label} · ${day.city} — ${day.title}\n`;
    day.points.forEach((point, i) => {
      md += `- **${point.arr}** ${point.name}${point.dur !== '—' ? ` (${point.dur})` : ''} — ${point.desc}\n`;
      const leg = day.legs[i];
      if (leg) md += `    - → ${leg.tag} ${leg.line} · ${leg.time} · ${formatLegCost(leg)}\n`;
    });
  }
  return md;
}
