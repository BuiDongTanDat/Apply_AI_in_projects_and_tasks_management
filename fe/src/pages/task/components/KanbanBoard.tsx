import { Task, TaskStatus } from "@/types/task.type";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { taskApi } from "@/api/task.api";
import { alert } from "@/provider/AlertService";

interface KanbanBoardProps {
  tasks: Task[];
  loading: boolean;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onSendToQC?: (task: Task) => void;
  onQCReview?: (task: Task) => void;
  onRefresh: () => void;
}

export const KanbanBoard = ({
  tasks,
  loading,
  onUpdateTask,
  onDeleteTask,
  onSendToQC,
  onQCReview,
  onRefresh,
}: KanbanBoardProps) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const columns: TaskStatus[] = [
    TaskStatus.Pending,
    TaskStatus.Processing,
    TaskStatus.WaitReview,
    TaskStatus.Done,
  ];

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Add visual feedback during drag
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as number;
    let newStatus = over.id as TaskStatus;

    // If dropped over another task, get that task's status
    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask) {
      newStatus = overTask.status;
    }

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    try {
      //@ts-ignore
      await taskApi.update(taskId.toString(), { status: newStatus });
      alert("Status updated successfully!", "Success", "success");
      onRefresh();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Could not update status";
      console.error("Error updating task status:", error);
      alert(`Error: ${errorMsg}`, "Update Failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={getTasksByStatus(status)}
            onEditTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onSendToQC={onSendToQC}
            onQCReview={onQCReview}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3">
            <KanbanCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
