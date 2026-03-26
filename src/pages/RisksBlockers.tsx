import React, { useState, useMemo } from 'react';
import { useRiskStore } from '../store/useRiskStore';
import { useBlockerStore } from '../store/useBlockerStore';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Breadcrumb } from '../components/Breadcrumb';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Risk, Blocker, RiskCategory, RiskStatus, BlockerSeverity, BlockerStatus } from '../data/types';
import { formatDate } from '../utils/dateHelpers';
import { v4 as uuid } from 'uuid';
import { Plus, Trash2, Edit3, AlertTriangle, ShieldAlert, X, Check } from 'lucide-react';

const RISK_CATEGORIES: RiskCategory[] = ['Technical', 'Process', 'People', 'Vendor', 'Audit', 'Governance'];
const RISK_STATUSES: RiskStatus[] = ['Open', 'Mitigated', 'Accepted', 'Closed'];

// Risk Heatmap component
const RiskHeatmap: React.FC<{ risks: Risk[] }> = ({ risks }) => {
  const grid = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 0));
  risks.filter(r => r.status === 'Open').forEach((r) => {
    if (r.likelihood >= 1 && r.likelihood <= 5 && r.impact >= 1 && r.impact <= 5) {
      grid[5 - r.likelihood][r.impact - 1]++;
    }
  });

  const getCellColor = (row: number, col: number) => {
    const likelihood = 5 - row;
    const impact = col + 1;
    const score = likelihood * impact;
    if (score >= 15) return 'bg-danger/40 border-danger/30';
    if (score >= 10) return 'bg-warning/30 border-warning/20';
    if (score >= 5) return 'bg-warning/15 border-warning/10';
    return 'bg-success/10 border-success/10';
  };

  return (
    <div className="glass-card">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Risk Heat Map</h3>
      <div className="flex items-end gap-2">
        <div className="flex flex-col items-center gap-0.5 mr-1">
          <span className="text-[9px] text-gray-500 -rotate-90 mb-4">LIKELIHOOD</span>
          {[5, 4, 3, 2, 1].map((v) => (
            <div key={v} className="h-10 flex items-center">
              <span className="text-[10px] text-gray-500 w-3 text-right">{v}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="grid grid-cols-5 gap-0.5">
            {grid.map((row, ri) =>
              row.map((count, ci) => (
                <div
                  key={`${ri}-${ci}`}
                  className={`w-10 h-10 rounded border flex items-center justify-center text-xs font-bold ${getCellColor(ri, ci)}`}
                >
                  {count > 0 ? count : ''}
                </div>
              ))
            )}
          </div>
          <div className="flex justify-between mt-1 px-1">
            {[1, 2, 3, 4, 5].map((v) => (
              <span key={v} className="text-[10px] text-gray-500 w-10 text-center">{v}</span>
            ))}
          </div>
          <p className="text-[9px] text-gray-500 text-center mt-1">IMPACT</p>
        </div>
      </div>
    </div>
  );
};

export const RisksBlockers: React.FC = () => {
  const { risks, addRisk, updateRisk, deleteRisk } = useRiskStore();
  const { blockers, addBlocker, updateBlocker, deleteBlocker } = useBlockerStore();
  const { tasks } = useTaskStore();
  const { teamMembers } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'risks' | 'blockers'>('risks');
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'risk' | 'blocker'; id: string } | null>(null);
  const [editingRisk, setEditingRisk] = useState<string | null>(null);
  const [editingBlocker, setEditingBlocker] = useState<string | null>(null);
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [showAddBlocker, setShowAddBlocker] = useState(false);

  // New risk form
  const [newRisk, setNewRisk] = useState<Partial<Risk>>({
    description: '', category: 'Technical', likelihood: 3, impact: 3,
    mitigationPlan: '', owner: teamMembers[0]?.name || '', status: 'Open',
  });

  // New blocker form
  const [newBlocker, setNewBlocker] = useState<Partial<Blocker>>({
    description: '', severity: 'Medium', resolutionPlan: '',
    owner: teamMembers[0]?.name || '', raisedBy: teamMembers[0]?.name || '',
  });

  const handleAddRisk = () => {
    const risk: Risk = {
      id: `R-${String(risks.length + 1).padStart(2, '0')}`,
      description: newRisk.description || '',
      category: (newRisk.category || 'Technical') as RiskCategory,
      likelihood: newRisk.likelihood || 3,
      impact: newRisk.impact || 3,
      riskScore: (newRisk.likelihood || 3) * (newRisk.impact || 3),
      mitigationPlan: newRisk.mitigationPlan || '',
      owner: newRisk.owner || '',
      status: 'Open',
      linkedTasks: [],
      lastUpdated: new Date().toISOString(),
    };
    addRisk(risk);
    setShowAddRisk(false);
    setNewRisk({ description: '', category: 'Technical', likelihood: 3, impact: 3, mitigationPlan: '', owner: teamMembers[0]?.name || '', status: 'Open' });
  };

  const handleAddBlocker = () => {
    const blocker: Blocker = {
      id: `B-${String(blockers.length + 1).padStart(2, '0')}`,
      description: newBlocker.description || '',
      linkedTasks: [],
      raisedBy: newBlocker.raisedBy || '',
      dateRaised: new Date().toISOString().split('T')[0],
      severity: (newBlocker.severity || 'Medium') as BlockerSeverity,
      resolutionPlan: newBlocker.resolutionPlan || '',
      owner: newBlocker.owner || '',
      status: 'Open',
    };
    addBlocker(blocker);
    setShowAddBlocker(false);
    setNewBlocker({ description: '', severity: 'Medium', resolutionPlan: '', owner: teamMembers[0]?.name || '', raisedBy: teamMembers[0]?.name || '' });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'risk') deleteRisk(deleteTarget.id);
    else deleteBlocker(deleteTarget.id);
    setDeleteTarget(null);
  };

  const scoreColor = (score: number) => {
    if (score >= 15) return 'text-danger';
    if (score >= 10) return 'text-warning';
    return 'text-success';
  };

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">Risks & Blockers</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-white/5 pb-0">
        {(['risks', 'blockers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab
                ? 'text-accent border-accent'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            {tab === 'risks' ? `⚠️ Risks (${risks.length})` : `🔴 Blockers (${blockers.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'risks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Heatmap */}
            <RiskHeatmap risks={risks} />

            {/* Risk Table */}
            <div className="lg:col-span-3 glass rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <h3 className="text-sm font-semibold text-gray-300">Risk Register</h3>
                <button onClick={() => setShowAddRisk(true)} className="btn-primary text-xs flex items-center gap-1">
                  <Plus size={14} /> Add Risk
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">ID</th>
                      <th className="table-header">Description</th>
                      <th className="table-header">Category</th>
                      <th className="table-header">L</th>
                      <th className="table-header">I</th>
                      <th className="table-header">Score</th>
                      <th className="table-header">Owner</th>
                      <th className="table-header">Status</th>
                      <th className="table-header w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risks.map((risk) => (
                      <tr key={risk.id} className="table-row">
                        <td className="table-cell font-mono text-xs">{risk.id}</td>
                        <td className="table-cell max-w-[250px]">
                          <p className="text-sm text-white truncate">{risk.description}</p>
                          {risk.mitigationPlan && (
                            <p className="text-[10px] text-gray-600 truncate mt-0.5">{risk.mitigationPlan}</p>
                          )}
                        </td>
                        <td className="table-cell text-xs">{risk.category}</td>
                        <td className="table-cell text-center text-xs">{risk.likelihood}</td>
                        <td className="table-cell text-center text-xs">{risk.impact}</td>
                        <td className={`table-cell text-center font-bold text-sm ${scoreColor(risk.riskScore)}`}>
                          {risk.riskScore}
                        </td>
                        <td className="table-cell text-xs">{risk.owner}</td>
                        <td className="table-cell">
                          <select
                            value={risk.status}
                            onChange={(e) => updateRisk(risk.id, { status: e.target.value as RiskStatus })}
                            className="bg-transparent text-xs text-gray-400 border-none focus:outline-none cursor-pointer"
                          >
                            {RISK_STATUSES.map((s) => (
                              <option key={s} value={s} className="bg-navy-800">{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setDeleteTarget({ type: 'risk', id: risk.id })}
                              className="p-1 text-gray-700 hover:text-danger hover:bg-danger/10 rounded transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Add Risk Modal */}
          {showAddRisk && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddRisk(false)} />
              <div className="relative glass rounded-2xl p-6 max-w-lg w-full mx-4 animate-scale-in shadow-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Add New Risk</h3>
                <div className="space-y-3">
                  <textarea value={newRisk.description} onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })} placeholder="Risk description..." className="input-field w-full" rows={2} />
                  <div className="grid grid-cols-2 gap-3">
                    <select value={newRisk.category} onChange={(e) => setNewRisk({ ...newRisk, category: e.target.value as RiskCategory })} className="select-field">
                      {RISK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={newRisk.owner} onChange={(e) => setNewRisk({ ...newRisk, owner: e.target.value })} className="select-field">
                      {teamMembers.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Likelihood (1-5)</label>
                      <input type="number" min={1} max={5} value={newRisk.likelihood} onChange={(e) => setNewRisk({ ...newRisk, likelihood: parseInt(e.target.value) || 1 })} className="input-field w-full" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Impact (1-5)</label>
                      <input type="number" min={1} max={5} value={newRisk.impact} onChange={(e) => setNewRisk({ ...newRisk, impact: parseInt(e.target.value) || 1 })} className="input-field w-full" />
                    </div>
                  </div>
                  <textarea value={newRisk.mitigationPlan} onChange={(e) => setNewRisk({ ...newRisk, mitigationPlan: e.target.value })} placeholder="Mitigation plan..." className="input-field w-full" rows={2} />
                </div>
                <div className="flex justify-end gap-3 mt-5">
                  <button onClick={() => setShowAddRisk(false)} className="btn-secondary text-sm">Cancel</button>
                  <button onClick={handleAddRisk} className="btn-primary text-sm">Add Risk</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'blockers' && (
        <div>
          <div className="glass rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-semibold text-gray-300">Active Blockers</h3>
              <button onClick={() => setShowAddBlocker(true)} className="btn-primary text-xs flex items-center gap-1">
                <Plus size={14} /> Add Blocker
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">ID</th>
                    <th className="table-header">Description</th>
                    <th className="table-header">Raised By</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Severity</th>
                    <th className="table-header">Owner</th>
                    <th className="table-header">Status</th>
                    <th className="table-header w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blockers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="table-cell text-center text-gray-600 py-8">
                        No blockers. Great job! 🎉
                      </td>
                    </tr>
                  ) : (
                    blockers.map((blocker) => (
                      <tr key={blocker.id} className="table-row">
                        <td className="table-cell font-mono text-xs">{blocker.id}</td>
                        <td className="table-cell max-w-[250px]">
                          <p className="text-sm text-white truncate">{blocker.description}</p>
                          {blocker.resolutionPlan && (
                            <p className="text-[10px] text-gray-600 truncate mt-0.5">{blocker.resolutionPlan}</p>
                          )}
                        </td>
                        <td className="table-cell text-xs">{blocker.raisedBy}</td>
                        <td className="table-cell text-xs">{blocker.dateRaised}</td>
                        <td className="table-cell">
                          <span className={`badge text-[10px] ${blocker.severity === 'High' ? 'badge-danger' : blocker.severity === 'Medium' ? 'badge-warning' : 'badge-neutral'}`}>
                            {blocker.severity}
                          </span>
                        </td>
                        <td className="table-cell text-xs">{blocker.owner}</td>
                        <td className="table-cell">
                          <select
                            value={blocker.status}
                            onChange={(e) => updateBlocker(blocker.id, { status: e.target.value as BlockerStatus })}
                            className="bg-transparent text-xs text-gray-400 border-none focus:outline-none cursor-pointer"
                          >
                            <option value="Open" className="bg-navy-800">Open</option>
                            <option value="Resolved" className="bg-navy-800">Resolved</option>
                          </select>
                        </td>
                        <td className="table-cell">
                          <button
                            onClick={() => setDeleteTarget({ type: 'blocker', id: blocker.id })}
                            className="p-1 text-gray-700 hover:text-danger hover:bg-danger/10 rounded transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Blocker Modal */}
          {showAddBlocker && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddBlocker(false)} />
              <div className="relative glass rounded-2xl p-6 max-w-lg w-full mx-4 animate-scale-in shadow-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Add New Blocker</h3>
                <div className="space-y-3">
                  <textarea value={newBlocker.description} onChange={(e) => setNewBlocker({ ...newBlocker, description: e.target.value })} placeholder="Blocker description..." className="input-field w-full" rows={2} />
                  <div className="grid grid-cols-2 gap-3">
                    <select value={newBlocker.severity} onChange={(e) => setNewBlocker({ ...newBlocker, severity: e.target.value as BlockerSeverity })} className="select-field">
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <select value={newBlocker.owner} onChange={(e) => setNewBlocker({ ...newBlocker, owner: e.target.value })} className="select-field">
                      {teamMembers.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  </div>
                  <select value={newBlocker.raisedBy} onChange={(e) => setNewBlocker({ ...newBlocker, raisedBy: e.target.value })} className="select-field w-full">
                    {teamMembers.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                  <textarea value={newBlocker.resolutionPlan} onChange={(e) => setNewBlocker({ ...newBlocker, resolutionPlan: e.target.value })} placeholder="Resolution plan..." className="input-field w-full" rows={2} />
                </div>
                <div className="flex justify-end gap-3 mt-5">
                  <button onClick={() => setShowAddBlocker(false)} className="btn-secondary text-sm">Cancel</button>
                  <button onClick={handleAddBlocker} className="btn-primary text-sm">Add Blocker</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.type === 'risk' ? 'Risk' : 'Blocker'}`}
        message="Are you sure? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
