import {
  ClockCircleOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { TaskStatus, TaskStatusLabels } from "@/types/task.type";
import dayjs from "dayjs";

export const TaskStatusRender = ({ status }: { status: TaskStatus }) => {
  const { label, color, bgColor } = TaskStatusLabels[status];

  const iconMap = {
    [TaskStatus.Pending]: (
      <ClockCircleOutlined className="text-orange-500 text-sm" />
    ),
    [TaskStatus.Processing]: (
      <LoadingOutlined className="text-blue-500 text-sm animate-spin-slow" />
    ),
    [TaskStatus.WaitReview]: (
      <EyeOutlined className="text-yellow-500 text-sm" />
    ),
    [TaskStatus.Done]: (
      <CheckCircleOutlined className="text-green-500 text-sm" />
    ),
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${color} transition-all duration-200 hover:opacity-90 hover:shadow-sm`}
    >
      {iconMap[status]}
      <span>{label}</span>
    </div>
  );
};

export const DeadlineCalculator = ({
  dueDate,
  status,
}: {
  dueDate?: number;
  status: TaskStatus;
}) => {
  if (!dueDate) return "No deadline";
  const now = dayjs();
  const deadline = dayjs.unix(dueDate);
  const diff = deadline.diff(now, "minute");

  let transform = "",
    color = "",
    bgColor = "";

  if (Math.abs(diff) < 60) {
    transform = `${diff} min`;
  } else if (Math.abs(diff) < 1440) {
    transform = `${Math.floor(diff / 60)} hour`;
  } else {
    transform = `${Math.floor(diff / 1440)} day`;
  }

  if (diff > 0) {
    transform = `${transform} left`;
    color = "text-lime-500";
    bgColor = "bg-lime-50";
  } else {
    transform = `${Math.abs(diff)} min overdue`; // actually diff is negative
    // let's re-calculate for overdue
    const absDiff = Math.abs(diff);
    if (absDiff < 60) {
      transform = `${absDiff} min overdue`;
    } else if (absDiff < 1440) {
      transform = `${Math.floor(absDiff / 60)} hour overdue`;
    } else {
      transform = `${Math.floor(absDiff / 1440)} day overdue`;
    }
    color = "text-red-500";
    bgColor = "bg-red-100";
  }

  return (
    <div className="flex flex-col items-start">
      <span>{dayjs.unix(dueDate || 0).format("DD/MM/YYYY HH:mm")}</span>
      {status !== TaskStatus.Done && (
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${color} transition-all duration-200 hover:opacity-90 hover:shadow-sm`}
        >
          {transform}
        </div>
      )}
    </div>
  );
};
