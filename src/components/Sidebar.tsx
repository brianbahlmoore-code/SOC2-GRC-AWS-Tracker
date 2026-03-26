import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTree,
  GanttChart,
  Columns3,
  AlertTriangle,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, emoji: '🏠' },
  { path: '/wbs', label: 'WBS / Task List', icon: ListTree, emoji: '📋' },
  { path: '/gantt', label: 'Gantt Chart', icon: GanttChart, emoji: '📅' },
  { path: '/kanban', label: 'Kanban Board', icon: Columns3, emoji: '🗂️' },
  { path: '/risks', label: 'Risks & Blockers', icon: AlertTriangle, emoji: '⚠️' },
  { path: '/reports', label: 'Reports', icon: BarChart3, emoji: '📊' },
  { path: '/settings', label: 'Settings', icon: Settings, emoji: '⚙️' },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <aside
      className={`glass-sidebar h-screen sticky top-0 flex flex-col transition-all duration-300 z-30 ${
        collapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent-light flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20">
          <Shield size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-white truncate">SOC 2 GRC</h1>
            <p className="text-[10px] text-gray-500 truncate">AWS Readiness Tracker</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-accent/15 text-accent border-l-2 border-accent ml-0'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r" />
              )}
              <item.icon
                size={20}
                className={`flex-shrink-0 ${isActive ? 'text-accent' : 'text-gray-500 group-hover:text-gray-300'}`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center p-3 border-t border-white/5 text-gray-500 hover:text-gray-300 transition-colors hover:bg-white/5"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
};
