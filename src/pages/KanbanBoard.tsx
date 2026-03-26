import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Breadcrumb } from '../components/Breadcrumb';
import { FilterBar } from '../components/FilterBar';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityFlag } from '../components/PriorityFlag';
import { ProgressBar } from '../components/ProgressBar';
import { KANBAN_COLUMNS, PHASES, KanbanColumn, Task } from '../data/types';
import { formatDateShort, getUrgencyColor } from '../utils/dateHelpers';
import { ChevronDown, ChevronUp, Plus, GripVertical } from 'lucide-react';
import { v4 as uuid } from 'uuid';

// Sortable card component
const SortableCard: React.FC<{ task: Task; onClick: () => void }> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const phaseInfo = PHASES.find((p) => p.phase === task.phase);
  const urgency = getUrgencyColor(task.endDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass-card cursor-pointer group hover:border-white/10"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-1 text-gray-700 hover:text-gray-400 cursor-grab active:cursor-grabbing">
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          {/* Header badges */}
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className="badge-accent text-[9px] px-1.5 py-0">{task.wbsId}</span>
            {phaseInfo && (
              <span
                className="badge text-[9px] px-1.5 py-0"
                style={{ backgroundColor: `${phaseInfo.color}15`, color: phaseInfo.color, border: `1px solid ${phaseInfo.color}25` }}
              >
                P{task.phase}
              </span>
            )}
            <PriorityFlag priority={task.priority} showLabel={false} />
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-white mb-2 line-clamp-2">{task.name}</p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Owner initials */}
              <div className="w-6 h-6 rounded-full bg-navy-600 flex items-center justify-center text-[10px] font-bold text-gray-300" title={task.owner}>
                {task.owner.split(' ').map((n) => n[0]).join('')}
              </div>
              <span className={`text-[10px] font-medium ${urgency === 'danger' ? 'text-danger' : urgency === 'warning' ? 'text-warning' : 'text-gray-500'}`}>
                {formatDateShort(task.endDate)}
              </span>
            </div>
            {task.status === 'Blocked' && (
              <span className="badge-danger text-[9px] px-1.5 py-0">Blocked</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-2">
            <ProgressBar value={task.percentComplete} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Card overlay for drag
const CardOverlay: React.FC<{ task: Task }> = ({ task }) => {
  return (
    <div className="glass-card border-accent/30 shadow-2xl shadow-accent/10 scale-105">
      <p className="text-sm font-medium text-white">{task.wbsId} — {task.name}</p>
    </div>
  );
};

export const KanbanBoard: React.FC = () => {
  const { tasks, openDrawer, moveToKanbanColumn, addTask } = useTaskStore();
  const { teamMembers } = useSettingsStore();

  const [search, setSearch] = useState('');
  const [filterPhase, setFilterPhase] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [collapsedColumns, setCollapsedColumns] = useState<Set<KanbanColumn>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.name.toLowerCase().includes(q) || t.wbsId.includes(q));
    }
    if (filterPhase) result = result.filter((t) => t.phase === parseInt(filterPhase));
    if (filterOwner) result = result.filter((t) => t.owner === filterOwner);
    if (filterPriority) result = result.filter((t) => t.priority === filterPriority);
    return result;
  }, [tasks, search, filterPhase, filterOwner, filterPriority]);

  const columnTasks = useMemo(() => {
    const map: Record<KanbanColumn, Task[]> = {
      'Backlog': [],
      'To Do': [],
      'In Progress': [],
      'In Review': [],
      'Done': [],
      'Blocked': [],
    };
    filteredTasks.forEach((t) => {
      if (map[t.kanbanColumn]) {
        map[t.kanbanColumn].push(t);
      } else {
        map['To Do'].push(t);
      }
    });
    return map;
  }, [filteredTasks]);

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const taskId = active.id as string;
    // Determine which column was dropped into
    const overId = over.id as string;
    let targetColumn: KanbanColumn | undefined;

    // Check if dropped on a column directly
    for (const col of KANBAN_COLUMNS) {
      if (overId === col.id) {
        targetColumn = col.id;
        break;
      }
    }

    // Check if dropped on a card — find that card's column
    if (!targetColumn) {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetColumn = overTask.kanbanColumn;
      }
    }

    if (targetColumn && taskId) {
      moveToKanbanColumn(taskId, targetColumn);
    }
  };

  const toggleColumn = (col: KanbanColumn) => {
    setCollapsedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  };

  const handleAddToColumn = (column: KanbanColumn) => {
    const newTask: Task = {
      id: uuid(),
      wbsId: '?.?',
      name: 'New Task',
      phase: 0,
      phaseName: 'Project Setup & Objectives',
      parentId: null,
      owner: teamMembers[0]?.name || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      duration: 1,
      status: column === 'Done' ? 'Completed' : column === 'Blocked' ? 'Blocked' : column === 'In Progress' ? 'In Progress' : column === 'In Review' ? 'In Review' : 'Not Started',
      priority: 'Medium',
      percentComplete: column === 'Done' ? 100 : 0,
      dependencies: [],
      notes: '',
      linkedRisks: [],
      evidenceChecklist: [],
      activityLog: [],
      isMilestone: false,
      kanbanColumn: column,
    };
    addTask(newTask);
    openDrawer(newTask.id);
  };

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">Kanban Board</h1>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tasks..."
        filters={[
          {
            label: 'All Phases',
            value: filterPhase,
            options: PHASES.map((p) => ({ value: String(p.phase), label: p.shortName })),
            onChange: setFilterPhase,
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
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = columnTasks[col.id];
            const isCollapsed = collapsedColumns.has(col.id);

            return (
              <div
                key={col.id}
                id={col.id}
                className="flex-shrink-0 w-[280px] flex flex-col"
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{col.icon}</span>
                    <h3 className="text-sm font-semibold text-gray-300">
                      {col.id}
                    </h3>
                    <span className="badge-neutral text-[10px]">{colTasks.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAddToColumn(col.id)}
                      className="p-1 text-gray-600 hover:text-accent hover:bg-accent/10 rounded transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => toggleColumn(col.id)}
                      className="p-1 text-gray-600 hover:text-gray-300 rounded transition-colors"
                    >
                      {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                  </div>
                </div>

                {/* Column body */}
                {!isCollapsed && (
                  <div className="flex-1 bg-navy-900/30 rounded-xl p-2 space-y-2 min-h-[100px] border border-white/[0.03]">
                    <SortableContext
                      items={colTasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {colTasks.map((task) => (
                        <SortableCard
                          key={task.id}
                          task={task}
                          onClick={() => openDrawer(task.id)}
                        />
                      ))}
                    </SortableContext>
                    {colTasks.length === 0 && (
                      <div className="flex items-center justify-center h-20 text-xs text-gray-700">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? <CardOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
