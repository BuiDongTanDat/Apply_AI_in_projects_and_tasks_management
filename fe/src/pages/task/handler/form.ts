import { TaskStatus } from "@/types/task.type";
import z from "zod";

const todoItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  isCompleted: z.boolean(),
});

const createTaskSchema = z.object({
  title: z.string().min(1, "Please enter a title"),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  dueDate: z.number().min(0).optional(),
  estimateEffort: z.number({ message: "Please enter effort in hours" }).min(0).default(0),
  priority: z.string().optional(),
  assigneeId: z.number().optional().nullable(),
  reviewerId: z.number().optional().nullable(),
  parentTaskId: z.string().optional(),
  actualEffort: z.number().min(0).default(0).optional(),
  score: z.number().min(0).max(10).optional(),
  completedPercent: z.number().min(0).max(100).optional(),
  projectId: z.number().min(1, "Please select a project").optional(),
  qcNote: z.string().optional(),
  todos: z.array(todoItemSchema).optional(),
});

const updateTaskSchema = createTaskSchema.extend({
  completePercent: z.number().min(0).max(100).optional(),
  completeAt: z.number().min(0).optional(),
});

type CreateTaskForm = z.input<typeof createTaskSchema>;
type UpdateTaskForm = z.input<typeof updateTaskSchema>;

export { createTaskSchema, updateTaskSchema };
export type { CreateTaskForm, UpdateTaskForm };
