import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-navy-700/50 flex items-center justify-center mb-4 text-gray-600">
        {icon || <Inbox size={32} />}
      </div>
      <h3 className="text-lg font-semibold text-gray-300 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 text-center max-w-md">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
