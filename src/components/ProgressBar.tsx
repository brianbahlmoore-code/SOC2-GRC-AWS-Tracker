import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color,
  size = 'sm',
  showLabel = false,
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor =
    color || (pct >= 80 ? '#06D6A0' : pct >= 50 ? '#2D7DD2' : pct >= 25 ? '#FFB703' : '#EF233C');

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'md' ? 'h-2.5' : 'h-4';

  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`flex-1 bg-navy-700/50 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-400 min-w-[36px] text-right">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
};
