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

export const defaultPersistedState: PersistedState = {
  checked: {},
  custom: {},
  modes: { pre: 'brief', arrival: 'brief' },
  hideDone: { pre: false, arrival: false },
  day: null,
};

/** Fills in missing/malformed top-level keys from storage (e.g. a partial or legacy JSON blob) with defaults. */
export function normalizePersistedState(raw: unknown): PersistedState {
  const value = (raw && typeof raw === 'object' ? raw : {}) as Partial<PersistedState>;
  return {
    checked: value.checked && typeof value.checked === 'object' ? value.checked : defaultPersistedState.checked,
    custom: value.custom && typeof value.custom === 'object' ? value.custom : defaultPersistedState.custom,
    modes: { ...defaultPersistedState.modes, ...value.modes },
    hideDone: { ...defaultPersistedState.hideDone, ...value.hideDone },
    day: typeof value.day === 'string' ? value.day : null,
  };
}
