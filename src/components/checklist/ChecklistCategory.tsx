import type { ReactNode } from 'react';
import { useApp } from '../../state/AppContext';
import { useChecklistSection } from './ChecklistSectionContext';
import type { ChecklistCategory as ChecklistCategoryData, ChecklistItemData } from '../../types/trip';

interface CategoryItem {
  item: ChecklistItemData;
  canDelete: boolean;
}

interface ChecklistCategoryProps {
  cat: ChecklistCategoryData;
  renderItem: (item: ChecklistItemData, index: number, canDelete: boolean) => ReactNode;
  /** Static content rendered after the item rows, e.g. the add-item form. */
  children?: ReactNode;
}

export function ChecklistCategory({ cat, renderItem, children }: ChecklistCategoryProps) {
  const { state } = useApp();
  const { mode, hideDone } = useChecklistSection();

  const customItems = state.custom[cat.id] ?? [];
  const allItems: CategoryItem[] = [
    ...cat.items.map((item): CategoryItem => ({ item, canDelete: false })),
    ...customItems.map(
      (custom): CategoryItem => ({ item: { ...custom, dl: '', desc: '' }, canDelete: true }),
    ),
  ];
  const visibleItems = allItems.filter(({ item }) => !(hideDone && state.checked[item.id]));
  const done = allItems.filter(({ item }) => state.checked[item.id]).length;
  const total = allItems.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="mt-[38px]">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="m-0 text-sm font-semibold tracking-[0.06em] text-text-bright uppercase">
          {cat.name}
        </h3>
        <span className="font-mono text-[11px] font-medium text-text-faint">
          {done}/{total}
        </span>
      </div>
      <div className="relative my-2.5 h-0.5 bg-bg-active">
        <div
          className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-[0.35s] ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div key={mode}>
        {visibleItems.map(({ item, canDelete }, index) => renderItem(item, index, canDelete))}
      </div>
      {children}
    </div>
  );
}
