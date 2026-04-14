import { Task, TaskPriorityLabels } from "@/types/task.type";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";

interface KanbanCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onSendToQC?: (task: Task) => void;
  onQCReview?: (task: Task) => void;
}

export const KanbanCard = ({ task, onEdit }: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityLabel = task.priority
    ? TaskPriorityLabels[task.priority as keyof typeof TaskPriorityLabels]
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg border border-gray-200 p-4 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3
          className="font-medium text-sm text-gray-900 flex-1 cursor-pointer hover:text-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
        >
          {task.title}
        </h3>
        {priorityLabel && (
          <span
            className={`text-xs px-2 py-0.5 rounded ${priorityLabel.bgColor} ${priorityLabel.color}`}
          >
            {priorityLabel.label}
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {task.assignee && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <User size={14} />
            <span>{task.assignee.name}</span>
          </div>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar size={14} />
            <span>{format(new Date(task.dueDate), "dd/MM/yyyy")}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock size={14} />
          <span>{task.estimateEffort}h</span>
          {task.actualEffort > 0 && (
            <span className="text-gray-400">/ {task.actualEffort}h</span>
          )}
        </div>
      </div>

      {task.project && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">{task.project.name}</span>
        </div>
      )}
    </div>
  );
};
