import { useState, type ReactNode } from 'react';
import { useApp } from '../../state/AppContext';
import { useChecklistSection } from './ChecklistSectionContext';
import type { ChecklistItemData } from '../../types/trip';

interface ChecklistItemProps {
  item: ChecklistItemData;
  canDelete: boolean;
  onDelete: () => void;
  /** Leading badge rendered between the checkbox and the label, e.g. a step number. */
  children?: ReactNode;
}

export function ChecklistItem({ item, canDelete, onDelete, children }: ChecklistItemProps) {
  const { state, actions } = useApp();
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
  const hasDesc = item.desc.length > 0;
  const checked = !!state.checked[item.id];

  const { mode } = useChecklistSection();
  const expanded = hasDesc && (manualExpanded ?? mode === 'detail');

  return (
    <div className="border-b border-divider">
      <div className="flex items-center gap-3 py-[13px] pl-0.5">
        <button
          type="button"
          aria-label="Отметить пункт"
          onClick={() => actions.toggleItem(item.id)}
          className={`flex h-[18px] w-[18px] min-w-[18px] items-center justify-center rounded-[3px] border p-0 transition-colors ${
            checked ? 'border-accent bg-accent' : 'border-border-strong bg-transparent'
          }`}
        >
          {checked && <span className="text-[12px] leading-none font-bold text-bg">✓</span>}
        </button>
        {children}
        <button
          type="button"
          disabled={!hasDesc}
          onClick={() => setManualExpanded(!expanded)}
          className={`min-w-0 flex-1 border-none bg-transparent p-0 text-left font-sans text-[14.5px] leading-[1.4] transition-colors ${
            hasDesc ? 'cursor-pointer' : 'cursor-default'
          } ${checked ? 'text-text-faint line-through' : 'text-text'}`}
        >
          {item.label}
        </button>
        {canDelete && (
          <button
            type="button"
            aria-label="Удалить пункт"
            onClick={onDelete}
            className="p-0.5 text-base leading-none text-text-faint hover:text-accent"
          >
            ×
          </button>
        )}
        {item.dl && (
          <span className="rounded-[2px] border border-border px-[7px] py-0.5 font-mono text-[11px] whitespace-nowrap text-text-faint">
            {item.dl}
          </span>
        )}
      </div>
      {expanded && (
        <div className="animate-jk-fade max-w-[600px] py-0 pr-0 pb-[15px] pl-8 text-[13.5px] leading-[1.65] text-text-muted">
          {item.desc}
        </div>
      )}
    </div>
  );
}
