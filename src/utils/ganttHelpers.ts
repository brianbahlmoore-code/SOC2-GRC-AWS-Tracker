import { Task } from '../data/types';

export interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies: string;
  custom_class: string;
}

export function tasksToGanttFormat(tasks: Task[]): GanttTask[] {
  return tasks.map(task => ({
    id: task.id,
    name: `${task.wbsId} ${task.name}`,
    start: task.startDate,
    end: task.endDate,
    progress: task.percentComplete,
    dependencies: task.dependencies.join(', '),
    custom_class: getGanttBarClass(task),
  }));
}

function getGanttBarClass(task: Task): string {
  if (task.isMilestone) return 'gantt-milestone';
  switch (task.status) {
    case 'Completed': return 'gantt-completed';
    case 'In Progress': return 'gantt-in-progress';
    case 'In Review': return 'gantt-in-review';
    case 'Blocked': return 'gantt-blocked';
    default: return 'gantt-not-started';
  }
}
