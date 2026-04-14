import { Schedule } from "./schedule.type";
import { Task } from "./task.type";
import { Team } from "./team.type";

export interface ProjectProgress {
  totalTasks: number;
  completionPercent: number;
  done: number;
  processing: number;
  waitReview: number;
  pending: number;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  avatar?: string;
  team: Team;
  task: Task[];
  schedules: Schedule[];
  useCaseUrl?: string;
  progress?: ProjectProgress;
}

// ─── SSE Generate Gantt Types ───────────────────────────────────────────────

export interface SSEScheduleItem {
  id: number;
  name: string;
  description?: string;
  startDate: number;
  endDate: number;
  status: string;
  color: string;
  projectId: number;
  sortOrder: number;
}

export interface SSETaskItem {
  id: number;
  title: string;
  description?: string;
  status: string;
  type: string;
  priority: string;
  startDate: number;
  dueDate: number;
  duration: number | null;
  estimateEffort: number;
  scheduleId: number;
  projectId: number;
  sortOrder: number;
}

export type SSEEventMap =
  | { event: 'phase_start'; data: { message: string } }
  | { event: 'schedules_done'; data: { schedules: SSEScheduleItem[]; total: number } }
  | { event: 'task_progress'; data: { scheduleIndex: number; scheduleName: string; totalSchedules: number; status: string } }
  | { event: 'task_done'; data: { scheduleIndex: number; scheduleName: string; tasksCreated: number; tasks: SSETaskItem[] } }
  | { event: 'task_error'; data: { scheduleIndex: number; scheduleName: string; error: string } }
  | { event: 'complete'; data: { totalSchedules: number; totalTasks: number } }
  | { event: 'error'; data: { message: string } }
