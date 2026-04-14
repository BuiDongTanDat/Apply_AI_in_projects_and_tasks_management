import { ProjectProgress } from "@/types/project.type";

interface Props {
  progress?: ProjectProgress;
}

export const ProgressDashboardSection = ({ progress }: Props) => {
  const pct = progress?.completionPercent ?? 0;

  const cards = [
    { label: "Done",        count: progress?.done        ?? 0, color: "#10b981" },
    { label: "Processing",  count: progress?.processing  ?? 0, color: "#3b82f6" },
    { label: "Wait Review", count: progress?.waitReview  ?? 0, color: "#f59e0b" },
    { label: "Pending",     count: progress?.pending      ?? 0, color: "#94a3b8" },
  ];

  return (
    <div className="detail-section progress-section">
      <div className="section-header">
        <h2>Dashboard tiến độ</h2>
      </div>
      <div className="section-content">
        <div className="progress-overview">
          <div className="progress-circle-wrapper">
            <svg viewBox="0 0 120 120" className="progress-circle">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 327} 327`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="progress-text">
              <span className="progress-percent">{pct}%</span>
              <span className="progress-label">Hoàn thành</span>
            </div>
          </div>
        </div>

        <div className="status-cards">
          {cards.map((c) => (
            <div className="status-card" key={c.label}>
              <span className="status-count" style={{ color: c.color }}>{c.count}</span>
              <span className="status-label">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
