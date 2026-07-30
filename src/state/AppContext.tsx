import { createContext, use, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import type { ChecklistMode, ChecklistSectionId, PersistedState } from '../types/state';
import type { TripData } from '../types/trip';
import type { StorageAdapter } from '../storage/StorageAdapter';
import { appReducer, initialPersistedState } from './reducer';

export interface AppActions {
  toggleItem(itemId: string): void;
  addCustomItem(catId: string, label: string): void;
  deleteCustomItem(catId: string, itemId: string): void;
  setMode(section: ChecklistSectionId, mode: ChecklistMode): void;
  setHideDone(section: ChecklistSectionId, value: boolean): void;
  selectDay(dayId: string | null): void;
}

export interface AppContextValue {
  trip: TripData;
  state: PersistedState;
  actions: AppActions;
}

const AppContext = createContext<AppContextValue | null>(null);

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `u${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook are one cohesive unit
export function useApp(): AppContextValue {
  const value = use(AppContext);
  if (!value) throw new Error('useApp must be used within an AppProvider');
  return value;
}

interface AppProviderProps {
  adapter: StorageAdapter;
  trip: TripData;
  children: ReactNode;
}

export function AppProvider({ adapter, trip, children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialPersistedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Any action dispatched before this resolves is overwritten by HYDRATE below.
    // Harmless with the near-instant LocalStorageAdapter; a network-backed adapter
    // (e.g. Supabase) would need to queue or ignore actions until hydrated.
    let cancelled = false;
    adapter.load().then((loaded) => {
      if (!cancelled && loaded) dispatch({ type: 'HYDRATE', state: loaded });
      if (!cancelled) setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
    // Adapter is provided once per app lifetime; re-running on identity change is not needed for MVP.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    adapter.save(state);
  }, [adapter, hydrated, state]);

  const actions = useMemo<AppActions>(
    () => ({
      toggleItem: (itemId) => dispatch({ type: 'TOGGLE_ITEM', itemId }),
      addCustomItem: (catId, label) =>
        dispatch({ type: 'ADD_CUSTOM_ITEM', catId, itemId: generateId(), label }),
      deleteCustomItem: (catId, itemId) => dispatch({ type: 'DELETE_CUSTOM_ITEM', catId, itemId }),
      setMode: (section, mode) => dispatch({ type: 'SET_MODE', section, mode }),
      setHideDone: (section, value) => dispatch({ type: 'SET_HIDE_DONE', section, value }),
      selectDay: (dayId) => dispatch({ type: 'SELECT_DAY', dayId }),
    }),
    [],
  );

  const value = useMemo<AppContextValue>(() => ({ trip, state, actions }), [trip, state, actions]);

  return <AppContext value={value}>{children}</AppContext>;
}
