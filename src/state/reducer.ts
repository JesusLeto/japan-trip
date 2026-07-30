import { defaultPersistedState, type ChecklistMode, type ChecklistSectionId, type PersistedState } from '../types/state';

export const initialPersistedState = defaultPersistedState;

export type Action =
  | { type: 'HYDRATE'; state: PersistedState }
  | { type: 'TOGGLE_ITEM'; itemId: string }
  | { type: 'ADD_CUSTOM_ITEM'; catId: string; itemId: string; label: string }
  | { type: 'DELETE_CUSTOM_ITEM'; catId: string; itemId: string }
  | { type: 'SET_MODE'; section: ChecklistSectionId; mode: ChecklistMode }
  | { type: 'SET_HIDE_DONE'; section: ChecklistSectionId; value: boolean }
  | { type: 'SELECT_DAY'; dayId: string | null };

export function appReducer(state: PersistedState, action: Action): PersistedState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'TOGGLE_ITEM':
      return {
        ...state,
        checked: { ...state.checked, [action.itemId]: !state.checked[action.itemId] },
      };

    case 'ADD_CUSTOM_ITEM': {
      const existing = state.custom[action.catId] ?? [];
      return {
        ...state,
        custom: {
          ...state.custom,
          [action.catId]: [...existing, { id: action.itemId, label: action.label }],
        },
      };
    }

    case 'DELETE_CUSTOM_ITEM': {
      const existing = state.custom[action.catId] ?? [];
      const checked = { ...state.checked };
      delete checked[action.itemId];
      return {
        ...state,
        checked,
        custom: {
          ...state.custom,
          [action.catId]: existing.filter((item) => item.id !== action.itemId),
        },
      };
    }

    case 'SET_MODE':
      return { ...state, modes: { ...state.modes, [action.section]: action.mode } };

    case 'SET_HIDE_DONE':
      return { ...state, hideDone: { ...state.hideDone, [action.section]: action.value } };

    case 'SELECT_DAY':
      return { ...state, day: action.dayId };

    default:
      return state;
  }
}
