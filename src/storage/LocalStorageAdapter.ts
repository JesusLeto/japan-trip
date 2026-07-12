import type { StorageAdapter } from './StorageAdapter';
import type { PersistedState } from '../types/state';

export class LocalStorageAdapter implements StorageAdapter {
  private readonly key: string;

  constructor(key: string) {
    this.key = key;
  }

  async load(): Promise<PersistedState | null> {
    try {
      const raw = window.localStorage.getItem(this.key);
      return raw ? (JSON.parse(raw) as PersistedState) : null;
    } catch {
      return null;
    }
  }

  async save(state: PersistedState): Promise<void> {
    try {
      window.localStorage.setItem(this.key, JSON.stringify(state));
    } catch {
      // localStorage unavailable (e.g. private mode quota) — fail silently, keep in-memory state.
    }
  }
}
