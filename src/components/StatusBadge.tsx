import React from 'react';
import { TaskStatus, STATUS_COLORS } from '../data/types';
import { CheckCircle, Clock, Eye, XCircle, Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

const statusIcons = {
  'Not Started': Circle,
  'In Progress': Clock,
  'In Review': Eye,
  'Completed': CheckCircle,
  'Blocked': XCircle,
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const Icon = statusIcons[status];
  const color = STATUS_COLORS[status];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass}`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      <Icon size={size === 'sm' ? 12 : 14} />
      {status}
    </span>
  );
};
