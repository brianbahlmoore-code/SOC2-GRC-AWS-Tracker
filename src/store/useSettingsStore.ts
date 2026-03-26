import { create } from 'zustand';
import { Settings } from '../data/types';
import { TeamMember } from '../data/types';
import { seedTeamMembers } from '../data/seedTeamMembers';
import { loadFromStorage, saveToStorage } from '../utils/localStorage';
import { useToastStore } from './useToastStore';
import { format, addDays } from 'date-fns';

const STORAGE_KEY_SETTINGS = 'soc2-settings';
const STORAGE_KEY_TEAM = 'soc2-team-members';

const defaultSettings: Settings = {
  projectName: 'SOC 2 GRC AWS — Readiness Project',
  startDate: format(new Date(), 'yyyy-MM-dd'),
  targetAuditDate: format(addDays(new Date(), 365), 'yyyy-MM-dd'),
  theme: 'dark',
  wbsDensity: 'comfortable',
};

interface SettingsStore {
  settings: Settings;
  teamMembers: TeamMember[];
  updateSettings: (partial: Partial<Settings>) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  resetAll: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: loadFromStorage<Settings>(STORAGE_KEY_SETTINGS, defaultSettings),
  teamMembers: loadFromStorage<TeamMember[]>(STORAGE_KEY_TEAM, seedTeamMembers),

  updateSettings: (partial) => {
    const newSettings = { ...get().settings, ...partial };
    set({ settings: newSettings });
    saveToStorage(STORAGE_KEY_SETTINGS, newSettings, () => {
      useToastStore.getState().addToast('Settings saved ✓', 'success');
    });
  },

  setTheme: (theme) => {
    const newSettings = { ...get().settings, theme };
    set({ settings: newSettings });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveToStorage(STORAGE_KEY_SETTINGS, newSettings);
  },

  addTeamMember: (member) => {
    const newMembers = [...get().teamMembers, member];
    set({ teamMembers: newMembers });
    saveToStorage(STORAGE_KEY_TEAM, newMembers, () => {
      useToastStore.getState().addToast('Team member added ✓', 'success');
    });
  },

  updateTeamMember: (id, updates) => {
    const newMembers = get().teamMembers.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    set({ teamMembers: newMembers });
    saveToStorage(STORAGE_KEY_TEAM, newMembers, () => {
      useToastStore.getState().addToast('Team member updated ✓', 'success');
    });
  },

  removeTeamMember: (id) => {
    const newMembers = get().teamMembers.filter((m) => m.id !== id);
    set({ teamMembers: newMembers });
    saveToStorage(STORAGE_KEY_TEAM, newMembers, () => {
      useToastStore.getState().addToast('Team member removed ✓', 'success');
    });
  },

  resetAll: () => {
    set({
      settings: defaultSettings,
      teamMembers: seedTeamMembers,
    });
    saveToStorage(STORAGE_KEY_SETTINGS, defaultSettings);
    saveToStorage(STORAGE_KEY_TEAM, seedTeamMembers, () => {
      useToastStore.getState().addToast('All data reset to defaults ✓', 'info');
    });
  },
}));
