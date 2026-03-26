import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { Dashboard } from './pages/Dashboard';
import { WBSTaskList } from './pages/WBSTaskList';
import { GanttChart } from './pages/GanttChart';
import { KanbanBoard } from './pages/KanbanBoard';
import { RisksBlockers } from './pages/RisksBlockers';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { useSettingsStore } from './store/useSettingsStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTaskStore } from './store/useTaskStore';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { settings } = useSettingsStore();
  const { closeDrawer } = useTaskStore();

  // Apply theme on mount and change
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onCloseDrawer: closeDrawer,
    onFocusSearch: () => {
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.focus();
    },
  });

  return (
    <div className="flex min-h-screen bg-navy-900 dark:bg-navy-900">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wbs" element={<WBSTaskList />} />
          <Route path="/gantt" element={<GanttChart />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/risks" element={<RisksBlockers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {/* Global overlays */}
      <TaskDetailDrawer />
      <ToastContainer />
    </div>
  );
}

export default App;
