import { Schedule, ScheduleStatus } from "@/types/schedule.type";
import { useRef, useMemo, useState } from "react";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  PauseCircle,
  Circle,
} from "lucide-react";
import {
  ScheduleDetailModal,
  ScheduleDetailModalRef,
} from "./ScheduleDetailModal";
import dayjs from "dayjs";

interface Props {
  schedules: Schedule[];
  projectId: number;
  fetch: () => void;
}

const STATUS_CONFIG: Record<
  ScheduleStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  [ScheduleStatus.COMPLETED]: {
    label: "Completed",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    icon: <CheckCircle2 size={12} />,
  },
  [ScheduleStatus.ACTIVE]: {
    label: "Active",
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.12)",
    icon: <Clock3 size={12} />,
  },
  [ScheduleStatus.ON_HOLD]: {
    label: "On Hold",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
    icon: <PauseCircle size={12} />,
  },
  [ScheduleStatus.PLANNED]: {
    label: "Planned",
    color: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.12)",
    icon: <Circle size={12} />,
  },
};

// Custom tooltip for each bar
const TooltipContent: React.FC<{
  task: GanttTask;
  fontSize: string;
  fontFamily: string;
}> = ({ task }) => {
  return (
    <div className="gantt-tooltip">
      <div className="gantt-tooltip__name">{task.name}</div>
      <div className="gantt-tooltip__row">
        <span>Start:</span>
        <span>{dayjs(task.start).format("DD/MM/YYYY")}</span>
      </div>
      <div className="gantt-tooltip__row">
        <span>End:</span>
        <span>{dayjs(task.end).format("DD/MM/YYYY")}</span>
      </div>
      <div className="gantt-tooltip__row">
        <span>Progress:</span>
        <span>{task.progress}%</span>
      </div>
    </div>
  );
};

// ── Custom task-list header ────────────────────────────────────────────
const COL_NAME = 160;
const COL_DATE = 90; // From & To
const ROW_H = 46;
const FONT = "11px";
const HEADER_H = 50;

const CustomHeader: React.FC<{
  headerHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
}> = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      height: HEADER_H,
      borderBottom: "2px solid #e5e7eb",
      background: "#f8fafc",
      fontSize: FONT,
      fontWeight: 700,
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.4px",
    }}
  >
    <div style={{ width: COL_NAME, padding: "0 12px", flexShrink: 0 }}>
      Name
    </div>
    <div
      style={{
        width: COL_DATE,
        padding: "0 8px",
        flexShrink: 0,
        borderLeft: "1px solid #e5e7eb",
      }}
    >
      From
    </div>
    <div
      style={{
        width: COL_DATE,
        padding: "0 8px",
        flexShrink: 0,
        borderLeft: "1px solid #e5e7eb",
      }}
    >
      To
    </div>
  </div>
);

// ── Custom task-list table ────────────────────────────────────────────
const CustomTable: React.FC<{
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  tasks: GanttTask[];
  selectedTaskId: string;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: GanttTask) => void;
}> = ({ tasks, selectedTaskId, setSelectedTask }) => (
  <div>
    {tasks.map((t) => (
      <div
        key={t.id}
        onClick={() => setSelectedTask(t.id)}
        style={{
          display: "flex",
          alignItems: "center",
          height: ROW_H,
          fontSize: FONT,
          color: "#374151",
          borderBottom: "1px solid #f3f4f6",
          background: t.id === selectedTaskId ? "#eff6ff" : "transparent",
          cursor: "pointer",
          transition: "background 0.12s",
        }}
      >
        <div
          style={{
            width: COL_NAME,
            padding: "0 12px",
            flexShrink: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontWeight: 500,
          }}
          title={t.name}
        >
          {t.name}
        </div>
        <div
          style={{
            width: COL_DATE,
            padding: "0 8px",
            flexShrink: 0,
            borderLeft: "1px solid #f3f4f6",
            color: "#6b7280",
          }}
        >
          {dayjs(t.start).format("DD/MM/YYYY")}
        </div>
        <div
          style={{
            width: COL_DATE,
            padding: "0 8px",
            flexShrink: 0,
            borderLeft: "1px solid #f3f4f6",
            color: "#6b7280",
          }}
        >
          {dayjs(t.end).format("DD/MM/YYYY")}
        </div>
      </div>
    ))}
  </div>
);

export const GanttChartSection = ({ schedules, projectId, fetch }: Props) => {
  const modalRef = useRef<ScheduleDetailModalRef>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);

  // Map schedules → GanttTask[]
  const ganttTasks: GanttTask[] = useMemo(() => {
    return schedules
      .filter((s) => s.startDate && s.endDate)
      .map((s) => {
        const cfg =
          STATUS_CONFIG[s.status] ?? STATUS_CONFIG[ScheduleStatus.PLANNED];
        const barColor = cfg.color;

        const start = dayjs.unix(s.startDate).toDate();
        let end = dayjs.unix(s.endDate).toDate();
        if (end <= start) {
          end = dayjs.unix(s.startDate).add(1, "day").toDate();
        }

        return {
          id: String(s.id),
          name: s.name,
          start,
          end,
          progress: Math.min(s.progress ?? 0, 100),
          type: "task",
          styles: {
            backgroundColor: barColor,
            backgroundSelectedColor: barColor,
            progressColor: `${barColor}99`,
            progressSelectedColor: `${barColor}bb`,
          },
        };
      });
  }, [schedules]);

  // Map library Task id back to original Schedule
  const scheduleById = useMemo(() => {
    const map = new Map<string, Schedule>();
    schedules.forEach((s) => map.set(String(s.id), s));
    return map;
  }, [schedules]);

  const handleClick = (task: GanttTask) => {
    const original = scheduleById.get(task.id);
    if (original) modalRef.current?.open(original, projectId);
  };

  if (!ganttTasks.length) {
    return (
      <div className="detail-section gantt-section">
        <div className="section-header">
          <h2>
            <CalendarDays size={18} className="section-icon" />
            Sprint / Timeline
          </h2>
        </div>
        <div className="section-content empty-gantt">
          <CalendarDays size={40} strokeWidth={1} className="empty-icon" />
          <p>No sprints scheduled yet</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="detail-section gantt-section">
        <div className="section-header">
          <h2>
            <CalendarDays size={18} className="section-icon" />
            Sprint / Timeline
          </h2>
          <div className="gantt-controls">
            <span className="sprint-count">{ganttTasks.length} sprints</span>
            <div className="view-mode-tabs">
              {(
                [ViewMode.Day, ViewMode.Week, ViewMode.Month] as ViewMode[]
              ).map((mode) => (
                <button
                  key={mode}
                  className={`view-mode-btn${viewMode === mode ? " active" : ""}`}
                  onClick={() => setViewMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="section-content gantt-lib-wrapper">
          <Gantt
            tasks={ganttTasks}
            viewMode={viewMode}
            onClick={handleClick}
            listCellWidth={`${COL_DATE}px`}
            columnWidth={
              viewMode === ViewMode.Month
                ? 160
                : viewMode === ViewMode.Week
                  ? 120
                  : 60
            }
            rowHeight={ROW_H}
            barCornerRadius={6}
            barFill={72}
            headerHeight={HEADER_H}
            ganttHeight={Math.min(ganttTasks.length * ROW_H + HEADER_H, 480)}
            todayColor="rgba(239, 68, 68, 0.12)"
            fontFamily="Inter, -apple-system, sans-serif"
            fontSize={FONT}
            TooltipContent={TooltipContent}
            locale="en-GB"
            TaskListHeader={CustomHeader}
            TaskListTable={CustomTable}
          />

          {/* Legend */}
          <div className="gantt-legend">
            {(Object.values(ScheduleStatus) as ScheduleStatus[]).map(
              (status) => {
                const cfg = STATUS_CONFIG[status];
                return (
                  <span key={status} className="legend-item">
                    <span
                      className="legend-dot"
                      style={{ background: cfg.color }}
                    />
                    <span className="legend-icon" style={{ color: cfg.color }}>
                      {cfg.icon}
                    </span>
                    {cfg.label}
                  </span>
                );
              },
            )}
          </div>
        </div>
      </div>

      <ScheduleDetailModal onClose={() => {
        fetch();
      }} ref={modalRef} />
    </>
  );
};
