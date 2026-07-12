export type ChecklistMode = 'brief' | 'detail';

export type ChecklistSectionId = 'pre' | 'arrival';

export interface CustomItem {
  id: string;
  label: string;
}

export interface PersistedState {
  checked: Record<string, boolean>;
  /** Keyed by category id. */
  custom: Record<string, CustomItem[]>;
  modes: Record<ChecklistSectionId, ChecklistMode>;
  hideDone: Record<ChecklistSectionId, boolean>;
  day: string | null;
}
