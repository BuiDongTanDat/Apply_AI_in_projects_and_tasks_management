import { TaskPriority, TaskPriorityLabels } from "@/types/task.type";
import { AlertCircle, ArrowUp, Minus, Zap } from "lucide-react";

interface PriorityRenderProps {
  priority?: TaskPriority;
}

const PriorityIcon = ({ priority }: { priority: TaskPriority }) => {
  const iconClass = "w-4 h-4";

  switch (priority) {
    case TaskPriority.Urgent:
      return <Zap className={iconClass} />;
    case TaskPriority.High:
      return <AlertCircle className={iconClass} />;
    case TaskPriority.Medium:
      return <ArrowUp className={iconClass} />;
    case TaskPriority.Low:
      return <Minus className={iconClass} />;
    default:
      return <Minus className={iconClass} />;
  }
};

const PriorityRender = ({ priority }: PriorityRenderProps) => {
  if (!priority) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <Minus className="w-4 h-4" />
        Unknown
      </span>
    );
  }

  const label = TaskPriorityLabels[priority];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${label.bgColor} ${label.color} border border-current border-opacity-20`}
    >
      <PriorityIcon priority={priority} />
      {label.label}
    </span>
  );
};

export default PriorityRender;
