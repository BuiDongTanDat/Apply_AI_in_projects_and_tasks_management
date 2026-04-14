import { LabelProps } from "./base.type";
import { Project } from "./project.type";
import { User } from "./user.type";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: number;
  estimateEffort: number;
  actualEffort: number;
  score?: number;
  assignee?: User;
  reviewerId?: number;
  reviewer?: User;
  projectId?: number;
  project?: Project;
  parentTaskId?: string;
  priority?: TaskPriority;
  completedPercent?: number;
  completedAt?: number;
  fileUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
  todos: TodoItem[];
}

export interface TodoItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export enum QCReviewStatus {
  Pass = "PASS",
  Fail = "FAIL",
}

export enum TaskStatus {
  Pending = "PENDING",
  Processing = "PROCESSING",
  WaitReview = "WAIT_REVIEW",
  Done = "DONE",
}

export const TaskStatusLabels: Record<TaskStatus, LabelProps> = {
  [TaskStatus.Pending]: {
    label: "Pending",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  [TaskStatus.Processing]: {
    label: "Processing",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  [TaskStatus.WaitReview]: {
    label: "In Review",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
  },
  [TaskStatus.Done]: {
    label: "Done",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
};

export enum TaskPriority {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Urgent = "URGENT",
}

export const TaskPriorityLabels: Record<TaskPriority, LabelProps> = {
  [TaskPriority.Low]: {
    label: "Low",
    color: "text-green-800",
    bgColor: "bg-green-100",
  },
  [TaskPriority.Medium]: {
    label: "Medium",
    color: "text-yellow-800",
    bgColor: "bg-yellow-100",
  },
  [TaskPriority.High]: {
    label: "High",
    color: "text-orange-800",
    bgColor: "bg-orange-100",
  },
  [TaskPriority.Urgent]: {
    label: "Urgent",
    color: "text-red-800",
    bgColor: "bg-red-100",
  },
};

export enum TaskType {
  Feature = "FEATURE",
  Bug = "BUG",
  Improvement = "IMPROVEMENT",
  Research = "RESEARCH",
  Documentation = "DOCUMENTATION",
  Testing = "TESTING",
  Deployment = "DEPLOYMENT",
  Enhancement = "ENHANCEMENT",
  Maintenance = "MAINTENANCE",
  Other = "OTHER",
}

// export type TaskFormData = Pick<Task, 'title' | 'description' | 'status' | 'dueDate' | 'estimateEffort' | 'priority'>;
