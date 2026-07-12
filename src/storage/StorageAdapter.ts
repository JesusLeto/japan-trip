import type { PersistedState } from '../types/state';

export interface StorageAdapter {
  load(): Promise<PersistedState | null>;
  save(state: PersistedState): Promise<void>;
}
