import { Task, TaskStatusLabels, TaskPriorityLabels } from "@/types/task.type";
import { Sparkles, Clock, User, Calendar } from "lucide-react";
import dayjs from "dayjs";

interface SuggestedTasksSectionProps {
  tasks: Task[];
  loading: boolean;
}

export const SuggestedTasksSection = ({
  tasks,
  loading,
}: SuggestedTasksSectionProps) => {
  if (loading) {
    return (
      <div className="suggested-tasks-section loading">
        <div className="section-header">
          <div className="header-title">
            <h2>Today's suggested tasks</h2>
          </div>
          <span className="loading-text">AI is analyzing...</span>
        </div>
        <div className="tasks-loading">
          {[1, 2, 3].map((i) => (
            <div key={i} className="task-skeleton">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-desc"></div>
              <div className="skeleton-tags">
                <div className="skeleton-tag"></div>
                <div className="skeleton-tag"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="suggested-tasks-section empty">
        <div className="empty-state">
          <p>No tasks suggested for today</p>
        </div>
      </div>
    );
  }

  return (
    <div className="suggested-tasks-section">
      <div className="tasks-grid">
        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <div className="task-header">
              <h3 className="task-title">{task.title}</h3>
              {task.priority && (
                <span
                  className={`priority-badge ${TaskPriorityLabels[task.priority as keyof typeof TaskPriorityLabels]?.bgColor} ${TaskPriorityLabels[task.priority as keyof typeof TaskPriorityLabels]?.color}`}
                >
                  {
                    TaskPriorityLabels[
                      task.priority as keyof typeof TaskPriorityLabels
                    ]?.label
                  }
                </span>
              )}
            </div>

            {task.description && (
              <p className="task-description">{task.description}</p>
            )}

            <div className="task-meta">
              <div className="meta-item">
                <Clock size={14} />
                <span>{task.estimateEffort}</span>
              </div>

              {task.assignee && (
                <div className="meta-item">
                  <User size={14} />
                  <span>{task.assignee.name || task.assignee.email}</span>
                </div>
              )}

              {task.dueDate && (
                <div className="meta-item">
                  <Calendar size={14} />
                  <span>{dayjs.unix(task.dueDate).format("DD/MM/YYYY")}</span>
                </div>
              )}
            </div>

            <div className="task-footer">
              <span
                className={`status-badge ${TaskStatusLabels[task.status]?.bgColor} ${TaskStatusLabels[task.status]?.color}`}
              >
                {TaskStatusLabels[task.status]?.label}
              </span>
              {task.project && (
                <span className="project-name">{task.project.name}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
