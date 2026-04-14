import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { taskApi } from "@/api/task.api";
import type {
  PerformanceDashboardMetadata,
  PerformanceDashboardUserRow,
} from "@/types/performance.type";
import { alert } from "@/provider/AlertService";
import PerformanceAiReviewModal from "./PerformanceAiReview.modal";
import { DatePicker } from "antd";

function rateBadgeClass(rate: number) {
  if (!Number.isFinite(rate)) return "bg-gray-100 text-gray-600";
  if (rate >= 85) return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  if (rate >= 60) return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  return "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
}

function fmtPct(v: number) {
  if (Number.isFinite(v)) return `${Math.round(v * 100) / 100}%`;
  return "-";
}

function fmtNum(v: number) {
  if (Number.isFinite(v)) return String(Math.round(v * 100) / 100);
  return "-";
}

interface Props {
  teamId: number;
}

export default function TeamPerformance({ teamId }: Props) {
  const today = useMemo(() => dayjs(), []);
  const firstDayOfMonth = useMemo(() => dayjs().startOf("month"), []);

  const [fromDate, setFromDate] = useState(firstDayOfMonth);
  const [toDate, setToDate] = useState(today);

  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<PerformanceDashboardMetadata | null>(null);

  const fromAt = useMemo(() => fromDate.startOf("day").unix(), [fromDate]);
  const toAt = useMemo(() => toDate.endOf("day").unix(), [toDate]);

  const [aiOpen, setAiOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    userId: number;
    userName?: string;
  } | null>(null);

  const fetchDashboard = async () => {
    if (!teamId) return;
    if (fromAt > toAt) {
      alert("Invalid date range: from date must be before to date.", "Warning", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await taskApi.getPerformanceDashboard({
        teamId,
        fromAt,
        toAt,
      });
      setDashboard(res.metadata);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Load performance failed";
      alert(msg, "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, fromAt, toAt]);

  const rows = useMemo<PerformanceDashboardUserRow[]>(() => dashboard?.users ?? [], [dashboard]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white border border-[#e8edf2] rounded-xl p-6 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-blue-200/40 via-indigo-200/20 to-transparent blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-200/40 via-cyan-200/20 to-transparent blur-2xl" />
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                Team performance
              </div>
              <div className="mt-1 text-base font-semibold text-gray-900">
                Dashboard
              </div>
              <div className="mt-1 text-xs text-gray-400">
                Select a period to calculate metrics and review members with AI.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-gray-500">From</label>
                  <DatePicker
                    picker="date"
                    value={fromDate}
                    format="DD/MM/YYYY"
                    className="h-9 !rounded-lg"
                    onChange={(date) => {
                      setFromDate(date ?? firstDayOfMonth);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-gray-500">To</label>
                  <DatePicker
                    picker="date"
                    value={toDate}
                    format="DD/MM/YYYY"
                    className="h-9 !rounded-lg"
                    onChange={(date) => {
                      setToDate(date ?? today);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {dashboard?.totals && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-gray-100 bg-white/70 backdrop-blur px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Tasks
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-semibold text-gray-900">
                    {dashboard.totals.totalTasks}
                  </span>
                  <span className="text-xs text-gray-400">total</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white/70 backdrop-blur px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Completion
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-semibold text-gray-900">
                    {fmtPct(dashboard.totals.completionRate)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({dashboard.totals.completedTasks}/{dashboard.totals.totalTasks})
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    style={{
                      width: `${Math.max(0, Math.min(100, dashboard.totals.completionRate ?? 0))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white/70 backdrop-blur px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  On-time completion
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-semibold text-gray-900">
                    {fmtPct(dashboard.totals.onTimeCompletionRate)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({dashboard.totals.onTimeCompletedTasks}/{dashboard.totals.completedTasks})
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, dashboard.totals.onTimeCompletionRate ?? 0),
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-[#e8edf2] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f1f5f9] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Members</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {rows.length} {rows.length === 1 ? "person" : "people"} in this period
              </p>
            </div>
            {dashboard?.totals && (
              <div className="hidden md:flex items-center gap-3 text-xs text-gray-500">
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  Total tasks: <span className="font-semibold text-gray-900">{dashboard.totals.totalTasks}</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  Completed: <span className="font-semibold text-gray-900">{dashboard.totals.completedTasks}</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                  Completion: <span className="font-semibold text-gray-900">{fmtPct(dashboard.totals.completionRate)}</span>
                </span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f1f5f9] bg-[#fafafa]">
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Member
                  </th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Total
                  </th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Completed
                  </th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Completion
                  </th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    On-time
                  </th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Story points
                  </th>
                  <th className="px-6 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((r, idx) => (
                    <tr
                      key={r.user.id}
                      className={`border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors ${
                        idx % 2 === 0 ? "" : "bg-[#fdfeff]"
                      }`}
                    >
                      <td className="px-6 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            {r.user.name || "Unknown"}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            {r.user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {fmtNum(r.metrics.totalTasks)}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {fmtNum(r.metrics.completedTasks)}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${rateBadgeClass(
                            r.metrics.completionRate,
                          )}`}
                        >
                          {fmtPct(r.metrics.completionRate)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${rateBadgeClass(
                            r.metrics.onTimeCompletionRate,
                          )}`}
                        >
                          {fmtPct(r.metrics.onTimeCompletionRate)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        <span className="text-xs text-gray-400 mr-1">
                          {fmtNum(r.metrics.storyPointsAchieved)}
                        </span>
                        / {fmtNum(r.metrics.totalStoryPoints)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser({
                              userId: r.user.id,
                              userName: r.user.name ?? undefined,
                            });
                            setAiOpen(true);
                          }}
                          className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold
                            text-indigo-700 bg-indigo-50 ring-1 ring-indigo-100
                            hover:bg-indigo-600 hover:text-white hover:ring-indigo-600
                            transition-colors"
                        >
                          AI review
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-sm text-gray-500 ring-1 ring-gray-100">
                        No data for this period.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PerformanceAiReviewModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        teamId={teamId}
        userId={selectedUser?.userId ?? null}
        userName={selectedUser?.userName}
        fromAt={fromAt}
        toAt={toAt}
      />
    </div>
  );
}

