import { createContext, use } from 'react';
import type { ChecklistMode } from '../../types/state';

export interface ChecklistSectionContextValue {
  mode: ChecklistMode;
  hideDone: boolean;
}

export const ChecklistSectionContext = createContext<ChecklistSectionContextValue | null>(null);

export function useChecklistSection(): ChecklistSectionContextValue {
  const value = use(ChecklistSectionContext);
  if (!value) throw new Error('useChecklistSection must be used within Checklist.Section');
  return value;
}
