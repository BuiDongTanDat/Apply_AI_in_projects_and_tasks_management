import { Project } from "@/types/project.type";
import { TaskStatus } from "@/types/task.type";

interface Props {
  project: Project;
}

const LABEL_COLORS = ["#6366f1", "#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981"];

export const GeneralInfoSection = ({ project }: Props) => {
  const totalTasks = project.task?.length || project.progress?.totalTasks || 0;

  const statusKey =
    totalTasks === 0
      ? "empty"
      : project.task?.every((t) => t.status === TaskStatus.Done)
        ? "done"
        : "inProgress";

  const statusConfig = {
    empty:      { label: "Chưa có task",   dot: "#9ca3af" },
    done:       { label: "Hoàn thành",      dot: "#22c55e" },
    inProgress: { label: "Đang thực hiện", dot: "#3b82f6" },
  }[statusKey];

  const fields = [
    { label: "Tên dự án",    value: project.name || "—" },
    { label: "Mô tả",        value: project.description || "Chưa có mô tả" },
    { label: "Team",          value: project.team?.name || "—" },
    { label: "Tổng số task", value: String(totalTasks) },
    {
      label: "Trạng thái",
      value: (
        <span className="gi-status">
          <span className="gi-status__dot" style={{ background: statusConfig.dot }} />
          {statusConfig.label}
        </span>
      ),
    },
  ];

  return (
    <div className="detail-section general-info-section">
      <div className="section-header">
        <h2>Thông tin chung</h2>
      </div>
      <div className="section-content">
        <div className="gi-grid">
          {fields.map((f, i) => (
            <div key={i} className="gi-item">
              <span
                className="gi-item__label"
                style={{ color: LABEL_COLORS[i] }}
              >
                {f.label}
              </span>
              <span className="gi-item__value">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
