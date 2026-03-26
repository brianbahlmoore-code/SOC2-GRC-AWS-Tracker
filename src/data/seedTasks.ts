import { Task, KanbanColumn } from './types';
import { addDays, format } from 'date-fns';

const today = new Date();
const projectStart = today;

function d(offsetDays: number): string {
  return format(addDays(projectStart, offsetDays), 'yyyy-MM-dd');
}

function dur(start: number, end: number): number {
  return end - start;
}

function mapStatusToKanban(status: Task['status']): KanbanColumn {
  switch (status) {
    case 'Completed': return 'Done';
    case 'In Progress': return 'In Progress';
    case 'In Review': return 'In Review';
    case 'Blocked': return 'Blocked';
    default: return 'To Do';
  }
}

interface TaskSeed {
  wbsId: string;
  name: string;
  phase: number;
  phaseName: string;
  parentId: string | null;
  owner: string;
  startOffset: number;
  endOffset: number;
  status: Task['status'];
  priority: Task['priority'];
  percentComplete: number;
  dependencies: string[];
  notes: string;
  isMilestone: boolean;
}

const owners = ['Alex Rivera', 'Jordan Lee', 'Sam Chen', 'Morgan Kim', 'Taylor Brooks', 'Casey Nguyen'];

const taskSeeds: TaskSeed[] = [
  // PHASE 0 — Project Setup & Objectives (Month 1: days 0-30)
  { wbsId: '0.1', name: 'Define SOC 2 type (Type I vs Type II)', phase: 0, phaseName: 'Project Setup & Objectives', parentId: null, owner: owners[0], startOffset: 0, endOffset: 5, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: 'Determine whether to pursue Type I (point-in-time) or Type II (period of time) audit.', isMilestone: false },
  { wbsId: '0.2', name: 'Select Trust Services Criteria (Security, Availability, Confidentiality)', phase: 0, phaseName: 'Project Setup & Objectives', parentId: null, owner: owners[0], startOffset: 3, endOffset: 8, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: 'Choose applicable TSC categories based on service commitments.', isMilestone: false },
  { wbsId: '0.3', name: 'Identify executive sponsor and project team', phase: 0, phaseName: 'Project Setup & Objectives', parentId: null, owner: owners[5], startOffset: 5, endOffset: 10, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: 'Secure commitment from executive sponsor and assemble core project team.', isMilestone: false },
  { wbsId: '0.4', name: 'Define project governance and communication plan', phase: 0, phaseName: 'Project Setup & Objectives', parentId: null, owner: owners[0], startOffset: 8, endOffset: 15, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: 'Establish meeting cadence, reporting structure, and escalation paths.', isMilestone: false },
  { wbsId: '0.5', name: 'Draft and sign Statement of Work (SOW)', phase: 0, phaseName: 'Project Setup & Objectives', parentId: null, owner: owners[4], startOffset: 10, endOffset: 20, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '0.6', name: 'Set up evidence repository (folder structure / GRC tool)', phase: 0, phaseName: 'Project Setup & Objectives', parentId: null, owner: owners[3], startOffset: 15, endOffset: 25, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: 'Create organized folder structure for evidence collection and storage.', isMilestone: false },

  // PHASE 1 — Kick-off & Detailed Planning (Month 1-2: days 20-55)
  { wbsId: '1.1', name: 'Conduct project kick-off meeting', phase: 1, phaseName: 'Kick-off & Detailed Planning', parentId: null, owner: owners[0], startOffset: 20, endOffset: 22, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: 'Invite all stakeholders, present project plan and timelines.', isMilestone: false },
  { wbsId: '1.2', name: 'Build detailed project plan (this tracker)', phase: 1, phaseName: 'Kick-off & Detailed Planning', parentId: null, owner: owners[0], startOffset: 22, endOffset: 30, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '1.3', name: 'Assign roles and create RACI matrix', phase: 1, phaseName: 'Kick-off & Detailed Planning', parentId: null, owner: owners[0], startOffset: 25, endOffset: 32, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: 'Responsible, Accountable, Consulted, Informed matrix for all workstreams.', isMilestone: false },
  { wbsId: '1.4', name: 'Collect existing documentation (policies, architecture, inventories)', phase: 1, phaseName: 'Kick-off & Detailed Planning', parentId: null, owner: owners[3], startOffset: 25, endOffset: 40, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '1.5', name: 'Set up project tooling (tracking, communication channels)', phase: 1, phaseName: 'Kick-off & Detailed Planning', parentId: null, owner: owners[2], startOffset: 22, endOffset: 28, status: 'Not Started', priority: 'Low', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '1.6', name: 'Define escalation procedures', phase: 1, phaseName: 'Kick-off & Detailed Planning', parentId: null, owner: owners[0], startOffset: 30, endOffset: 35, status: 'Not Started', priority: 'Low', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },

  // PHASE 2 — Scoping & System Description (Month 2: days 30-60)
  { wbsId: '2.1', name: 'Define in-scope services and AWS components (VPC, EC2, RDS, S3, IAM, etc.)', phase: 2, phaseName: 'Scoping & System Description', parentId: null, owner: owners[1], startOffset: 30, endOffset: 38, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '2.2', name: 'Document system architecture and data-flow diagrams', phase: 2, phaseName: 'Scoping & System Description', parentId: null, owner: owners[2], startOffset: 35, endOffset: 45, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '2.3', name: 'Define sub-service organizations (AWS carved out, SaaS dependencies)', phase: 2, phaseName: 'Scoping & System Description', parentId: null, owner: owners[0], startOffset: 38, endOffset: 45, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '2.4', name: 'Decide carve-out vs inclusive model for AWS', phase: 2, phaseName: 'Scoping & System Description', parentId: null, owner: owners[0], startOffset: 40, endOffset: 47, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '2.5', name: 'Draft System Description document', phase: 2, phaseName: 'Scoping & System Description', parentId: null, owner: owners[0], startOffset: 45, endOffset: 55, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '2.6', name: 'Review and approve System Description with stakeholders', phase: 2, phaseName: 'Scoping & System Description', parentId: null, owner: owners[5], startOffset: 55, endOffset: 58, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '2.7', name: 'Identify GRC-specific data flows and customer-data handling', phase: 2, phaseName: 'Scoping & System Description', parentId: null, owner: owners[3], startOffset: 40, endOffset: 50, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },

  // PHASE 3 — Risk Assessment (Month 2-3: days 55-85)
  { wbsId: '3.1', name: 'Identify critical assets (app, RDS, S3, audit logs, admin consoles)', phase: 3, phaseName: 'Risk Assessment', parentId: null, owner: owners[1], startOffset: 55, endOffset: 62, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '3.2', name: 'Identify threats (unauthorized access, DDoS, misconfiguration, insider risk)', phase: 3, phaseName: 'Risk Assessment', parentId: null, owner: owners[1], startOffset: 60, endOffset: 68, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '3.3', name: 'Assess impact and likelihood for each threat', phase: 3, phaseName: 'Risk Assessment', parentId: null, owner: owners[0], startOffset: 65, endOffset: 75, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '3.4', name: 'Map risks to SOC 2 TSC criteria (CC1–CC9, Availability, Confidentiality)', phase: 3, phaseName: 'Risk Assessment', parentId: null, owner: owners[0], startOffset: 72, endOffset: 80, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '3.5', name: 'Build and publish risk register', phase: 3, phaseName: 'Risk Assessment', parentId: null, owner: owners[0], startOffset: 78, endOffset: 83, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '3.6', name: 'Prioritize top 10–15 risks for remediation', phase: 3, phaseName: 'Risk Assessment', parentId: null, owner: owners[0], startOffset: 82, endOffset: 85, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },

  // PHASE 4 — Control Mapping & Gap Analysis (Month 3: days 80-110)
  { wbsId: '4.1', name: 'Inventory existing controls (Identity, Logging, Backups, IRP, Patching, Encryption)', phase: 4, phaseName: 'Control Mapping & Gap Analysis', parentId: null, owner: owners[1], startOffset: 80, endOffset: 90, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '4.2', name: 'Map controls to SOC 2 TSC criteria', phase: 4, phaseName: 'Control Mapping & Gap Analysis', parentId: null, owner: owners[0], startOffset: 88, endOffset: 95, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '4.3', name: 'Evaluate design of each control (design assessment)', phase: 4, phaseName: 'Control Mapping & Gap Analysis', parentId: null, owner: owners[0], startOffset: 92, endOffset: 100, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '4.4', name: 'Review existing evidence (logs, screenshots, reports)', phase: 4, phaseName: 'Control Mapping & Gap Analysis', parentId: null, owner: owners[3], startOffset: 90, endOffset: 98, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '4.5', name: 'Identify gaps and classify by severity (High/Medium/Low)', phase: 4, phaseName: 'Control Mapping & Gap Analysis', parentId: null, owner: owners[0], startOffset: 98, endOffset: 105, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '4.6', name: 'Produce Gap Analysis Report', phase: 4, phaseName: 'Control Mapping & Gap Analysis', parentId: null, owner: owners[0], startOffset: 103, endOffset: 108, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: true },
  { wbsId: '4.7', name: 'Review and prioritize gaps with leadership', phase: 4, phaseName: 'Control Mapping & Gap Analysis', parentId: null, owner: owners[5], startOffset: 108, endOffset: 110, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },

  // PHASE 5 — Remediation & Control Implementation (Month 3-5: days 90-150)
  { wbsId: '5.1', name: 'Draft / update Information Security Policy', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[0], startOffset: 95, endOffset: 105, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.2', name: 'Draft / update Access Control Policy', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[0], startOffset: 95, endOffset: 105, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.3', name: 'Draft / update Incident Response Plan (IRP)', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[1], startOffset: 98, endOffset: 110, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.4', name: 'Draft / update Backup & DR Policy (with RPO/RTO)', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[1], startOffset: 100, endOffset: 112, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.5', name: 'Draft / update Vulnerability Management Policy', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[1], startOffset: 100, endOffset: 110, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.6', name: 'Draft / update Vendor Risk Management Policy', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[3], startOffset: 102, endOffset: 112, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.7', name: 'Enforce MFA on all IAM users and AWS console', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[1], startOffset: 105, endOffset: 112, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.8', name: 'Implement least-privilege IAM roles and RBAC in GRC app', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[2], startOffset: 108, endOffset: 118, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.9', name: 'Configure private subnets for DBs, tighten Security Groups', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[1], startOffset: 110, endOffset: 118, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.10', name: 'Enable WAF for all public-facing endpoints', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[1], startOffset: 112, endOffset: 118, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.11', name: 'Enable CloudTrail across all regions with 365-day retention', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[1], startOffset: 115, endOffset: 120, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.12', name: 'Configure CloudWatch alarms (failed logins, admin actions, backups)', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[1], startOffset: 118, endOffset: 125, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.13', name: 'Automate RDS snapshots and S3 backups; document restore procedures', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[1], startOffset: 120, endOffset: 128, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.14', name: 'Enforce TLS for all traffic; enable KMS encryption for EBS and S3', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[1], startOffset: 122, endOffset: 130, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.15', name: 'Remove all plaintext secrets (migrate to Secrets Manager / Parameter Store)', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[2], startOffset: 125, endOffset: 132, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.16', name: 'Implement change management workflow (PR approvals, Jira tickets, audit log)', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[2], startOffset: 128, endOffset: 138, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.17', name: 'Set up vulnerability scanning (e.g., Amazon Inspector, Snyk)', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[1], startOffset: 130, endOffset: 138, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.18', name: 'Configure multi-AZ RDS and auto-scaling for availability', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[1], startOffset: 132, endOffset: 140, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.19', name: 'Implement GRC app role-based permissions and user audit trail', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[2], startOffset: 135, endOffset: 142, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.20', name: 'Conduct security awareness training for all employees', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[4], startOffset: 135, endOffset: 145, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.21', name: 'Set up quarterly access review process (automated reports)', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[1], startOffset: 140, endOffset: 148, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '5.22', name: 'Verify all evidence-collection workflows are running', phase: 5, phaseName: 'Remediation & Control Implementation', parentId: null, owner: owners[0], startOffset: 145, endOffset: 150, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: true },

  // PHASE 6 — Observation Window Evidence Collection (Month 6-11: days 150-310)
  { wbsId: '6.1', name: 'Collect daily: security alert logs, failed-login events, backup job reports', phase: 6, phaseName: 'Observation Window Evidence Collection', parentId: null, owner: owners[1], startOffset: 150, endOffset: 310, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: 'Ongoing daily collection throughout the observation window.', isMilestone: false },
  { wbsId: '6.2', name: 'Collect monthly: RBAC review snapshots, change-management log summaries', phase: 6, phaseName: 'Observation Window Evidence Collection', parentId: null, owner: owners[0], startOffset: 150, endOffset: 310, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '6.3', name: 'Collect quarterly: access-review reports (Q1), training completion (Q1)', phase: 6, phaseName: 'Observation Window Evidence Collection', parentId: null, owner: owners[0], startOffset: 150, endOffset: 240, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '6.4', name: 'Collect quarterly: access-review reports (Q2), training completion (Q2)', phase: 6, phaseName: 'Observation Window Evidence Collection', parentId: null, owner: owners[0], startOffset: 240, endOffset: 310, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '6.5', name: 'Perform annual DR restore test and document results', phase: 6, phaseName: 'Observation Window Evidence Collection', parentId: null, owner: owners[1], startOffset: 200, endOffset: 210, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '6.6', name: 'Conduct penetration test (external vendor) and document findings', phase: 6, phaseName: 'Observation Window Evidence Collection', parentId: null, owner: owners[1], startOffset: 220, endOffset: 240, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '6.7', name: 'Run mid-window internal audit of controls (Month 9)', phase: 6, phaseName: 'Observation Window Evidence Collection', parentId: null, owner: owners[0], startOffset: 250, endOffset: 265, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '6.8', name: 'Resolve any findings from internal audit', phase: 6, phaseName: 'Observation Window Evidence Collection', parentId: null, owner: owners[1], startOffset: 265, endOffset: 285, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },

  // PHASE 7 — Readiness Review & Auditor Onboarding (Month 9-10: days 250-300)
  { wbsId: '7.1', name: 'Re-run focused gap check on all high-priority controls', phase: 7, phaseName: 'Readiness Review & Auditor Onboarding', parentId: null, owner: owners[0], startOffset: 260, endOffset: 270, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '7.2', name: 'Confirm evidence coverage for full observation window', phase: 7, phaseName: 'Readiness Review & Auditor Onboarding', parentId: null, owner: owners[0], startOffset: 268, endOffset: 278, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '7.3', name: 'Update System Description to reflect environment changes', phase: 7, phaseName: 'Readiness Review & Auditor Onboarding', parentId: null, owner: owners[2], startOffset: 270, endOffset: 280, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '7.4', name: 'Produce Final Readiness Report with go/no-go recommendation', phase: 7, phaseName: 'Readiness Review & Auditor Onboarding', parentId: null, owner: owners[0], startOffset: 278, endOffset: 285, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '7.5', name: 'Select and contract AICPA-accredited SOC 2 auditor', phase: 7, phaseName: 'Readiness Review & Auditor Onboarding', parentId: null, owner: owners[4], startOffset: 260, endOffset: 280, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: true },
  { wbsId: '7.6', name: 'Provide auditor with system description, TSC, and control matrix', phase: 7, phaseName: 'Readiness Review & Auditor Onboarding', parentId: null, owner: owners[0], startOffset: 285, endOffset: 292, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '7.7', name: 'Co-design PBC (Provided By Client) list with auditor', phase: 7, phaseName: 'Readiness Review & Auditor Onboarding', parentId: null, owner: owners[0], startOffset: 290, endOffset: 300, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },

  // PHASE 8 — Audit Fieldwork & Report (Month 11-12: days 300-365)
  { wbsId: '8.1', name: 'Package and submit evidence for auditor review', phase: 8, phaseName: 'Audit Fieldwork & Report', parentId: null, owner: owners[0], startOffset: 300, endOffset: 310, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '8.2', name: 'Conduct design-testing walkthroughs with auditor', phase: 8, phaseName: 'Audit Fieldwork & Report', parentId: null, owner: owners[0], startOffset: 310, endOffset: 320, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '8.3', name: 'Support operating-effectiveness sampling (Type II testing)', phase: 8, phaseName: 'Audit Fieldwork & Report', parentId: null, owner: owners[1], startOffset: 315, endOffset: 335, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '8.4', name: 'Prepare interviewees (Security, DevOps, Product leads)', phase: 8, phaseName: 'Audit Fieldwork & Report', parentId: null, owner: owners[4], startOffset: 305, endOffset: 315, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '8.5', name: 'Respond to preliminary findings / draft exceptions', phase: 8, phaseName: 'Audit Fieldwork & Report', parentId: null, owner: owners[0], startOffset: 330, endOffset: 345, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '8.6', name: 'Review and approve final SOC 2 report draft', phase: 8, phaseName: 'Audit Fieldwork & Report', parentId: null, owner: owners[5], startOffset: 345, endOffset: 355, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '8.7', name: 'Receive and distribute final SOC 2 Type II report', phase: 8, phaseName: 'Audit Fieldwork & Report', parentId: null, owner: owners[0], startOffset: 355, endOffset: 360, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: true },
  { wbsId: '8.8', name: 'Announce SOC 2 compliance to customers and partners', phase: 8, phaseName: 'Audit Fieldwork & Report', parentId: null, owner: owners[3], startOffset: 358, endOffset: 365, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },

  // PHASE 9 — Post-Audit & Continuous Compliance (Ongoing, days 360+)
  { wbsId: '9.1', name: 'Close all audit exceptions with corrective actions', phase: 9, phaseName: 'Post-Audit & Continuous Compliance', parentId: null, owner: owners[0], startOffset: 360, endOffset: 380, status: 'Not Started', priority: 'High', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '9.2', name: 'Integrate SOC 2 controls into ongoing security program', phase: 9, phaseName: 'Post-Audit & Continuous Compliance', parentId: null, owner: owners[1], startOffset: 365, endOffset: 390, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '9.3', name: 'Set up annual evidence-collection calendar', phase: 9, phaseName: 'Post-Audit & Continuous Compliance', parentId: null, owner: owners[0], startOffset: 370, endOffset: 385, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '9.4', name: 'Plan and schedule next SOC 2 renewal cycle', phase: 9, phaseName: 'Post-Audit & Continuous Compliance', parentId: null, owner: owners[0], startOffset: 380, endOffset: 395, status: 'Not Started', priority: 'Medium', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
  { wbsId: '9.5', name: 'Update security and compliance roadmap', phase: 9, phaseName: 'Post-Audit & Continuous Compliance', parentId: null, owner: owners[5], startOffset: 385, endOffset: 400, status: 'Not Started', priority: 'Low', percentComplete: 0, dependencies: [], notes: '', isMilestone: false },
];

export function generateSeedTasks(): Task[] {
  return taskSeeds.map((seed, index) => ({
    id: `task-${index + 1}`,
    wbsId: seed.wbsId,
    name: seed.name,
    phase: seed.phase,
    phaseName: seed.phaseName,
    parentId: seed.parentId,
    owner: seed.owner,
    startDate: d(seed.startOffset),
    endDate: d(seed.endOffset),
    duration: dur(seed.startOffset, seed.endOffset),
    status: seed.status,
    priority: seed.priority,
    percentComplete: seed.percentComplete,
    dependencies: seed.dependencies,
    notes: seed.notes,
    linkedRisks: [],
    evidenceChecklist: [],
    activityLog: [],
    isMilestone: seed.isMilestone,
    kanbanColumn: mapStatusToKanban(seed.status),
  }));
}
