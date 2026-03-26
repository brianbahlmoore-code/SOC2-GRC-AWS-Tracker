import { create } from 'zustand';
import { Task, KanbanColumn, TaskStatus } from '../data/types';
import { generateSeedTasks } from '../data/seedTasks';
import { loadFromStorage, saveToStorage } from '../utils/localStorage';
import { useToastStore } from './useToastStore';

const STORAGE_KEY = 'soc2-tasks';

function statusFromKanbanColumn(column: KanbanColumn): TaskStatus {
  switch (column) {
    case 'Backlog': return 'Not Started';
    case 'To Do': return 'Not Started';
    case 'In Progress': return 'In Progress';
    case 'In Review': return 'In Review';
    case 'Done': return 'Completed';
    case 'Blocked': return 'Blocked';
  }
}

interface TaskStore {
  tasks: Task[];
  selectedTaskId: string | null;
  drawerOpen: boolean;

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveToKanbanColumn: (taskId: string, column: KanbanColumn) => void;
  openDrawer: (taskId: string) => void;
  closeDrawer: () => void;
  resetTasks: () => void;

  // Computed helpers
  getTaskById: (id: string) => Task | undefined;
  getTasksByPhase: (phase: number) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getOverdueTasks: () => Task[];
  getBlockedTasks: () => Task[];
  getUpcomingTasks: (days: number) => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: loadFromStorage<Task[]>(STORAGE_KEY, generateSeedTasks()),
  selectedTaskId: null,
  drawerOpen: false,

  setTasks: (tasks) => {
    set({ tasks });
    saveToStorage(STORAGE_KEY, tasks);
  },

  addTask: (task) => {
    const newTasks = [...get().tasks, task];
    set({ tasks: newTasks });
    saveToStorage(STORAGE_KEY, newTasks, () => {
      useToastStore.getState().addToast('Task created ✓', 'success');
    });
  },

  updateTask: (id, updates) => {
    const newTasks = get().tasks.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    set({ tasks: newTasks });
    saveToStorage(STORAGE_KEY, newTasks, () => {
      useToastStore.getState().addToast('Saved ✓', 'success');
    });
  },

  deleteTask: (id) => {
    const newTasks = get().tasks.filter((t) => t.id !== id);
    set({ tasks: newTasks });
    saveToStorage(STORAGE_KEY, newTasks, () => {
      useToastStore.getState().addToast('Task deleted ✓', 'success');
    });
  },

  moveToKanbanColumn: (taskId, column) => {
    const status = statusFromKanbanColumn(column);
    const percentComplete = column === 'Done' ? 100 : undefined;
    const newTasks = get().tasks.map((t) =>
      t.id === taskId
        ? { ...t, kanbanColumn: column, status, ...(percentComplete !== undefined ? { percentComplete } : {}) }
        : t
    );
    set({ tasks: newTasks });
    saveToStorage(STORAGE_KEY, newTasks, () => {
      useToastStore.getState().addToast(`Task moved to ${column} ✓`, 'success');
    });
  },

  openDrawer: (taskId) => set({ selectedTaskId: taskId, drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false, selectedTaskId: null }),

  resetTasks: () => {
    const fresh = generateSeedTasks();
    set({ tasks: fresh });
    saveToStorage(STORAGE_KEY, fresh, () => {
      useToastStore.getState().addToast('Tasks reset to defaults ✓', 'info');
    });
  },

  getTaskById: (id) => get().tasks.find((t) => t.id === id),
  getTasksByPhase: (phase) => get().tasks.filter((t) => t.phase === phase),
  getTasksByStatus: (status) => get().tasks.filter((t) => t.status === status),
  getOverdueTasks: () => {
    const now = new Date().toISOString().split('T')[0];
    return get().tasks.filter((t) => t.endDate < now && t.status !== 'Completed');
  },
  getBlockedTasks: () => get().tasks.filter((t) => t.status === 'Blocked'),
  getUpcomingTasks: (days) => {
    const now = new Date();
    const future = new Date(now.getTime() + days * 86400000);
    const nowStr = now.toISOString().split('T')[0];
    const futureStr = future.toISOString().split('T')[0];
    return get().tasks.filter(
      (t) => t.endDate >= nowStr && t.endDate <= futureStr && t.status !== 'Completed'
    );
  },
}));
