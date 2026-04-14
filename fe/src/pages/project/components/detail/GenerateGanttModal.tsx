import { useRef, useState, useCallback } from "react";
import { Modal } from "antd";
import {
  Upload,
  Sparkles,
  CheckCircle2,
  Loader2,
  Circle,
  AlertCircle,
  XCircle,
  FileText,
  RotateCcw,
} from "lucide-react";
import { projectApi } from "@/api/project.api";
import { SSEScheduleItem } from "@/types/project.type";
import "./GenerateGanttModal.scss";
import { Button } from "@/components/element/button";

// ─── State shapes ─────────────────────────────────────────────────────────────
type GenerateStatus = "idle" | "analyzing" | "generating" | "complete" | "error";

interface ScheduleProgress {
  id?: number;
  name: string;
  status: "pending" | "generating" | "done" | "error";
  tasksCreated?: number;
  error?: string;
  color?: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface GenerateGanttModalProps {
  open: boolean;
  projectId: number;
  onClose: () => void;
  onComplete: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const GenerateGanttModal = ({
  open,
  projectId,
  onClose,
  onComplete,
}: GenerateGanttModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [schedules, setSchedules] = useState<ScheduleProgress[]>([]);
  const [totalSchedules, setTotalSchedules] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [schedulesCompleted, setSchedulesCompleted] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Progress percentage ────────────────────────────────────────────────────
  const progressPercent =
    status === "analyzing"
      ? 15
      : status === "generating" && totalSchedules > 0
        ? Math.round(20 + (schedulesCompleted / totalSchedules) * 80)
        : status === "complete"
          ? 100
          : 0;

  // ── Reset all state ────────────────────────────────────────────────────────
  const resetState = useCallback(() => {
    setFile(null);
    setStatus("idle");
    setStatusMessage("");
    setSchedules([]);
    setTotalSchedules(0);
    setTotalTasks(0);
    setSchedulesCompleted(0);
    setErrorMessage("");
  }, []);

  const handleClose = () => {
    abortRef.current?.abort();
    resetState();
    onClose();
  };

  // ── File helpers ───────────────────────────────────────────────────────────
  const isValidFile = (f: File) =>
    /\.(pdf|doc|docx|txt)$/i.test(f.name);

  const handleFileSelect = (f: File) => {
    if (!isValidFile(f)) return;
    setFile(f);
    setStatus("idle");
    setErrorMessage("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) handleFileSelect(picked);
  };

  // ── Start generate ─────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!file) return;

    abortRef.current = new AbortController();
    setStatus("analyzing");
    setStatusMessage("Analyzing document...");
    setSchedules([]);
    setSchedulesCompleted(0);

    try {
      await projectApi.genProjectScheduleSSE(
        projectId,
        file,
        (sseEvent) => {
          switch (sseEvent.event) {
            case "phase_start":
              setStatusMessage(sseEvent.data.message ?? "Analyzing document...");
              break;

            case "schedules_done": {
              const items: ScheduleProgress[] = (
                sseEvent.data.schedules as SSEScheduleItem[]
              ).map((s) => ({
                id: s.id,
                name: s.name,
                status: "pending",
                color: s.color,
              }));
              setSchedules(items);
              setTotalSchedules(sseEvent.data.total);
              setStatus("generating");
              break;
            }

            case "task_progress":
              setSchedules((prev) =>
                prev.map((s, idx) =>
                  idx === sseEvent.data.scheduleIndex
                    ? { ...s, status: "generating" }
                    : s,
                ),
              );
              break;

            case "task_done":
              setSchedules((prev) =>
                prev.map((s, idx) =>
                  idx === sseEvent.data.scheduleIndex
                    ? {
                        ...s,
                        status: "done",
                        tasksCreated: sseEvent.data.tasksCreated,
                      }
                    : s,
                ),
              );
              setSchedulesCompleted((n) => n + 1);
              break;

            case "task_error":
              setSchedules((prev) =>
                prev.map((s, idx) =>
                  idx === sseEvent.data.scheduleIndex
                    ? { ...s, status: "error", error: sseEvent.data.error }
                    : s,
                ),
              );
              setSchedulesCompleted((n) => n + 1);
              break;

            case "complete":
              setTotalTasks(sseEvent.data.totalTasks);
              setStatus("complete");
              break;

            case "error":
              setErrorMessage(sseEvent.data.message);
              setStatus("error");
              break;
          }
        },
        abortRef.current.signal,
      );
    } catch (err: any) {
      if (err?.name === "AbortError") return; // user cancelled — ignore
      setErrorMessage(err?.message ?? "An unexpected error occurred.");
      setStatus("error");
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setErrorMessage("");
    setSchedules([]);
    setSchedulesCompleted(0);
  };

  const handleViewGantt = () => {
    onComplete();
    handleClose();
  };

  // ── Schedule status icon ───────────────────────────────────────────────────
  const ScheduleIcon = ({ s }: { s: ScheduleProgress }) => {
    if (s.status === "done")
      return <CheckCircle2 size={18} className="gg-icon gg-icon--done" />;
    if (s.status === "generating")
      return <Loader2 size={18} className="gg-icon gg-icon--loading" />;
    if (s.status === "error")
      return <XCircle size={18} className="gg-icon gg-icon--error" />;
    return <Circle size={18} className="gg-icon gg-icon--pending" />;
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={560}
      centered
      className="gg-modal"
      closable={status !== "analyzing" && status !== "generating"}
      maskClosable={false}
    >
      <div className="gg-root">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="gg-header">
          <div className="gg-header__icon">
          </div>
          <div>
            <h2 className="gg-header__title">Generate Project Plan with AI</h2>
            <p className="gg-header__sub">
              Upload a document and let AI create your Gantt chart
            </p>
          </div>
        </div>

        {/* ── Progress bar (shown during analysis/generating/complete) ───── */}
        {status !== "idle" && status !== "error" && (
          <div className="gg-progress">
            <div className="gg-progress__bar">
              <div
                className="gg-progress__fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="gg-progress__label">{progressPercent}%</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* IDLE — File dropzone                                            */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {status === "idle" && (
          <>
            <div
              className={`gg-dropzone ${dragging ? "gg-dropzone--active" : ""} ${file ? "gg-dropzone--has-file" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="gg-dropzone__input"
                onChange={handleInputChange}
              />
              {file ? (
                <div className="gg-file-preview">
                  <FileText size={36} className="gg-file-preview__icon" />
                  <div className="gg-file-preview__info">
                    <span className="gg-file-preview__name">{file.name}</span>
                    <span className="gg-file-preview__size">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <button
                    className="gg-file-preview__remove"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={40} className="gg-dropzone__icon" strokeWidth={1.5} />
                  <p className="gg-dropzone__text">
                    Drop your document here or <span>browse</span>
                  </p>
                  <p className="gg-dropzone__hint">PDF, DOC, DOCX, TXT supported</p>
                </>
              )}
            </div>

            <div className="gg-actions">
              <Button className="gg-btn gg-btn--ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className="gg-btn gg-btn--primary"
                onClick={handleGenerate}
                disabled={!file}
              >
                Generate
              </Button>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ANALYZING — Spinner + message                                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {status === "analyzing" && (
          <div className="gg-analyzing">
            <Loader2 size={32} className="gg-analyzing__spinner" />
            <p className="gg-analyzing__text">{statusMessage}</p>
            <button className="gg-btn gg-btn--ghost gg-btn--sm" onClick={handleClose}>
              Cancel
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* GENERATING — Schedule list                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {(status === "generating" || status === "complete") && (
          <div className="gg-schedules">
            {schedules.map((s, i) => (
              <div
                key={i}
                className={`gg-schedule-row gg-schedule-row--${s.status}`}
              >
                <div
                  className="gg-schedule-row__dot"
                  style={{
                    background: s.color ?? "#6366f1",
                    opacity: s.status === "pending" ? 0.35 : 1,
                  }}
                />
                <div className="gg-schedule-row__info">
                  <span className="gg-schedule-row__name">{s.name}</span>
                  {s.status === "done" && (
                    <span className="gg-schedule-row__badge">
                      {s.tasksCreated} task{s.tasksCreated !== 1 ? "s" : ""}
                    </span>
                  )}
                  {s.status === "error" && (
                    <span className="gg-schedule-row__badge gg-schedule-row__badge--error">
                      Error
                    </span>
                  )}
                  {s.status === "generating" && (
                    <span className="gg-schedule-row__badge gg-schedule-row__badge--loading">
                      Generating...
                    </span>
                  )}
                </div>
                <ScheduleIcon s={s} />
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* COMPLETE — Summary + actions                                    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {status === "complete" && (
          <div className="gg-complete">
            <div className="gg-complete__summary">
              <CheckCircle2 size={20} className="gg-complete__icon" />
              <span>
                Done! Created <strong>{totalSchedules}</strong> phases ·{" "}
                <strong>{totalTasks}</strong> tasks
              </span>
            </div>
            <div className="gg-actions">
              <button className="gg-btn gg-btn--ghost" onClick={handleClose}>
                Close
              </button>
              <button className="gg-btn gg-btn--primary" onClick={handleViewGantt}>
                View Gantt Chart →
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ERROR — Alert + retry                                           */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {status === "error" && (
          <div className="gg-error">
            <div className="gg-error__banner">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
            <div className="gg-actions">
              <button className="gg-btn gg-btn--ghost" onClick={handleClose}>
                Cancel
              </button>
              <button className="gg-btn gg-btn--primary" onClick={handleRetry}>
                <RotateCcw size={15} />
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
