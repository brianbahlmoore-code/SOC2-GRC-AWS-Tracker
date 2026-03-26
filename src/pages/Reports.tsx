import React, { useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useRiskStore } from '../store/useRiskStore';
import { Breadcrumb } from '../components/Breadcrumb';
import { PHASES, STATUS_COLORS } from '../data/types';
import { exportToCSV } from '../utils/csv';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Download, Printer } from 'lucide-react';

export const Reports: React.FC = () => {
  const { tasks } = useTaskStore();
  const { risks } = useRiskStore();

  // Tasks by status
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || '#6b7280',
    }));
  }, [tasks]);

  // Tasks completed per phase
  const phaseCompletionData = useMemo(() => {
    return PHASES.map((p) => {
      const phaseTasks = tasks.filter((t) => t.phase === p.phase);
      const completed = phaseTasks.filter((t) => t.status === 'Completed').length;
      const total = phaseTasks.length;
      return { name: `P${p.phase}`, completed, total, remaining: total - completed, color: p.color };
    });
  }, [tasks]);

  // Planned vs Actual over time
  const progressOverTimeData = useMemo(() => {
    const totalTasks = tasks.length;
    if (totalTasks === 0) return [];

    const data: { month: string; planned: number; actual: number }[] = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - 11 + i);
      const monthEnd = monthDate.toISOString().split('T')[0];
      const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short' });

      // Planned: tasks that should be done by this date (end date <= month end)
      const plannedDone = tasks.filter((t) => t.endDate <= monthEnd).length;
      const planned = Math.round((plannedDone / totalTasks) * 100);

      // Actual: tasks completed (status is Completed) with end date <= month end
      const actualDone = tasks.filter(
        (t) => t.status === 'Completed' && t.endDate <= monthEnd
      ).length;
      const actual = Math.round((actualDone / totalTasks) * 100);

      data.push({ month: monthLabel, planned, actual });
    }
    return data;
  }, [tasks]);

  // Risk score distribution
  const riskScoreData = useMemo(() => {
    const buckets = [
      { label: '1-5 (Low)', min: 1, max: 5, color: '#06D6A0', count: 0 },
      { label: '6-9 (Med)', min: 6, max: 9, color: '#FFB703', count: 0 },
      { label: '10-14 (High)', min: 10, max: 14, color: '#fb923c', count: 0 },
      { label: '15-25 (Critical)', min: 15, max: 25, color: '#EF233C', count: 0 },
    ];
    risks.forEach((r) => {
      const bucket = buckets.find((b) => r.riskScore >= b.min && r.riskScore <= b.max);
      if (bucket) bucket.count++;
    });
    return buckets.map((b) => ({ name: b.label, value: b.count, color: b.color }));
  }, [risks]);

  const handleExportCSV = () => {
    const headers = ['WBS ID', 'Task', 'Phase', 'Owner', 'Start', 'End', 'Status', 'Priority', '% Complete'];
    const rows = tasks.map((t) => [
      t.wbsId, t.name, t.phaseName, t.owner, t.startDate, t.endDate, t.status, t.priority, String(t.percentComplete),
    ]);
    exportToCSV(headers, rows, 'soc2-project-report');
  };

  const handlePrint = () => window.print();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-navy-800 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="font-medium text-white mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.value}{typeof p.value === 'number' && p.value <= 100 && p.name !== 'completed' && p.name !== 'remaining' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Reports</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary text-sm flex items-center gap-2">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={handlePrint} className="btn-secondary text-sm flex items-center gap-2 no-print">
            <Printer size={14} /> Print Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status - Pie Chart */}
        <div className="glass-card">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Tasks by Status</h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks Completed per Phase - Bar Chart */}
        <div className="glass-card">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Tasks per Phase</h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phaseCompletionData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                <Bar dataKey="completed" stackId="a" fill="#06D6A0" radius={[0, 0, 0, 0]} name="Completed" />
                <Bar dataKey="remaining" stackId="a" fill="#243447" radius={[4, 4, 0, 0]} name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Planned vs Actual - Line Chart */}
        <div className="glass-card">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Planned vs Actual Progress</h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressOverTimeData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                <Line type="monotone" dataKey="planned" stroke="#2D7DD2" strokeWidth={2} dot={{ r: 3, fill: '#2D7DD2' }} name="Planned" />
                <Line type="monotone" dataKey="actual" stroke="#06D6A0" strokeWidth={2} dot={{ r: 3, fill: '#06D6A0' }} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Score Distribution */}
        <div className="glass-card">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Risk Score Distribution</h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskScoreData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50} name="Risks">
                  {riskScoreData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
