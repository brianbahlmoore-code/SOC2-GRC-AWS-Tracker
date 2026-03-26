import { create } from 'zustand';
import { Blocker } from '../data/types';
import { seedBlockers } from '../data/seedBlockers';
import { loadFromStorage, saveToStorage } from '../utils/localStorage';
import { useToastStore } from './useToastStore';

const STORAGE_KEY = 'soc2-blockers';

interface BlockerStore {
  blockers: Blocker[];
  addBlocker: (blocker: Blocker) => void;
  updateBlocker: (id: string, updates: Partial<Blocker>) => void;
  deleteBlocker: (id: string) => void;
  resetBlockers: () => void;
  getOpenBlockers: () => Blocker[];
}

export const useBlockerStore = create<BlockerStore>((set, get) => ({
  blockers: loadFromStorage<Blocker[]>(STORAGE_KEY, seedBlockers),

  addBlocker: (blocker) => {
    const newBlockers = [...get().blockers, blocker];
    set({ blockers: newBlockers });
    saveToStorage(STORAGE_KEY, newBlockers, () => {
      useToastStore.getState().addToast('Blocker added ✓', 'success');
    });
  },

  updateBlocker: (id, updates) => {
    const newBlockers = get().blockers.map((b) =>
      b.id === id ? { ...b, ...updates } : b
    );
    set({ blockers: newBlockers });
    saveToStorage(STORAGE_KEY, newBlockers, () => {
      useToastStore.getState().addToast('Blocker updated ✓', 'success');
    });
  },

  deleteBlocker: (id) => {
    const newBlockers = get().blockers.filter((b) => b.id !== id);
    set({ blockers: newBlockers });
    saveToStorage(STORAGE_KEY, newBlockers, () => {
      useToastStore.getState().addToast('Blocker deleted ✓', 'success');
    });
  },

  resetBlockers: () => {
    set({ blockers: seedBlockers });
    saveToStorage(STORAGE_KEY, seedBlockers);
  },

  getOpenBlockers: () => get().blockers.filter((b) => b.status === 'Open'),
}));
