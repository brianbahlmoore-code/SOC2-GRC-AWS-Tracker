import React from 'react';
import { TaskPriority, PRIORITY_COLORS } from '../data/types';
import { Flag } from 'lucide-react';

interface PriorityFlagProps {
  priority: TaskPriority;
  showLabel?: boolean;
}

export const PriorityFlag: React.FC<PriorityFlagProps> = ({ priority, showLabel = true }) => {
  const color = PRIORITY_COLORS[priority];

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color }}>
      <Flag size={12} fill={color} />
      {showLabel && priority}
    </span>
  );
};
