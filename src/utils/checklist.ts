import type { ChecklistCategory, ChecklistData } from '../types/trip';
import type { CustomItem, PersistedState } from '../types/state';

export function getCategoryItemIds(cat: ChecklistCategory, custom: CustomItem[] | undefined): string[] {
  return [...cat.items.map((item) => item.id), ...(custom ?? []).map((item) => item.id)];
}

export function getSectionItemIds(section: ChecklistData, custom: PersistedState['custom']): string[] {
  return section.cats.flatMap((cat) => getCategoryItemIds(cat, custom[cat.id]));
}

export function countChecked(ids: string[], checked: PersistedState['checked']): number {
  return ids.filter((id) => checked[id]).length;
}

export function getSectionCounts(section: ChecklistData, state: PersistedState) {
  const ids = getSectionItemIds(section, state.custom);
  return { checked: countChecked(ids, state.checked), total: ids.length };
}
