import { Task, TaskStatus, TaskStatusLabels } from "@/types/task.type";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onSendToQC?: (task: Task) => void;
  onQCReview?: (task: Task) => void;
}

export const KanbanColumn = ({
  status,
  tasks,
  onEditTask,
  onDeleteTask,
  onSendToQC,
  onQCReview,
}: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const statusLabel = TaskStatusLabels[status];

  return (
    <div className="flex-1 min-w-[280px] bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{statusLabel.label}</h3>
          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      <div ref={setNodeRef} className="min-h-[200px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onSendToQC={onSendToQC}
              onQCReview={onQCReview}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
