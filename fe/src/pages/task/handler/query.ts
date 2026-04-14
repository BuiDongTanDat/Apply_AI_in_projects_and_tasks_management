import { TaskPriority, TaskStatus } from "@/types/task.type";

export interface TaskQuery {
  page: number;
  limit: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  teamId?: number;
  dueDate?: number;
  assigneeId?: number;
  qcId?: number;
  projectId?: number;
}
