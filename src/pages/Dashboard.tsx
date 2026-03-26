import React, { useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useRiskStore } from '../store/useRiskStore';
import { useBlockerStore } from '../store/useBlockerStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Breadcrumb } from '../components/Breadcrumb';
import { KPICard } from '../components/KPICard';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityFlag } from '../components/PriorityFlag';
import { PHASES } from '../data/types';
import { formatDate, getDaysRemaining, getUrgencyColor, formatDateShort } from '../utils/dateHelpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  ListTodo, CheckCircle2, Clock, CircleDot, AlertCircle,
  AlertTriangle, Calendar, TrendingUp,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { tasks, openDrawer } = useTaskStore();
  const { risks } = useRiskStore();
  const { blockers } = useBlockerStore();
  const { settings } = useSettingsStore();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const notStarted = tasks.filter((t) => t.status === 'Not Started').length;
    const now = new Date().toISOString().split('T')[0];
    const overdue = tasks.filter((t) => t.endDate < now && t.status !== 'Completed').length;
    const blocked = tasks.filter((t) => t.status === 'Blocked').length;
    const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, notStarted, overdue, blocked, overallPct };
  }, [tasks]);

  const phaseData = useMemo(() => {
    return PHASES.map((p) => {
      const phaseTasks = tasks.filter((t) => t.phase === p.phase);
      const completed = phaseTasks.filter((t) => t.status === 'Completed').length;
      const pct = phaseTasks.length > 0 ? Math.round((completed / phaseTasks.length) * 100) : 0;
      return { name: `P${p.phase}`, fullName: p.name, pct, color: p.color, total: phaseTasks.length, completed };
    });
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    const future = new Date(now.getTime() + 14 * 86400000);
    const nowStr = now.toISOString().split('T')[0];
    const futureStr = future.toISOString().split('T')[0];
    return tasks
      .filter((t) => t.endDate >= nowStr && t.endDate <= futureStr && t.status !== 'Completed')
      .sort((a, b) => a.endDate.localeCompare(b.endDate))
      .slice(0, 8);
  }, [tasks]);

  const topRisks = useMemo(() => {
    return [...risks]
      .filter((r) => r.status === 'Open')
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 3);
  }, [risks]);

  const blockedTasks = useMemo(
    () => tasks.filter((t) => t.status === 'Blocked'),
    [tasks]
  );

  const openBlockers = useMemo(
    () => blockers.filter((b) => b.status === 'Open'),
    [blockers]
  );

  return (
    <div>
      <Breadcrumb />

      {/* Project Header */}
      <div className="glass-card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">{settings.projectName}</h1>
            <p className="text-sm text-gray-400 mt-1">
              Target Audit Date: <span className="text-accent font-medium">{formatDate(settings.targetAuditDate)}</span>
            </p>
          </div>
          <div className="flex items-center gap-4 min-w-[300px]">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Overall Progress</span>
                <span className="text-sm font-bold text-white">{stats.overallPct}%</span>
              </div>
              <ProgressBar value={stats.overallPct} size="md" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar size={14} />
              {formatDateShort(new Date().toISOString().split('T')[0])}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <KPICard title="Total Tasks" value={stats.total} icon={ListTodo} color="#2D7DD2" subtitle={`${stats.total} tasks`} />
        <KPICard title="Completed" value={stats.completed} icon={CheckCircle2} color="#06D6A0" subtitle={`${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% of total`} />
        <KPICard title="In Progress" value={stats.inProgress} icon={Clock} color="#2D7DD2" subtitle={`${stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}% of total`} />
        <KPICard title="Not Started" value={stats.notStarted} icon={CircleDot} color="#6b7280" subtitle={`${stats.total > 0 ? Math.round((stats.notStarted / stats.total) * 100) : 0}% of total`} />
        <KPICard title="Overdue" value={stats.overdue} icon={AlertCircle} color="#EF233C" subtitle={stats.overdue > 0 ? 'Action required' : 'All on track'} />
      </div>

      {/* Blocked Tasks Banner */}
      {blockedTasks.length > 0 && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="text-danger flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-danger mb-1">
              {blockedTasks.length} Blocked Task{blockedTasks.length > 1 ? 's' : ''}
            </h3>
            <div className="flex flex-wrap gap-2">
              {blockedTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => openDrawer(t.id)}
                  className="text-xs bg-danger/10 text-danger px-2 py-1 rounded hover:bg-danger/20 transition-colors"
                >
                  {t.wbsId}: {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phase Completion Chart */}
        <div className="lg:col-span-2 glass-card">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-accent" />
            Phase Completion
          </h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phaseData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1B2838', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e5e7eb' }}
                  formatter={(value: any, _name: any, entry: any) => [`${value}% (${entry.payload.completed}/${entry.payload.total})`, 'Completion']}
                  labelFormatter={(label: any) => {
                    const phase = phaseData.find(p => p.name === label);
                    return phase ? phase.fullName : String(label);
                  }}
                />
                <Bar dataKey="pct" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {phaseData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Risks Panel */}
        <div className="glass-card">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" />
            Top Risks
          </h2>
          <div className="space-y-3">
            {topRisks.map((risk) => (
              <div key={risk.id} className="bg-navy-900/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="badge-danger text-[10px]">{risk.id}</span>
                  <span className="text-xs font-bold" style={{
                    color: risk.riskScore >= 15 ? '#EF233C' : risk.riskScore >= 10 ? '#FFB703' : '#06D6A0',
                  }}>
                    Score: {risk.riskScore}
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{risk.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-600">{risk.category}</span>
                  <span className="text-[10px] text-gray-500">{risk.owner}</span>
                </div>
              </div>
            ))}
            {topRisks.length === 0 && (
              <p className="text-xs text-gray-600 text-center py-4">No open risks</p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="glass-card mt-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-accent" />
          Upcoming Deadlines (Next 14 Days)
        </h2>
        {upcomingTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Task</th>
                  <th className="table-header">Phase</th>
                  <th className="table-header">Owner</th>
                  <th className="table-header">Due Date</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingTasks.map((t) => {
                  const urgency = getUrgencyColor(t.endDate);
                  return (
                    <tr key={t.id} className="table-row" onClick={() => openDrawer(t.id)}>
                      <td className="table-cell font-medium text-white">
                        <span className="text-gray-500 mr-2 text-xs">{t.wbsId}</span>
                        {t.name}
                      </td>
                      <td className="table-cell text-xs">{PHASES.find((p) => p.phase === t.phase)?.shortName}</td>
                      <td className="table-cell text-xs">{t.owner}</td>
                      <td className="table-cell">
                        <span className={`text-xs font-medium ${urgency === 'danger' ? 'text-danger' : urgency === 'warning' ? 'text-warning' : 'text-success'}`}>
                          {formatDate(t.endDate)}
                          <span className="block text-[10px] opacity-70">{getDaysRemaining(t.endDate)}</span>
                        </span>
                      </td>
                      <td className="table-cell"><StatusBadge status={t.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-600 text-center py-6">No upcoming deadlines in the next 14 days</p>
        )}
      </div>
    </div>
  );
};
