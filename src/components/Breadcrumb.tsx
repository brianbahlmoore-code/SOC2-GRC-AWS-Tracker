import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/wbs': 'WBS / Task List',
  '/gantt': 'Gantt Chart',
  '/kanban': 'Kanban Board',
  '/risks': 'Risks & Blockers',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const currentRoute = routeNames[location.pathname] || 'Dashboard';

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
      <Link to="/" className="flex items-center gap-1 hover:text-gray-300 transition-colors">
        <Home size={14} />
        <span>Home</span>
      </Link>
      {location.pathname !== '/' && (
        <>
          <ChevronRight size={14} className="text-gray-600" />
          <span className="text-gray-300">{currentRoute}</span>
        </>
      )}
    </div>
  );
};
