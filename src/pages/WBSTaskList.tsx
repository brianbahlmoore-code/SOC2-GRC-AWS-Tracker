import React, { useState, useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Breadcrumb } from '../components/Breadcrumb';
import { FilterBar } from '../components/FilterBar';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityFlag } from '../components/PriorityFlag';
import { ProgressBar } from '../components/ProgressBar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PHASES, TaskStatus, TaskPriority, Task } from '../data/types';
import { formatDateShort } from '../utils/dateHelpers';
import { exportToCSV } from '../utils/csv';
import {
  ChevronDown, ChevronRight, Plus, Download, Trash2,
} from 'lucide-react';
import { v4 as uuid } from 'uuid';

export const WBSTaskList: React.FC = () => {
  const { tasks, openDrawer, addTask, deleteTask, updateTask } = useTaskStore();
  const { teamMembers, settings } = useSettingsStore();

  const [search, setSearch] = useState('');
  const [filterPhase, setFilterPhase] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [collapsedPhases, setCollapsedPhases] = useState<Set<number>>(new Set());
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('wbsId');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const togglePhase = (phase: number) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  };

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          t.wbsId.toLowerCase().includes(q)
      );
    }
    if (filterPhase) result = result.filter((t) => t.phase === parseInt(filterPhase));
    if (filterStatus) result = result.filter((t) => t.status === filterStatus);
    if (filterOwner) result = result.filter((t) => t.owner === filterOwner);
    if (filterPriority) result = result.filter((t) => t.priority === filterPriority);

    return result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'wbsId':
          cmp = a.wbsId.localeCompare(b.wbsId, undefined, { numeric: true });
          break;
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'owner':
          cmp = a.owner.localeCompare(b.owner);
          break;
        case 'startDate':
          cmp = a.startDate.localeCompare(b.startDate);
          break;
        case 'endDate':
          cmp = a.endDate.localeCompare(b.endDate);
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'priority': {
          const pOrder = { High: 0, Medium: 1, Low: 2 };
          cmp = pOrder[a.priority] - pOrder[b.priority];
          break;
        }
        case 'percentComplete':
          cmp = a.percentComplete - b.percentComplete;
          break;
        default:
          cmp = 0;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [tasks, search, filterPhase, filterStatus, filterOwner, filterPriority, sortField, sortDir]);

  const groupedByPhase = useMemo(() => {
    const groups: Record<number, Task[]> = {};
    filteredTasks.forEach((t) => {
      if (!groups[t.phase]) groups[t.phase] = [];
      groups[t.phase].push(t);
    });
    return groups;
  }, [filteredTasks]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['WBS ID', 'Task Name', 'Phase', 'Owner', 'Start Date', 'End Date', 'Duration', 'Status', 'Priority', '% Complete', 'Notes'];
    const rows = tasks.map((t) => [
      t.wbsId, t.name, t.phaseName, t.owner, t.startDate, t.endDate,
      String(t.duration), t.status, t.priority, String(t.percentComplete), t.notes,
    ]);
    exportToCSV(headers, rows, 'soc2-project-tasks');
  };

  const handleAddTask = (phase: number) => {
    const phaseTasks = tasks.filter((t) => t.phase === phase);
    const maxSub = phaseTasks.reduce((max, t) => {
      const parts = t.wbsId.split('.');
      const sub = parseInt(parts[parts.length - 1]) || 0;
      return sub > max ? sub : max;
    }, 0);
    const phaseInfo = PHASES.find((p) => p.phase === phase);

    const newTask: Task = {
      id: uuid(),
      wbsId: `${phase}.${maxSub + 1}`,
      name: 'New Task',
      phase,
      phaseName: phaseInfo?.name || '',
      parentId: null,
      owner: teamMembers[0]?.name || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      duration: 1,
      status: 'Not Started',
      priority: 'Medium',
      percentComplete: 0,
      dependencies: [],
      notes: '',
      linkedRisks: [],
      evidenceChecklist: [],
      activityLog: [],
      isMilestone: false,
      kanbanColumn: 'To Do',
    };
    addTask(newTask);
    openDrawer(newTask.id);
  };

  const getRowStatusClass = (status: TaskStatus) => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'In Progress': return 'status-in-progress';
      case 'Blocked': return 'status-blocked';
      default: return 'status-not-started';
    }
  };

  const handleInlineStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  const handleInlineOwnerChange = (taskId: string, newOwner: string) => {
    updateTask(taskId, { owner: newOwner });
  };

  const handleInlinePercentChange = (taskId: string, pct: number) => {
    updateTask(taskId, { percentComplete: pct });
  };

  const SortHeader: React.FC<{ field: string; label: string }> = ({ field, label }) => (
    <th className="table-header" onClick={() => handleSort(field)}>
      <span className="flex items-center gap-1">
        {label}
        {sortField === field && (
          <span className="text-accent">{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  );

  const density = settings.wbsDensity === 'compact' ? 'py-1.5' : 'py-3';

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">WBS / Task List</h1>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tasks by name, WBS ID, or notes..."
        filters={[
          {
            label: 'All Phases',
            value: filterPhase,
            options: PHASES.map((p) => ({ value: String(p.phase), label: p.shortName })),
            onChange: setFilterPhase,
          },
          {
            label: 'All Statuses',
            value: filterStatus,
            options: ['Not Started', 'In Progress', 'In Review', 'Completed', 'Blocked'].map((s) => ({ value: s, label: s })),
            onChange: setFilterStatus,
          },
          {
            label: 'All Owners',
            value: filterOwner,
            options: teamMembers.map((m) => ({ value: m.name, label: m.name })),
            onChange: setFilterOwner,
          },
          {
            label: 'All Priorities',
            value: filterPriority,
            options: ['High', 'Medium', 'Low'].map((p) => ({ value: p, label: p })),
            onChange: setFilterPriority,
          },
        ]}
        actions={
          <button onClick={handleExportCSV} className="btn-secondary text-sm flex items-center gap-2">
            <Download size={14} /> Export CSV
          </button>
        }
      />

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header w-8" />
                <SortHeader field="wbsId" label="WBS ID" />
                <SortHeader field="name" label="Task Name" />
                <SortHeader field="owner" label="Owner" />
                <SortHeader field="startDate" label="Start" />
                <SortHeader field="endDate" label="End" />
                <th className="table-header">Dur.</th>
                <SortHeader field="status" label="Status" />
                <SortHeader field="priority" label="Priority" />
                <SortHeader field="percentComplete" label="% Done" />
                <th className="table-header w-10" />
              </tr>
            </thead>
            <tbody>
              {PHASES.map((phase) => {
                const phaseTasks = groupedByPhase[phase.phase];
                if (!phaseTasks && (filterPhase || filterStatus || filterOwner || filterPriority || search)) return null;
                const isCollapsed = collapsedPhases.has(phase.phase);
                const displayTasks = phaseTasks || [];

                return (
                  <React.Fragment key={phase.phase}>
                    {/* Phase header row */}
                    <tr
                      className="cursor-pointer hover:bg-white/[0.03] transition-colors"
                      onClick={() => togglePhase(phase.phase)}
                      style={{ borderLeft: `3px solid ${phase.color}` }}
                    >
                      <td className={`px-3 ${density}`}>
                        {isCollapsed ? (
                          <ChevronRight size={16} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-500" />
                        )}
                      </td>
                      <td className={`px-4 ${density} text-sm font-bold text-white`} colSpan={9}>
                        <div className="flex items-center gap-3">
                          <span className="badge text-[10px]" style={{
                            backgroundColor: `${phase.color}20`,
                            color: phase.color,
                            border: `1px solid ${phase.color}30`,
                          }}>
                            Phase {phase.phase}
                          </span>
                          {phase.name}
                          <span className="text-xs font-normal text-gray-500">
                            ({displayTasks.length} tasks)
                          </span>
                        </div>
                      </td>
                      <td className={`px-3 ${density}`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddTask(phase.phase);
                          }}
                          className="p-1 text-gray-600 hover:text-accent hover:bg-accent/10 rounded transition-colors"
                          title="Add task to this phase"
                        >
                          <Plus size={14} />
                        </button>
                      </td>
                    </tr>

                    {/* Task rows */}
                    {!isCollapsed &&
                      displayTasks.map((task) => (
                        <tr
                          key={task.id}
                          className={`table-row ${getRowStatusClass(task.status)}`}
                          onClick={() => openDrawer(task.id)}
                        >
                          <td className={`px-3 ${density}`} />
                          <td className={`px-4 ${density} text-xs text-gray-500 font-mono`}>
                            {task.wbsId}
                          </td>
                          <td className={`px-4 ${density} text-sm text-white font-medium max-w-[300px] truncate`}>
                            {task.name}
                          </td>
                          <td className={`px-4 ${density}`} onClick={(e) => e.stopPropagation()}>
                            <select
                              value={task.owner}
                              onChange={(e) => handleInlineOwnerChange(task.id, e.target.value)}
                              className="bg-transparent text-xs text-gray-400 border-none focus:outline-none cursor-pointer hover:text-white transition-colors"
                            >
                              {teamMembers.map((m) => (
                                <option key={m.id} value={m.name} className="bg-navy-800">{m.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className={`px-4 ${density} text-xs text-gray-500`}>{formatDateShort(task.startDate)}</td>
                          <td className={`px-4 ${density} text-xs text-gray-500`}>{formatDateShort(task.endDate)}</td>
                          <td className={`px-4 ${density} text-xs text-gray-500`}>{task.duration}d</td>
                          <td className={`px-4 ${density}`} onClick={(e) => e.stopPropagation()}>
                            <select
                              value={task.status}
                              onChange={(e) => handleInlineStatusChange(task.id, e.target.value as TaskStatus)}
                              className="bg-transparent text-xs text-gray-400 border-none focus:outline-none cursor-pointer hover:text-white transition-colors"
                            >
                              {(['Not Started', 'In Progress', 'In Review', 'Completed', 'Blocked'] as TaskStatus[]).map((s) => (
                                <option key={s} value={s} className="bg-navy-800">{s}</option>
                              ))}
                            </select>
                          </td>
                          <td className={`px-4 ${density}`}>
                            <PriorityFlag priority={task.priority} />
                          </td>
                          <td className={`px-4 ${density}`} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2 min-w-[80px]">
                              <ProgressBar value={task.percentComplete} size="sm" />
                              <span className="text-[10px] text-gray-500 min-w-[28px]">{task.percentComplete}%</span>
                            </div>
                          </td>
                          <td className={`px-3 ${density}`} onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setDeleteTaskId(task.id)}
                              className="p-1 text-gray-700 hover:text-danger hover:bg-danger/10 rounded transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTaskId}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTaskId) deleteTask(deleteTaskId);
          setDeleteTaskId(null);
        }}
        onCancel={() => setDeleteTaskId(null)}
      />
    </div>
  );
};
