import { useEffect, useState } from "react";
import { Select, Pagination } from "antd";
import {
  ThumbsUp,
  ThumbsDown,
  Clock,
  TrendingUp,
  Zap,
  Filter,
  BarChart3,
} from "lucide-react";
import { aiFeedbackApi } from "@/api/ai-feedback.api";
import { projectApi } from "@/api/project.api";
import {
  AiFeedback,
  AiFeedbackByAction,
  AiFeedbackQuery,
  AiFeedbackSummary,
  AiActionType,
  AiActionTypeLabels,
  FeedbackValue,
  FeedbackStatus,
} from "@/types/ai-feedback.type";
import { Project } from "@/types/project.type";
import "../AdminLayout.scss";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pct = (n: number) => `${Math.round(n * 100)}%`;

const feedbackColor = (f: FeedbackValue | null) =>
  f === FeedbackValue.Positive
    ? "#22c55e"
    : f === FeedbackValue.Negative
      ? "#ef4444"
      : "#9ca3af";

const statusBadge = (s: FeedbackStatus) => {
  const map: Record<FeedbackStatus, { bg: string; color: string }> = {
    pending: { bg: "#fef9c3", color: "#854d0e" },
    resolved: { bg: "#dcfce7", color: "#166534" },
    expired: { bg: "#f3f4f6", color: "#6b7280" },
  };
  const style = map[s] ?? { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span
      style={{
        ...style,
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 999,
        fontWeight: 600,
      }}
    >
      {s}
    </span>
  );
};

// ─── Summary Cards ────────────────────────────────────────────────────────────

const Card = ({
  icon,
  label,
  value,
  sub,
  color = "#6366f1",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "18px 22px",
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: color + "18",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color,
      }}
    >
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{sub}</p>}
    </div>
  </div>
);

// ─── Acceptance Rate Bar ──────────────────────────────────────────────────────

const RateBar = ({ row }: { row: AiFeedbackByAction }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 0",
      borderBottom: "1px solid #f3f4f6",
    }}
  >
    <span style={{ width: 160, fontSize: 12, color: "#374151", flexShrink: 0 }}>
      {AiActionTypeLabels[row.actionType] ?? row.actionType}
    </span>
    <div
      style={{
        flex: 1,
        height: 8,
        background: "#f3f4f6",
        borderRadius: 99,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: pct(row.acceptanceRate),
          background:
            row.acceptanceRate >= 0.7
              ? "#22c55e"
              : row.acceptanceRate >= 0.5
                ? "#f59e0b"
                : "#ef4444",
          borderRadius: 99,
          transition: "width 0.5s ease",
        }}
      />
    </div>
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "#374151",
        width: 38,
        textAlign: "right",
      }}
    >
      {pct(row.acceptanceRate)}
    </span>
    <span style={{ fontSize: 11, color: "#9ca3af", width: 60, textAlign: "right" }}>
      {row.total} total
    </span>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const AiFeedbackDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [summary, setSummary] = useState<AiFeedbackSummary | null>(null);
  const [feedbacks, setFeedbacks] = useState<AiFeedback[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [query, setQuery] = useState<AiFeedbackQuery>({ page: 1, limit: 10 });

  // Fetch project list once
  useEffect(() => {
    projectApi
      .findAll({ page: 1, limit: 100 })
      .then((res) => {
        setProjects(res.data?.metadata ?? []);
      })
      .catch(console.error);
  }, []);

  // Fetch summary when project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    setLoadingSummary(true);
    aiFeedbackApi
      .getProjectSummary(selectedProjectId)
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoadingSummary(false));
  }, [selectedProjectId]);

  // Fetch feedback list
  useEffect(() => {
    const q: AiFeedbackQuery = {
      ...query,
      projectId: selectedProjectId ?? undefined,
    };
    setLoadingList(true);
    aiFeedbackApi
      .findAll(q)
      .then((res) => {
        setFeedbacks(res.feedbacks ?? []);
        setTotal(res.page?.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoadingList(false));
  }, [query, selectedProjectId]);

  const updateFilter = (patch: Partial<AiFeedbackQuery>) => {
    setQuery((prev) => ({ ...prev, ...patch, page: 1 }));
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <h1
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <BarChart3 size={20} />
          AI Feedback Insights
        </h1>
      </div>

      {/* Project Selector */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>
          Select Project
        </label>
        <Select
          style={{ width: 280 }}
          placeholder="Select a project to view summary..."
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
          onChange={(val) => setSelectedProjectId(val)}
          allowClear
          onClear={() => setSelectedProjectId(null)}
        />
      </div>

      {/* Summary Cards */}
      {selectedProjectId && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 28,
            opacity: loadingSummary ? 0.5 : 1,
            transition: "opacity 0.3s",
          }}
        >
          <Card
            icon={<Zap size={18} />}
            label="Total Suggestions"
            value={summary?.totalSuggestions ?? "—"}
            sub={`${summary?.resolvedCount ?? 0} resolved`}
            color="#6366f1"
          />
          <Card
            icon={<ThumbsUp size={18} />}
            label="Positive"
            value={summary?.positiveCount ?? "—"}
            color="#22c55e"
          />
          <Card
            icon={<ThumbsDown size={18} />}
            label="Negative"
            value={summary?.negativeCount ?? "—"}
            color="#ef4444"
          />
          <Card
            icon={<TrendingUp size={18} />}
            label="Acceptance Rate"
            value={
              summary?.overallAcceptanceRate != null
                ? pct(summary.overallAcceptanceRate)
                : "—"
            }
            sub="positive / resolved"
            color="#f59e0b"
          />
        </div>
      )}

      {/* By Action Type Breakdown */}
      {selectedProjectId && summary && summary.byActionType.length > 0 && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <div style={{ padding: "14px 20px 0" }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: 0 }}>
              Acceptance Rate by Feature
            </h3>
          </div>
          <div style={{ padding: "12px 20px 16px" }}>
            {summary.byActionType.map((row) => (
              <RateBar key={row.actionType} row={row} />
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Filter size={14} style={{ color: "#9ca3af" }} />
        <Select
          style={{ width: 160 }}
          placeholder="Feedback"
          allowClear
          options={[
            { value: FeedbackValue.Positive, label: "👍 Positive" },
            { value: FeedbackValue.Negative, label: "👎 Negative" },
          ]}
          onChange={(val) => updateFilter({ feedback: val })}
        />
        <Select
          style={{ width: 160 }}
          placeholder="Status"
          allowClear
          options={[
            { value: FeedbackStatus.Pending, label: "Pending" },
            { value: FeedbackStatus.Resolved, label: "Resolved" },
            { value: FeedbackStatus.Expired, label: "Expired" },
          ]}
          onChange={(val) => updateFilter({ status: val })}
        />
        <Select
          style={{ width: 200 }}
          placeholder="Action type"
          allowClear
          options={Object.values(AiActionType).map((v) => ({
            value: v,
            label: AiActionTypeLabels[v],
          }))}
          onChange={(val) => updateFilter({ actionType: val })}
        />
      </div>

      {/* Table */}
      <div className="admin-card">
        {loadingList ? (
          <div className="admin-loading">Loading...</div>
        ) : feedbacks.length === 0 ? (
          <div className="admin-empty">
            <BarChart3 size={36} />
            <p>No feedback records found.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Action</th>
                <th>Feedback</th>
                <th>Status</th>
                <th>Suggested</th>
                <th>Actual</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb) => (
                <tr key={fb.id}>
                  <td style={{ color: "#9ca3af", fontSize: 13 }}>#{fb.id}</td>
                  <td style={{ fontSize: 12, color: "#374151" }}>
                    {AiActionTypeLabels[fb.actionType] ?? fb.actionType}
                  </td>
                  <td>
                    {fb.feedback ? (
                      <span
                        style={{
                          color: feedbackColor(fb.feedback),
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {fb.feedback === FeedbackValue.Positive ? "👍 Positive" : "👎 Negative"}
                      </span>
                    ) : (
                      <span style={{ color: "#d1d5db", fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td>{statusBadge(fb.status)}</td>
                  <td style={{ fontSize: 11, color: "#6b7280", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {fb.suggestedValue ? JSON.stringify(fb.suggestedValue) : "—"}
                  </td>
                  <td style={{ fontSize: 11, color: "#6b7280" }}>
                    {fb.actualValue ? JSON.stringify(fb.actualValue) : "—"}
                  </td>
                  <td style={{ fontSize: 11, color: "#6b7280", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {fb.comment ?? "—"}
                  </td>
                  <td style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={11} />
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {total > (query.limit ?? 10) && (
          <div style={{ padding: "16px 20px", display: "flex", justifyContent: "flex-end" }}>
            <Pagination
              current={query.page ?? 1}
              pageSize={query.limit ?? 10}
              total={total}
              onChange={(page, pageSize) =>
                setQuery((prev) => ({ ...prev, page, limit: pageSize }))
              }
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AiFeedbackDashboard;
