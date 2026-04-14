import React, { useImperativeHandle, useRef, useState } from "react";
import { Modal, Spin, Tag, Empty, Select, message } from "antd";
import dayjs from "dayjs";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  PauseCircle,
  Circle,
  ListChecks,
  Info,
  Hash,
  Activity,
} from "lucide-react";
import { Schedule, ScheduleStatus } from "@/types/schedule.type";
import { Task, TaskPriority, TaskStatus } from "@/types/task.type";
import { scheduleApi } from "@/api/schedule.api";
import CreateTaskModal, { CreateTaskModalRef } from "@/pages/task/components/TaskModal";
import { taskApi } from "@/api/task.api";
import "./ScheduleDetailModal.scss";

export interface ScheduleDetailModalRef {
  open: (schedule: Schedule, projectId: number) => void;
}

const STATUS_CONFIG: Record<
  ScheduleStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  [ScheduleStatus.COMPLETED]: {
    label: "Completed",
    color: "#10b981",
    bg: "#d1fae5",
    icon: <CheckCircle2 size={13} />,
  },
  [ScheduleStatus.ACTIVE]: {
    label: "Active",
    color: "#3b82f6",
    bg: "#dbeafe",
    icon: <Clock3 size={13} />,
  },
  [ScheduleStatus.ON_HOLD]: {
    label: "On Hold",
    color: "#f59e0b",
    bg: "#fef3c7",
    icon: <PauseCircle size={13} />,
  },
  [ScheduleStatus.PLANNED]: {
    label: "Planned",
    color: "#94a3b8",
    bg: "#f1f5f9",
    icon: <Circle size={13} />,
  },
};

const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> =
  {
    [TaskStatus.Pending]: { label: "Pending", color: "default" },
    [TaskStatus.Processing]: { label: "Processing", color: "blue" },
    [TaskStatus.WaitReview]: { label: "In Review", color: "orange" },
    [TaskStatus.Done]: { label: "Done", color: "green" },
  };

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> =
  {
    [TaskPriority.Low]: { label: "Low", color: "green" },
    [TaskPriority.Medium]: { label: "Medium", color: "gold" },
    [TaskPriority.High]: { label: "High", color: "orange" },
    [TaskPriority.Urgent]: { label: "Urgent", color: "red" },
  };

interface ScheduleDetail extends Schedule {
  tasks?: Task[];
}

interface ScheduleDetailModalProps {
  onClose: () => void;
}

export const ScheduleDetailModal = React.forwardRef<
  ScheduleDetailModalRef,
  ScheduleDetailModalProps
>(({ onClose }: ScheduleDetailModalProps, ref) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [schedule, setSchedule] = useState<ScheduleDetail | null>(null);
    const [projectId, setProjectId] = useState<number | null>(null);
    const [statusSaving, setStatusSaving] = useState(false);
    const [taskOpeningId, setTaskOpeningId] = useState<number | null>(null);
    const taskModalRef = useRef<CreateTaskModalRef>(null);

    useImperativeHandle(ref, () => ({
      open(s: Schedule, projectId: number) {
        setSchedule(s);
        setProjectId(projectId);
        setVisible(true);
        fetchDetail(projectId, s.id);
      },
    }));

    const fetchDetail = async (projectId: number, id: number) => {
      setLoading(true);
      try {
        const res = await scheduleApi.getOne(projectId, id);
        setSchedule(res?.metadata ?? res);
      } catch (e) {
        console.error("Failed to fetch schedule detail", e);
      } finally {
        setLoading(false);
      }
    };

    const handleStatusChange = async (nextStatus: ScheduleStatus) => {
      if (!schedule || !projectId || schedule.status === nextStatus) return;

      setStatusSaving(true);
      try {
        const res = await scheduleApi.update(projectId, schedule.id, {
          status: nextStatus,
        });
        const updated = res?.metadata ?? res;
        setSchedule((prev) =>
          prev ? { ...prev, ...(updated as ScheduleDetail) } : (updated as ScheduleDetail),
        );
        message.success("Cập nhật trạng thái sprint thành công");
      } catch (e) {
        console.error("Failed to update schedule status", e);
        message.error("Cập nhật trạng thái sprint thất bại");
      } finally {
        setStatusSaving(false);
      }
    };

    const handleClose = () => {
      setVisible(false);
      setSchedule(null);
      onClose?.();
    };

    const handleOpenTaskDetail = async (taskId: number) => {
      setTaskOpeningId(taskId);
      try {
        const res = await taskApi.getById(String(taskId));
        const taskDetail = (res?.metadata ?? res) as Task;
        if (!taskDetail) {
          message.error("Không tìm thấy thông tin task");
          return;
        }
        taskModalRef.current?.update(taskDetail);
      } catch (e) {
        console.error("Failed to fetch task detail", e);
        message.error("Không thể tải chi tiết task");
      } finally {
        setTaskOpeningId(null);
      }
    };

    const cfg = schedule ? STATUS_CONFIG[schedule.status] : null;
    const barColor = schedule?.color || cfg?.color || "#94a3b8";

    return (
      <>
      <Modal
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={720}
        centered
        destroyOnHidden
        className="schedule-detail-modal"
        title={
          <div className="sdm__title">
            <span
              className="sdm__title-dot"
              style={{ backgroundColor: barColor }}
            />
            <span className="sdm__title-text">
              {schedule?.name ?? "Sprint Detail"}
            </span>
            {cfg && (
              <span
                className="sdm__title-badge"
                style={{ color: cfg.color, background: cfg.bg }}
              >
                {cfg.icon}
                {cfg.label}
              </span>
            )}
          </div>
        }
      >
        {loading ? (
          <div className="sdm__loading">
            <Spin size="large" />
          </div>
        ) : schedule ? (
          <div className="sdm__body">
            {/* Section 1: Info */}
            <div className="sdm__section">
              <div className="sdm__section-header">
                <Info size={15} />
                <span>General Information</span>
              </div>
              <div className="sdm__info-grid">
                <div className="sdm__info-item">
                  <CalendarDays size={14} className="sdm__info-icon" />
                  <div>
                    <p className="sdm__info-label">Start Date</p>
                    <p className="sdm__info-value">
                      {schedule.startDate
                        ? dayjs.unix(schedule.startDate).format("DD/MM/YYYY")
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="sdm__info-item">
                  <CalendarDays size={14} className="sdm__info-icon" />
                  <div>
                    <p className="sdm__info-label">End Date</p>
                    <p className="sdm__info-value">
                      {schedule.endDate
                        ? dayjs.unix(schedule.endDate).format("DD/MM/YYYY")
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="sdm__info-item">
                  <Activity size={14} className="sdm__info-icon" />
                  <div>
                    <p className="sdm__info-label">Progress</p>
                    <div className="sdm__progress-row">
                      <div className="sdm__progress-bar">
                        <div
                          className="sdm__progress-fill"
                          style={{
                            width: `${Math.min(schedule.progress ?? 0, 100)}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                      <span className="sdm__progress-pct">
                        {schedule.progress ?? 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sdm__info-item">
                  <Hash size={14} className="sdm__info-icon" />
                  <div>
                    <p className="sdm__info-label">Tasks</p>
                    <p className="sdm__info-value">
                      {schedule.completedTaskCount ?? 0} /{" "}
                      {schedule.taskCount ?? 0} completed
                    </p>
                  </div>
                </div>
                <div className="sdm__info-item">
                  <Activity size={14} className="sdm__info-icon" />
                  <div>
                    <p className="sdm__info-label">Status</p>
                    <Select
                      size="small"
                      value={schedule.status}
                      style={{ minWidth: 140 }}
                      disabled={statusSaving}
                      onChange={(value) =>
                        handleStatusChange(value as ScheduleStatus)
                      }
                      options={(
                        Object.values(ScheduleStatus) as ScheduleStatus[]
                      ).map((status) => {
                        const statusCfg = STATUS_CONFIG[status];
                        return {
                          value: status,
                          label: (
                            <span className="sdm__status-option">
                              <span
                                className="sdm__status-dot"
                                style={{ backgroundColor: statusCfg.color }}
                              />
                              <span>{statusCfg.label}</span>
                            </span>
                          ),
                        };
                      })}
                    />
                  </div>
                </div>
              </div>

              {schedule.description && (
                <div className="sdm__description">
                  <p className="sdm__info-label">Description</p>
                  <p className="sdm__description-text">
                    {schedule.description}
                  </p>
                </div>
              )}
            </div>

            {/* Section 2: Tasks */}
            <div className="sdm__section">
              <div className="sdm__section-header">
                <ListChecks size={15} />
                <span>
                  Tasks
                  {schedule.tasks?.length ? ` (${schedule.tasks.length})` : ""}
                </span>
              </div>

              {schedule.tasks && schedule.tasks.length > 0 ? (
                <div className="sdm__task-list">
                  {schedule.tasks.map((task) => {
                    const tStatus =
                      TASK_STATUS_CONFIG[task.status] ??
                      TASK_STATUS_CONFIG[TaskStatus.Pending];
                    const tPriority = task.priority
                      ? PRIORITY_CONFIG[task.priority]
                      : null;

                    return (
                      <div
                        key={task.id}
                        className="sdm__task-item"
                        onClick={() => handleOpenTaskDetail(task.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleOpenTaskDetail(task.id);
                          }
                        }}
                      >
                        <div className="sdm__task-left">
                          <span className="sdm__task-id">#{task.id}</span>
                          <span className="sdm__task-title">{task.title}</span>
                        </div>
                        <div className="sdm__task-right">
                          {tPriority && (
                            <Tag color={tPriority.color} className="sdm__tag">
                              {tPriority.label}
                            </Tag>
                          )}
                          <Tag color={tStatus.color} className="sdm__tag">
                            {tStatus.label}
                          </Tag>
                          {taskOpeningId === task.id && <Spin size="small" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No tasks in this sprint"
                  className="sdm__empty"
                />
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      <CreateTaskModal
        ref={taskModalRef}
        onSubmitOk={() => {
          if (projectId && schedule?.id) {
            fetchDetail(projectId, schedule.id);
          }
          onClose?.();
        }}
      />
      </>
    );
  },
);

ScheduleDetailModal.displayName = "ScheduleDetailModal";
