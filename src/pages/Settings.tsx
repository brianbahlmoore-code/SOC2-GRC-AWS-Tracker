import React, { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTaskStore } from '../store/useTaskStore';
import { useRiskStore } from '../store/useRiskStore';
import { useBlockerStore } from '../store/useBlockerStore';
import { Breadcrumb } from '../components/Breadcrumb';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TeamMember } from '../data/types';
import { v4 as uuid } from 'uuid';
import {
  Sun, Moon, Plus, Trash2, Edit3, Check, X, RotateCcw,
  User, Palette, LayoutList, Calendar,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, teamMembers, updateSettings, setTheme, addTeamMember, updateTeamMember, removeTeamMember, resetAll } = useSettingsStore();
  const { resetTasks } = useTaskStore();
  const { resetRisks } = useRiskStore();
  const { resetBlockers } = useBlockerStore();

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '' });
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');

  const handleResetAll = () => {
    resetAll();
    resetTasks();
    resetRisks();
    resetBlockers();
    setShowResetDialog(false);
  };

  const handleAddMember = () => {
    if (!newMember.name.trim()) return;
    const initials = newMember.name.split(' ').map((n) => n[0]).join('').toUpperCase();
    const colors = ['#6366f1', '#2D7DD2', '#06D6A0', '#FFB703', '#fb923c', '#a78bfa', '#ec4899', '#14b8a6'];
    const color = colors[teamMembers.length % colors.length];
    const member: TeamMember = {
      id: uuid(),
      name: newMember.name,
      role: newMember.role,
      initials,
      color,
    };
    addTeamMember(member);
    setNewMember({ name: '', role: '' });
    setShowAddMember(false);
  };

  const startEdit = (member: TeamMember) => {
    setEditingMember(member.id);
    setEditName(member.name);
    setEditRole(member.role);
  };

  const saveEdit = (id: string) => {
    updateTeamMember(id, {
      name: editName,
      role: editRole,
      initials: editName.split(' ').map((n) => n[0]).join('').toUpperCase(),
    });
    setEditingMember(null);
  };

  return (
    <div>
      <Breadcrumb />
      <h1 className="text-xl font-bold text-white mb-6">Settings</h1>

      <div className="space-y-6 max-w-3xl">
        {/* Project Settings */}
        <div className="glass-card">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-accent" />
            Project Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Project Name</label>
              <input
                type="text"
                value={settings.projectName}
                onChange={(e) => updateSettings({ projectName: e.target.value })}
                className="input-field w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Project Start Date</label>
                <input
                  type="date"
                  value={settings.startDate}
                  onChange={(e) => updateSettings({ startDate: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Target Audit Date</label>
                <input
                  type="date"
                  value={settings.targetAuditDate}
                  onChange={(e) => updateSettings({ targetAuditDate: e.target.value })}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass-card">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Palette size={16} className="text-accent" />
            Appearance
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-2 block">Theme</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
                    settings.theme === 'dark'
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : 'bg-navy-700/50 text-gray-400 border border-white/5 hover:border-white/10'
                  }`}
                >
                  <Moon size={16} /> Dark Mode
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
                    settings.theme === 'light'
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : 'bg-navy-700/50 text-gray-400 border border-white/5 hover:border-white/10'
                  }`}
                >
                  <Sun size={16} /> Light Mode
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-2 block">WBS Table Density</label>
              <div className="flex gap-3">
                <button
                  onClick={() => updateSettings({ wbsDensity: 'comfortable' })}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
                    settings.wbsDensity === 'comfortable'
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : 'bg-navy-700/50 text-gray-400 border border-white/5 hover:border-white/10'
                  }`}
                >
                  <LayoutList size={16} /> Comfortable
                </button>
                <button
                  onClick={() => updateSettings({ wbsDensity: 'compact' })}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
                    settings.wbsDensity === 'compact'
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : 'bg-navy-700/50 text-gray-400 border border-white/5 hover:border-white/10'
                  }`}
                >
                  <LayoutList size={14} /> Compact
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <User size={16} className="text-accent" />
              Team Members
            </h2>
            <button onClick={() => setShowAddMember(true)} className="btn-primary text-xs flex items-center gap-1">
              <Plus size={14} /> Add Member
            </button>
          </div>
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 bg-navy-900/30 rounded-lg group">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initials}
                </div>
                {editingMember === member.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-field text-sm flex-1"
                    />
                    <input
                      type="text"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="input-field text-sm flex-1"
                    />
                    <button onClick={() => saveEdit(member.id)} className="p-1.5 text-success hover:bg-success/10 rounded transition-colors">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingMember(null)} className="p-1.5 text-gray-500 hover:bg-white/5 rounded transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(member)} className="p-1.5 text-gray-500 hover:text-accent hover:bg-accent/10 rounded transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => removeTeamMember(member.id)} className="p-1.5 text-gray-500 hover:text-danger hover:bg-danger/10 rounded transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add Member inline */}
          {showAddMember && (
            <div className="mt-3 p-3 bg-navy-900/30 rounded-lg border border-accent/20">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Full name..."
                  className="input-field text-sm flex-1"
                  autoFocus
                />
                <input
                  type="text"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  placeholder="Role..."
                  className="input-field text-sm flex-1"
                />
                <button onClick={handleAddMember} className="btn-primary text-xs px-3">Add</button>
                <button onClick={() => setShowAddMember(false)} className="btn-ghost text-xs">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Reset Data */}
        <div className="glass-card border-danger/10">
          <h2 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
            <RotateCcw size={16} className="text-danger" />
            Danger Zone
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Reset all project data (tasks, risks, blockers, settings) to the original seed data.
            This action cannot be undone.
          </p>
          <button onClick={() => setShowResetDialog(true)} className="btn-danger text-sm flex items-center gap-2">
            <RotateCcw size={14} /> Reset All Data to Defaults
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showResetDialog}
        title="Reset All Data"
        message="This will reset ALL project data (tasks, risks, blockers, team members, and settings) to the original seed data. Any changes you have made will be lost. Are you sure?"
        confirmLabel="Reset Everything"
        onConfirm={handleResetAll}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  );
};
