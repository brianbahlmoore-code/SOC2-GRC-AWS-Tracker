import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, MessageSquare, Link, AlertTriangle } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useRiskStore } from '../store/useRiskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { StatusBadge } from './StatusBadge';
import { PriorityFlag } from './PriorityFlag';
import { ProgressBar } from './ProgressBar';
import { Task, TaskStatus, TaskPriority, PHASES } from '../data/types';
import { formatDate } from '../utils/dateHelpers';
import { v4 as uuid } from 'uuid';

export const TaskDetailDrawer: React.FC = () => {
  const { selectedTaskId, drawerOpen, closeDrawer, updateTask, tasks } = useTaskStore();
  const { risks } = useRiskStore();
  const { teamMembers } = useSettingsStore();

  const task = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  const [newComment, setNewComment] = useState('');
  const [newEvidence, setNewEvidence] = useState('');

  useEffect(() => {
    if (!drawerOpen) {
      setNewComment('');
      setNewEvidence('');
    }
  }, [drawerOpen]);

  if (!drawerOpen || !task) return null;

  const handleUpdate = (updates: Partial<Task>) => {
    updateTask(task.id, updates);
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    handleUpdate({
      activityLog: [
        ...task.activityLog,
        { id: uuid(), text: newComment, timestamp: new Date().toISOString(), author: 'You' },
      ],
    });
    setNewComment('');
  };

  const addEvidence = () => {
    if (!newEvidence.trim()) return;
    handleUpdate({
      evidenceChecklist: [
        ...task.evidenceChecklist,
        { id: uuid(), label: newEvidence, checked: false },
      ],
    });
    setNewEvidence('');
  };

  const toggleEvidence = (evidenceId: string) => {
    handleUpdate({
      evidenceChecklist: task.evidenceChecklist.map((e) =>
        e.id === evidenceId ? { ...e, checked: !e.checked } : e
      ),
    });
  };

  const removeEvidence = (evidenceId: string) => {
    handleUpdate({
      evidenceChecklist: task.evidenceChecklist.filter((e) => e.id !== evidenceId),
    });
  };

  const phaseInfo = PHASES.find((p) => p.phase === task.phase);

  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={closeDrawer} />

      {/* Drawer panel */}
      <div className="drawer-panel">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-navy-950/95 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-accent text-[10px]">{task.wbsId}</span>
                {phaseInfo && (
                  <span
                    className="badge text-[10px]"
                    style={{
                      backgroundColor: `${phaseInfo.color}15`,
                      color: phaseInfo.color,
                      border: `1px solid ${phaseInfo.color}30`,
                    }}
                  >
                    {phaseInfo.shortName}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={task.name}
                onChange={(e) => handleUpdate({ name: e.target.value })}
                className="text-lg font-semibold text-white bg-transparent border-none outline-none w-full hover:bg-white/5 rounded px-1 -ml-1 transition-colors"
              />
            </div>
            <button
              onClick={closeDrawer}
              className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-6">
          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Status</label>
              <select
                value={task.status}
                onChange={(e) => handleUpdate({ status: e.target.value as TaskStatus })}
                className="select-field w-full"
              >
                {(['Not Started', 'In Progress', 'In Review', 'Completed', 'Blocked'] as TaskStatus[]).map(
                  (s) => (
                    <option key={s} value={s}>{s}</option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Priority</label>
              <select
                value={task.priority}
                onChange={(e) => handleUpdate({ priority: e.target.value as TaskPriority })}
                className="select-field w-full"
              >
                {(['High', 'Medium', 'Low'] as TaskPriority[]).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Owner */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">Owner</label>
            <select
              value={task.owner}
              onChange={(e) => handleUpdate({ owner: e.target.value })}
              className="select-field w-full"
            >
              {teamMembers.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Start Date</label>
              <input
                type="date"
                value={task.startDate}
                onChange={(e) => handleUpdate({ startDate: e.target.value })}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">End Date</label>
              <input
                type="date"
                value={task.endDate}
                onChange={(e) => handleUpdate({ endDate: e.target.value })}
                className="input-field w-full"
              />
            </div>
          </div>

          {/* % Complete */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">
              Progress — {task.percentComplete}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={task.percentComplete}
              onChange={(e) => handleUpdate({ percentComplete: parseInt(e.target.value) })}
              className="w-full accent-accent h-2 rounded-lg appearance-none bg-navy-700 cursor-pointer"
            />
            <ProgressBar value={task.percentComplete} size="md" />
          </div>

          {/* Dependencies */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 flex items-center gap-1">
              <Link size={12} /> Dependencies
            </label>
            <select
              multiple
              value={task.dependencies}
              onChange={(e) =>
                handleUpdate({
                  dependencies: Array.from(e.target.selectedOptions, (o) => o.value),
                })
              }
              className="input-field w-full min-h-[80px]"
            >
              {tasks
                .filter((t) => t.id !== task.id)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.wbsId} — {t.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Linked Risks */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 flex items-center gap-1">
              <AlertTriangle size={12} /> Linked Risks
            </label>
            <select
              multiple
              value={task.linkedRisks}
              onChange={(e) =>
                handleUpdate({
                  linkedRisks: Array.from(e.target.selectedOptions, (o) => o.value),
                })
              }
              className="input-field w-full min-h-[60px]"
            >
              {risks.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id}: {r.description}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">Notes</label>
            <textarea
              value={task.notes}
              onChange={(e) => handleUpdate({ notes: e.target.value })}
              rows={3}
              className="input-field w-full resize-y"
              placeholder="Add notes..."
            />
          </div>

          {/* Evidence Checklist */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-2 block">
              Evidence Checklist ({task.evidenceChecklist.filter((e) => e.checked).length}/
              {task.evidenceChecklist.length})
            </label>
            <div className="space-y-1.5 mb-2">
              {task.evidenceChecklist.map((ev) => (
                <div key={ev.id} className="flex items-center gap-2 group">
                  <input
                    type="checkbox"
                    checked={ev.checked}
                    onChange={() => toggleEvidence(ev.id)}
                    className="accent-accent"
                  />
                  <span
                    className={`text-sm flex-1 ${ev.checked ? 'line-through text-gray-600' : 'text-gray-300'}`}
                  >
                    {ev.label}
                  </span>
                  <button
                    onClick={() => removeEvidence(ev.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-danger transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newEvidence}
                onChange={(e) => setNewEvidence(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEvidence()}
                placeholder="Add evidence item..."
                className="input-field flex-1 text-sm"
              />
              <button onClick={addEvidence} className="btn-ghost">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Blocked toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={task.status === 'Blocked'}
                onChange={(e) =>
                  handleUpdate({ status: e.target.checked ? 'Blocked' : 'In Progress' })
                }
                className="accent-danger"
              />
              <span className="text-sm text-gray-300">Mark as Blocked</span>
            </label>
          </div>

          {/* Activity Log */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1">
              <MessageSquare size={12} /> Activity Log
            </label>
            <div className="space-y-3 mb-3 max-h-[200px] overflow-y-auto">
              {task.activityLog.length === 0 ? (
                <p className="text-xs text-gray-600 italic">No activity yet</p>
              ) : (
                [...task.activityLog].reverse().map((entry) => (
                  <div key={entry.id} className="bg-navy-900/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-accent">{entry.author}</span>
                      <span className="text-[10px] text-gray-600">
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{entry.text}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addComment()}
                placeholder="Add a comment..."
                className="input-field flex-1 text-sm"
              />
              <button onClick={addComment} className="btn-primary text-sm px-3">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
