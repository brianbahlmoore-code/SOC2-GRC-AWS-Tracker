import { create } from 'zustand';
import { Risk } from '../data/types';
import { seedRisks } from '../data/seedRisks';
import { loadFromStorage, saveToStorage } from '../utils/localStorage';
import { useToastStore } from './useToastStore';

const STORAGE_KEY = 'soc2-risks';

interface RiskStore {
  risks: Risk[];
  addRisk: (risk: Risk) => void;
  updateRisk: (id: string, updates: Partial<Risk>) => void;
  deleteRisk: (id: string) => void;
  resetRisks: () => void;
  getRiskById: (id: string) => Risk | undefined;
  getOpenRisks: () => Risk[];
  getTopRisks: (count: number) => Risk[];
}

export const useRiskStore = create<RiskStore>((set, get) => ({
  risks: loadFromStorage<Risk[]>(STORAGE_KEY, seedRisks),

  addRisk: (risk) => {
    const newRisks = [...get().risks, risk];
    set({ risks: newRisks });
    saveToStorage(STORAGE_KEY, newRisks, () => {
      useToastStore.getState().addToast('Risk added ✓', 'success');
    });
  },

  updateRisk: (id, updates) => {
    const newRisks = get().risks.map((r) =>
      r.id === id ? { ...r, ...updates, lastUpdated: new Date().toISOString() } : r
    );
    set({ risks: newRisks });
    saveToStorage(STORAGE_KEY, newRisks, () => {
      useToastStore.getState().addToast('Risk updated ✓', 'success');
    });
  },

  deleteRisk: (id) => {
    const newRisks = get().risks.filter((r) => r.id !== id);
    set({ risks: newRisks });
    saveToStorage(STORAGE_KEY, newRisks, () => {
      useToastStore.getState().addToast('Risk deleted ✓', 'success');
    });
  },

  resetRisks: () => {
    set({ risks: seedRisks });
    saveToStorage(STORAGE_KEY, seedRisks);
  },

  getRiskById: (id) => get().risks.find((r) => r.id === id),
  getOpenRisks: () => get().risks.filter((r) => r.status === 'Open'),
  getTopRisks: (count) =>
    [...get().risks]
      .filter((r) => r.status === 'Open')
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, count),
}));
