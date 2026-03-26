import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Breadcrumb } from '../components/Breadcrumb';
import { PHASES } from '../data/types';
import { ZoomIn, ZoomOut, Download } from 'lucide-react';

// We'll build a custom SVG Gantt instead of frappe-gantt for better React integration
export const GanttChart: React.FC = () => {
  const { tasks, openDrawer } = useTaskStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [tasks]
  );

  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (sortedTasks.length === 0) return { minDate: new Date(), maxDate: new Date(), totalDays: 365 };
    const dates = sortedTasks.flatMap((t) => [new Date(t.startDate), new Date(t.endDate)]);
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    min.setDate(min.getDate() - 7);
    max.setDate(max.getDate() + 14);
    return { minDate: min, maxDate: max, totalDays: Math.ceil((max.getTime() - min.getTime()) / 86400000) };
  }, [sortedTasks]);

  const pixelsPerDay = viewMode === 'day' ? 30 : viewMode === 'week' ? 10 : 3;
  const rowHeight = 32;
  const headerHeight = 50;
  const labelWidth = 280;
  const chartWidth = totalDays * pixelsPerDay;
  const chartHeight = sortedTasks.length * rowHeight + headerHeight + 20;

  const dayToX = (date: Date) => {
    return ((date.getTime() - minDate.getTime()) / 86400000) * pixelsPerDay;
  };

  const todayX = dayToX(new Date());

  // Generate month labels
  const monthLabels = useMemo(() => {
    const labels: { x: number; label: string }[] = [];
    const current = new Date(minDate);
    current.setDate(1);
    while (current <= maxDate) {
      labels.push({
        x: dayToX(current),
        label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      });
      current.setMonth(current.getMonth() + 1);
    }
    return labels;
  }, [minDate, maxDate, pixelsPerDay]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#06D6A0';
      case 'In Progress': return '#2D7DD2';
      case 'In Review': return '#a78bfa';
      case 'Blocked': return '#EF233C';
      default: return '#4a5568';
    }
  };

  const handleExportPNG = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = 'gantt-chart.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">Gantt Chart</h1>
        <div className="flex items-center gap-2">
          {(['day', 'week', 'month'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === mode ? 'bg-accent text-white' : 'btn-ghost'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
          <button onClick={handleExportPNG} className="btn-secondary text-sm flex items-center gap-2 ml-2">
            <Download size={14} /> Export PNG
          </button>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div ref={containerRef} className="overflow-auto" style={{ maxHeight: '75vh' }}>
          <svg
            width={labelWidth + chartWidth}
            height={chartHeight}
            className="font-sans"
          >
            {/* Background */}
            <rect width={labelWidth + chartWidth} height={chartHeight} fill="#0D1B2A" />

            {/* Header background */}
            <rect x={0} y={0} width={labelWidth + chartWidth} height={headerHeight} fill="#1B2838" />

            {/* Month labels */}
            {monthLabels.map((ml, i) => (
              <g key={i}>
                <line
                  x1={labelWidth + ml.x}
                  y1={0}
                  x2={labelWidth + ml.x}
                  y2={chartHeight}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={1}
                />
                <text
                  x={labelWidth + ml.x + 5}
                  y={20}
                  fill="#9ca3af"
                  fontSize={11}
                  fontFamily="Inter, sans-serif"
                >
                  {ml.label}
                </text>
              </g>
            ))}

            {/* Today line */}
            <line
              x1={labelWidth + todayX}
              y1={headerHeight}
              x2={labelWidth + todayX}
              y2={chartHeight}
              stroke="#EF233C"
              strokeWidth={2}
              strokeDasharray="6,4"
              opacity={0.7}
            />
            <text
              x={labelWidth + todayX + 4}
              y={headerHeight - 5}
              fill="#EF233C"
              fontSize={10}
              fontFamily="Inter, sans-serif"
            >
              Today
            </text>

            {/* Label header */}
            <text x={12} y={30} fill="#9ca3af" fontSize={12} fontWeight={600} fontFamily="Inter, sans-serif">
              Task
            </text>
            <line x1={labelWidth} y1={0} x2={labelWidth} y2={chartHeight} stroke="rgba(255,255,255,0.08)" />

            {/* Row gridlines and task bars */}
            {sortedTasks.map((task, i) => {
              const y = headerHeight + i * rowHeight;
              const startX = dayToX(new Date(task.startDate));
              const endX = dayToX(new Date(task.endDate));
              const barWidth = Math.max(endX - startX, 4);
              const barColor = statusColor(task.status);
              const phaseInfo = PHASES.find((p) => p.phase === task.phase);

              return (
                <g
                  key={task.id}
                  className="cursor-pointer"
                  onClick={() => openDrawer(task.id)}
                >
                  {/* Row background */}
                  <rect
                    x={0}
                    y={y}
                    width={labelWidth + chartWidth}
                    height={rowHeight}
                    fill={i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'}
                  />
                  <line
                    x1={0}
                    y1={y + rowHeight}
                    x2={labelWidth + chartWidth}
                    y2={y + rowHeight}
                    stroke="rgba(255,255,255,0.03)"
                  />

                  {/* Task label */}
                  <text
                    x={12}
                    y={y + rowHeight / 2 + 4}
                    fill="#e5e7eb"
                    fontSize={11}
                    fontFamily="Inter, sans-serif"
                  >
                    <tspan fill="#6b7280" fontSize={10}>
                      {task.wbsId}{' '}
                    </tspan>
                    {task.name.length > 30 ? task.name.slice(0, 28) + '…' : task.name}
                  </text>

                  {/* Task bar */}
                  {task.isMilestone ? (
                    // Milestone diamond
                    <g transform={`translate(${labelWidth + startX}, ${y + rowHeight / 2})`}>
                      <polygon
                        points="0,-8 8,0 0,8 -8,0"
                        fill={barColor}
                        stroke="white"
                        strokeWidth={1}
                        strokeOpacity={0.3}
                      />
                    </g>
                  ) : (
                    <>
                      {/* Background bar */}
                      <rect
                        x={labelWidth + startX}
                        y={y + 6}
                        width={barWidth}
                        height={rowHeight - 12}
                        rx={4}
                        fill={barColor}
                        opacity={0.2}
                      />
                      {/* Progress bar */}
                      <rect
                        x={labelWidth + startX}
                        y={y + 6}
                        width={barWidth * (task.percentComplete / 100)}
                        height={rowHeight - 12}
                        rx={4}
                        fill={barColor}
                        opacity={0.8}
                      />
                      {/* Border for critical/blocked */}
                      {task.status === 'Blocked' && (
                        <rect
                          x={labelWidth + startX}
                          y={y + 6}
                          width={barWidth}
                          height={rowHeight - 12}
                          rx={4}
                          fill="none"
                          stroke="#EF233C"
                          strokeWidth={2}
                        />
                      )}
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
