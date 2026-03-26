export type TaskStatus = 'Not Started' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type KanbanColumn = 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';

export interface EvidenceItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ActivityEntry {
  id: string;
  text: string;
  timestamp: string; // ISO date string
  author: string;
}

export interface Task {
  id: string;
  wbsId: string;
  name: string;
  phase: number;
  phaseName: string;
  parentId: string | null;
  owner: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: TaskStatus;
  priority: TaskPriority;
  percentComplete: number;
  dependencies: string[];
  notes: string;
  linkedRisks: string[];
  evidenceChecklist: EvidenceItem[];
  activityLog: ActivityEntry[];
  isMilestone: boolean;
  kanbanColumn: KanbanColumn;
}

export type RiskCategory = 'Technical' | 'Process' | 'People' | 'Vendor' | 'Audit' | 'Governance';
export type RiskStatus = 'Open' | 'Mitigated' | 'Accepted' | 'Closed';

export interface Risk {
  id: string;
  description: string;
  category: RiskCategory;
  likelihood: number;
  impact: number;
  riskScore: number;
  mitigationPlan: string;
  owner: string;
  status: RiskStatus;
  linkedTasks: string[];
  lastUpdated: string;
}

export type BlockerSeverity = 'High' | 'Medium' | 'Low';
export type BlockerStatus = 'Open' | 'Resolved';

export interface Blocker {
  id: string;
  description: string;
  linkedTasks: string[];
  raisedBy: string;
  dateRaised: string;
  severity: BlockerSeverity;
  resolutionPlan: string;
  owner: string;
  status: BlockerStatus;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

export interface Settings {
  projectName: string;
  startDate: string;
  targetAuditDate: string;
  theme: 'dark' | 'light';
  wbsDensity: 'compact' | 'comfortable';
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

// Phase info for display and coloring
export interface PhaseInfo {
  phase: number;
  name: string;
  shortName: string;
  color: string;
}

export const PHASES: PhaseInfo[] = [
  { phase: 0, name: 'Project Setup & Objectives', shortName: 'P0: Setup', color: '#6366f1' },
  { phase: 1, name: 'Kick-off & Detailed Planning', shortName: 'P1: Planning', color: '#8b5cf6' },
  { phase: 2, name: 'Scoping & System Description', shortName: 'P2: Scoping', color: '#a78bfa' },
  { phase: 3, name: 'Risk Assessment', shortName: 'P3: Risk', color: '#c084fc' },
  { phase: 4, name: 'Control Mapping & Gap Analysis', shortName: 'P4: Gap Analysis', color: '#2D7DD2' },
  { phase: 5, name: 'Remediation & Control Implementation', shortName: 'P5: Remediation', color: '#06D6A0' },
  { phase: 6, name: 'Observation Window Evidence Collection', shortName: 'P6: Evidence', color: '#FFB703' },
  { phase: 7, name: 'Readiness Review & Auditor Onboarding', shortName: 'P7: Readiness', color: '#fb923c' },
  { phase: 8, name: 'Audit Fieldwork & Report', shortName: 'P8: Audit', color: '#EF233C' },
  { phase: 9, name: 'Post-Audit & Continuous Compliance', shortName: 'P9: Continuous', color: '#14b8a6' },
];

export const STATUS_COLORS: Record<TaskStatus, string> = {
  'Not Started': '#6b7280',
  'In Progress': '#2D7DD2',
  'In Review': '#a78bfa',
  'Completed': '#06D6A0',
  'Blocked': '#EF233C',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  'High': '#EF233C',
  'Medium': '#FFB703',
  'Low': '#06D6A0',
};

export const KANBAN_COLUMNS: { id: KanbanColumn; label: string; icon: string }[] = [
  { id: 'Backlog', label: '📋 Backlog', icon: '📋' },
  { id: 'To Do', label: '🔜 To Do', icon: '🔜' },
  { id: 'In Progress', label: '🔄 In Progress', icon: '🔄' },
  { id: 'In Review', label: '👀 In Review / Evidence Pending', icon: '👀' },
  { id: 'Done', label: '✅ Done', icon: '✅' },
  { id: 'Blocked', label: '🔴 Blocked', icon: '🔴' },
];
