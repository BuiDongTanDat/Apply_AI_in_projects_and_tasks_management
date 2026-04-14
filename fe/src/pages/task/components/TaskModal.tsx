import {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  Modal,
  Input,
  DatePicker,
  InputNumber,
  Space,
  Spin,
  Radio,
  Popconfirm,
  Tag,
} from "antd";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  Task,
  TaskPriorityLabels,
  TaskStatus,
  TaskStatusLabels,
  TodoItem,
} from "@/types/task.type";
import TodoList from "./TodoList";
import { TaskDocumentsSection } from "./TaskDocumentsSection";
import { taskApi } from "@/api/task.api";
import { CreateTaskForm, createTaskSchema } from "../handler/form";
import { EnumSelector } from "@/components/element/selector/EnumSelector";
import { UserSelector } from "@/components/element/selector/UserSelector";
import { ModalStatus } from "@/types/model.tye";
import RequiredLabel from "@/components/element/form/RequiredLabel";
import { Button } from "@/components/element/button";
import { alert } from "@/provider/AlertService";
import {
  Sparkles,
  Users,
  Clock,
  AlertTriangle,
  ExternalLink,
  X,
} from "lucide-react";
import { AiFeedbackButtons } from "@/components/ui/AiFeedbackButtons";
import { aiFeedbackApi } from "@/api/ai-feedback.api";
import type { AiFeedbackPayload } from "@/types/ai-feedback.type";
import { SingleSelector } from "@/components/element/selector/SingleSelector";
import { Tooltip } from "antd";
import "../task.less";
import { AILoadingIndicator } from "@/components/element/loading/AILoadingIndicator";
import { useProject } from "@/hooks/data/use-project";
import { Project } from "@/types/project.type";
import { useAppSelector } from "@/store/hook";
import { TaskCommentSection } from "./TaskCommentSection";

interface DuplicateTask {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  similarityScore: number; // 0..1
}

// Convert Python AI-service response item → DuplicateTask
const mapDuplicateTask = (item: any): DuplicateTask => ({
  id: item.metadata?.task_id,
  title: item.metadata?.title ?? "(No title)",
  description: item.metadata?.description,
  status: item.metadata?.status,
  priority: item.metadata?.priority,
  similarityScore: item.score ?? 0,
});

/** Generate unique ID for todo items */
const generateTodoId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const { TextArea } = Input;

interface CreateTaskModalProps {
  onSubmitOk: () => void;
}

export interface CreateTaskModalRef {
  open: () => void;
  update: (task: Task) => void;
  openQCReview: (task: Task) => void;
  view: (task: Task) => void;
}

export const CreateTaskModal = forwardRef<
  CreateTaskModalRef,
  CreateTaskModalProps
>(({ onSubmitOk }, ref) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ModalStatus>(ModalStatus.Create);
  const [selectedTask, setSelectedTask] = useState<Task>();
  const [isViewMode, setIsViewMode] = useState(false);
  const [qcReviewStatus, setQcReviewStatus] = useState<"PASS" | "FAIL">("PASS");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestingAssignee, setAiSuggestingAssignee] = useState(false);
  const [aiSuggestingEffort, setAiSuggestingEffort] = useState(false);
  const [animatingFields, setAnimatingFields] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateTask[]>([]);
  const [isDuplicateVisible, setIsDuplicateVisible] = useState(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);

  // AI Feedback tracking
  /** feedbackId for TASK_GENERATION explicit feedback */
  const [genTaskFeedbackId, setGenTaskFeedbackId] = useState<number | null>(
    null,
  );
  /** feedbackId for STORY_POINT_SUGGESTION implicit feedback */
  const [spFeedbackId, setSpFeedbackId] = useState<number | null>(() => {
    const stored = sessionStorage.getItem("ai_sp_feedbackId");
    return stored ? Number(stored) : null;
  });

  const defaultValues: CreateTaskForm = {
    title: "",
    description: "",
    status: TaskStatus.Pending,
    dueDate: dayjs().endOf("day").unix(), // Default to 23:59 today
    estimateEffort: 0,
    priority: undefined,
    assigneeId: undefined,
    projectId: undefined,
  };

  const { team } = useAppSelector((state) => state.selectedTeam);

  const { fetchProject } = useProject({
    initQuery: { page: 1, limit: 100, teamId: team?.id },
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    getValues,
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: defaultValues,
  });

  // Watch title + projectId for duplicate detection
  const watchedTitle = useWatch({ control, name: "title" });
  const watchedProjectId = useWatch({ control, name: "projectId" });

  const runDuplicateCheck = useCallback(
    async (title: string, projectId?: number) => {
      if (!title || title.trim().length < 5 || !projectId) {
        setDuplicates([]);
        return;
      }
      try {
        const res = await taskApi.checkDuplicate({
          task: { title },
          project_id: projectId,
        });
        // API trả về { metadata: { duplicates: [...] } } hoặc metadata.result.duplicates
        const base = (res as any) || {};
        const meta = base.metadata || base.data || base;
        const rawList: any[] =
          meta?.duplicates || meta?.result?.duplicates || base.duplicates || [];
        const list: DuplicateTask[] = rawList.map(mapDuplicateTask);
        setDuplicates(list);
        if (list.length > 0) setIsDuplicateVisible(true);
      } catch {
        // silently ignore
      }
    },
    [],
  );

  useEffect(() => {
    if (!open || status !== ModalStatus.Create) return;
    clearTimeout(debounceTimerRef.current!);
    debounceTimerRef.current = setTimeout(() => {
      runDuplicateCheck(watchedTitle ?? "", watchedProjectId);
    }, 600);
    return () => clearTimeout(debounceTimerRef.current!);
  }, [watchedTitle, watchedProjectId, open, status, runDuplicateCheck]);

  useImperativeHandle(ref, () => ({
    open: () => {
      reset(defaultValues);
      setTodos([]);
      setOpen(true);
      setStatus(ModalStatus.Create);
      setIsViewMode(false);
      // Reset explicit feedback state on open
      setGenTaskFeedbackId(null);
    },
    update: (task: Task) => {
      reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        dueDate: task.dueDate ? task.dueDate : undefined,
        estimateEffort: task.estimateEffort || 0,
        actualEffort: task.actualEffort || 0,
        priority: task.priority,
        assigneeId: task.assignee?.id,
        reviewerId: task.reviewer?.id,
        projectId: task.project?.id,
      });
      setTodos(task.todos ?? []);
      setOpen(true);
      setStatus(ModalStatus.Update);
      setSelectedTask(task);
      setIsViewMode(false);
    },
    openQCReview: (task: Task) => {
      reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        dueDate: task.dueDate ? task.dueDate : undefined,
        estimateEffort: task.estimateEffort || 0,
        actualEffort: task.actualEffort || 0,
        priority: task.priority,
        assigneeId: task.assignee?.id,
        reviewerId: task.reviewer?.id,
        projectId: task.project?.id,
      });
      setTodos(task.todos ?? []);
      setOpen(true);
      setStatus(ModalStatus.Update);
      setSelectedTask(task);
      setIsViewMode(false);
      setQcReviewStatus("PASS");
    },
    view: (task: Task) => {
      reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        dueDate: task.dueDate ? task.dueDate : undefined,
        estimateEffort: task.estimateEffort || 0,
        actualEffort: task.actualEffort || 0,
        priority: task.priority,
        assigneeId: task.assignee?.id,
        reviewerId: task.reviewer?.id,
        projectId: task.project?.id,
      });
      setTodos(task.todos ?? []);
      setOpen(true);
      setStatus(ModalStatus.Update);
      setSelectedTask(task);
      setIsViewMode(true);
    },
  }));

  const isQCMode = useMemo(() => {
    return (
      selectedTask?.status === TaskStatus.Processing ||
      selectedTask?.status === TaskStatus.WaitReview ||
      selectedTask?.status === TaskStatus.Done
    );
  }, [selectedTask?.status]);

  const handleCreate = async (values: CreateTaskForm) => {
    // Embed implicit SP feedback if AI suggested a story point this session
    const fbId =
      spFeedbackId ??
      (sessionStorage.getItem("ai_sp_feedbackId")
        ? Number(sessionStorage.getItem("ai_sp_feedbackId"))
        : null);
    const aiFeedback: AiFeedbackPayload | undefined = fbId
      ? { feedbackId: fbId, actualValue: { storyPoint: values.estimateEffort } }
      : undefined;
    const payload: CreateTaskForm & { aiFeedback?: AiFeedbackPayload } = {
      ...values,
      todos: todos.length > 0 ? todos : undefined,
      aiFeedback,
    };
    await taskApi.create(payload);
    // Clear SP feedback state after submission
    setSpFeedbackId(null);
    sessionStorage.removeItem("ai_sp_feedbackId");
  };

  const handleUpdate = async (values: CreateTaskForm) => {
    if (!selectedTask) return;
    await taskApi.update(selectedTask.id.toString(), values);
    // Implicit SP feedback for update path (taskId already exists)
    const fbId =
      spFeedbackId ??
      (sessionStorage.getItem("ai_sp_feedbackId")
        ? Number(sessionStorage.getItem("ai_sp_feedbackId"))
        : null);
    if (fbId) {
      try {
        await aiFeedbackApi.submitImplicit({
          feedbackId: fbId,
          actualValue: { storyPoint: values.estimateEffort },
          taskId: selectedTask.id,
        });
      } catch {
        // non-critical, silently ignore
      } finally {
        setSpFeedbackId(null);
        sessionStorage.removeItem("ai_sp_feedbackId");
      }
    }
  };

  const handleOk = handleSubmit(
    async (values) => {
      setLoading(true);
      try {
        if (isQCMode && selectedTask) {
          // QC Review mode
          await taskApi.submitQCReview(selectedTask.id.toString(), {
            passed: qcReviewStatus === "PASS",
            score: values.score,
            actualEffort: values.actualEffort,
          });
          alert("QC review submitted successfully!", "Success", "success");
        } else if (status == ModalStatus.Create) {
          await handleCreate(values);
          alert("Task created successfully!", "Success", "success");
        } else if (status == ModalStatus.Update && selectedTask) {
          await handleUpdate(values);
          alert("Task updated successfully!", "Success", "success");
        }
        onSubmitOk?.();
        reset();
        setOpen(false);
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Something went wrong";
        alert(`Error: ${errorMsg}`, "Failed", "error");
        console.error("Error submitting form:", error);
      } finally {
        setLoading(false);
      }
    },
    (errors) => {
      console.error("Form validation errors:", errors);
      const firstKey = Object.keys(errors)[0] as keyof typeof errors;
      const errorMessage =
        errors[firstKey]?.message || "Please check your inputs";
      alert(`Validation error: ${String(errorMessage)}`, "Warning", "warning");
    },
  );

  // Animate field updates with typing effect
  const animateFieldUpdate = (
    fieldName: string,
    value: any,
    setVal: (val: any) => void,
  ) => {
    setAnimatingFields((prev) => [...prev, fieldName]);

    // Simulate typing effect for text fields
    if (typeof value === "string" && value.length > 20) {
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= value.length) {
          setVal(value.substring(0, currentIndex));
          currentIndex += 3; // Speed up typing for longer texts
        } else {
          clearInterval(typingInterval);
          setAnimatingFields((prev) => prev.filter((f) => f !== fieldName));
        }
      }, 20);
    } else {
      // For numbers or short strings, just set directly with animation
      setTimeout(() => {
        setVal(value);
        setAnimatingFields((prev) => prev.filter((f) => f !== fieldName));
      }, 300);
    }
  };

  const handleGenTask = async () => {
    const title = getValues("title");
    const projectId = getValues("projectId");

    if (!projectId) {
      alert(
        "Please select a project before generating a task with AI.",
        "Warning",
        "warning",
      );
      return;
    }

    if (!title || title.trim() === "") {
      alert(
        "Please enter a title before generating a task with AI.",
        "Warning",
        "warning",
      );
      return;
    }
    setAiGenerating(true);
    setLoading(true);
    // Reset previous gen feedback
    setGenTaskFeedbackId(null);
    try {
      const res = await taskApi.genTask({
        user_input: title,
        project_id: projectId,
      });

      console.log("=== AI Gen Task Response ===", res);

      // Handle different response formats & new usage wrapper
      const base = (res as any) || {};
      const rawMetadata = base.metadata || base.data || base;
      const aiData = rawMetadata?.result || base.result || rawMetadata;

      if (!aiData) {
        throw new Error("No data returned from AI");
      }

      // Track explicit feedback if BE returned feedbackId
      if (base.feedbackId) {
        setGenTaskFeedbackId(base.feedbackId);
      }

      // Animate fields being filled
      const currentValues = getValues();

      // Title with typing effect
      if (aiData.title && aiData.title !== title) {
        animateFieldUpdate("title", aiData.title, (val) => {
          reset({ ...currentValues, title: val });
        });
      }

      // Description with typing effect (delayed)
      setTimeout(
        () => {
          if (aiData.description) {
            animateFieldUpdate("description", aiData.description, (val) => {
              reset({ ...getValues(), description: val });
            });
          }
        },
        aiData.title && aiData.title !== title ? aiData.title.length * 20 : 0,
      );

      // dueDate + priority from AI gen
      if (aiData.dueDate) reset({ ...getValues(), dueDate: aiData.dueDate });
      if (aiData.priority) reset({ ...getValues(), priority: aiData.priority });

      // AI-generated todos (array of strings)
      if (aiData.todos && Array.isArray(aiData.todos)) {
        const aiTodos: TodoItem[] = aiData.todos.map((t: string) => ({
          id: generateTodoId(),
          title: t,
          isCompleted: false,
        }));
        setTodos(aiTodos);
      }

      // Effort (delayed further)
      setTimeout(
        () => {
          if (aiData.estimateEffort) {
            animateFieldUpdate(
              "estimateEffort",
              aiData.estimateEffort,
              (val) => {
                setValue("estimateEffort", Number(val));
              },
            );
          }
        },
        aiData.title && aiData.title !== title
          ? aiData.title.length * 20 + (aiData.description?.length || 0) * 20
          : 500,
      );

      alert("AI generated task successfully!", "Success", "success");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to generate task with AI";
      console.error("Error generating task by AI:", error);
      alert(`Error: ${errorMsg}`, "Failure", "error");
    } finally {
      setTimeout(() => {
        setAiGenerating(false);
        setLoading(false);
      }, 1500);
    }
  };

  const handleSuggestAssignee = async () => {
    const title = getValues("title");
    const description = getValues("description");
    const projectId = getValues("projectId");

    if (!title || title.trim() === "") {
      alert(
        "Please enter a task title before suggesting an assignee.",
        "Warning",
        "warning",
      );
      return;
    }

    if (!projectId) {
      alert(
        "Please select a project before suggesting an assignee.",
        "Warning",
        "warning",
      );
      return;
    }

    setAiSuggestingAssignee(true);
    try {
      // Call API to suggest assignee based on task info
      const response = await taskApi.getSuggestedDev({
        task: {
          title: title,
          description: description || "",
          type: "FEATURE",
        },
        project_id: projectId,
      });

      const base = (response as any) || {};
      const meta = base.metadata || base.data || base;
      const assignment = meta.assignment || meta.result?.assignment;

      console.log("👤 === AI Suggest Assignee Response ===");
      console.log("Full response:", base);
      console.log("Resolved assignment:", assignment);

      if (assignment?.assignee) {
        animateFieldUpdate("assigneeId", assignment.assignee.id, (val) => {
          reset({ ...getValues(), assigneeId: val });
        });
        alert("AI suggested an assignee!", "Success", "success");
      }
    } catch (error) {
      console.error("Error suggesting assignee:", error);
    } finally {
      setTimeout(() => setAiSuggestingAssignee(false), 500);
    }
  };

  const handleSuggestEffort = async () => {
    const title = getValues("title") || "";
    const description = getValues("description") || "";
    const priority = getValues("priority");

    if (!title || title.trim() === "") {
      alert(
        "Please enter a task title before suggesting an estimate.",
        "Warning",
        "warning",
      );
      return;
    }

    setAiSuggestingEffort(true);
    try {
      const response = await taskApi.getSuggestedStoryPoint({
        title,
        description: description,
        type: "FEATURE",
        priority,
      });

      const base = (response as any) || {};
      const meta = base.metadata || base.data || base;
      const suggestedSp =
        meta.suggested_story_point || meta.result?.suggested_story_point;

      console.log("⏱️ === AI Suggest Effort Response ===");
      console.log("Full response:", base);
      console.log("Resolved suggested story point:", suggestedSp);

      if (suggestedSp) {
        animateFieldUpdate("estimateEffort", suggestedSp, (val) => {
          setValue("estimateEffort", Number(val));
        });
        alert("AI estimated effort!", "Success", "success");

        // Track implicit feedback — persist through sessionStorage in case of refresh
        const feedbackId = base.feedbackId || meta.feedbackId;
        if (feedbackId) {
          setSpFeedbackId(feedbackId);
          sessionStorage.setItem("ai_sp_feedbackId", String(feedbackId));
        }
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Could not estimate effort";
      console.error("Error suggesting effort:", error);
      alert(`Error: ${errorMsg}`, "Failed", "error");
    } finally {
      setTimeout(() => setAiSuggestingEffort(false), 500);
    }
  };

  const handleCancel = () => {
    reset();
    setSelectedTask(undefined);
    setTodos([]);
    setOpen(false);
    setIsViewMode(false);
    setDuplicates([]);
  };

  const handleSendToQCFromModal = async () => {
    if (!selectedTask) return;
    setLoading(true);
    try {
      await taskApi.sendToQC(selectedTask.id.toString());
      alert("Task sent to QC!", "QC Submitted", "success");
      onSubmitOk?.();
      setOpen(false);
      reset();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Could not send to QC";
      console.error("Error sending to QC:", error);
      alert(`Error: ${errorMsg}`, "QC Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={
        <div className="flex justify-between items-center">
          <div>
            {/* Show "Send to QC" button only when editing a PROCESSING task and not in QC mode */}
            {status === ModalStatus.Update &&
              selectedTask?.status === TaskStatus.Processing &&
              !isQCMode &&
              !isViewMode && (
                <Popconfirm
                  title="Send task to QC for review?"
                  description="This action cannot be undone"
                  onConfirm={handleSendToQCFromModal}
                >
                  <Button>Send to QC</Button>
                </Popconfirm>
              )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCancel} disabled={loading}>
              {isViewMode ? "Close" : "Cancel"}
            </Button>
            {!isViewMode && (
              <Button onClick={handleOk}>
                {isQCMode
                  ? "Submit Review"
                  : status === ModalStatus.Update
                    ? "Update"
                    : "Create"}
              </Button>
            )}
          </div>
        </div>
      }
      title={
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {isViewMode
              ? "Task Detail"
              : isQCMode
                ? "QC Review"
                : status === ModalStatus.Update
                  ? "Edit Task"
                  : "Create New Task"}
          </span>
          <span className="text-base font-semibold text-gray-900">
            {status === ModalStatus.Update && selectedTask
              ? `Task #${selectedTask.id}`
              : "Enter task information"}
          </span>
        </div>
      }
      confirmLoading={loading}
      centered
      zIndex={1200}
      destroyOnHidden
      afterClose={() => reset()}
      width={1200}
    >
      <Spin spinning={loading} tip="Processing...">
        {/* AI Loading Indicator */}
        {(aiGenerating || aiSuggestingAssignee || aiSuggestingEffort) && (
          <div className="mb-4">
            <AILoadingIndicator
              message={
                aiGenerating
                  ? "AI is generating task details..."
                  : aiSuggestingAssignee
                    ? " AI is analyzing to suggest an assignee..."
                    : " AI is estimating effort..."
              }
            />
          </div>
        )}

        {/* Explicit feedback — shown after AI task generation */}
        {genTaskFeedbackId && !aiGenerating && (
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-2">
            <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI generated
            </span>
            <div className="h-3 w-px bg-indigo-200" />
            <AiFeedbackButtons
              feedbackId={genTaskFeedbackId}
              label="Was this helpful?"
              onDone={() => setGenTaskFeedbackId(null)}
            />
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleOk();
          }}
        >
          <Space direction="vertical" size={16} className="w-full">
            {/* Block 1: General Info */}
            <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                General Information
              </h4>

              {/* Title + Project */}
              <div className="space-y-1">
                <div className="flex items-end gap-3">
                  {/* Project - Left side */}
                  <div className="w-52 flex-shrink-0 space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      Project <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="projectId"
                      control={control}
                      render={({ field }) => (
                        <SingleSelector<Project>
                          value={field.value}
                          findAll={fetchProject}
                          getDisplayValue={(item) => item.name}
                          onSelect={(value) => field.onChange(value)}
                        />
                      )}
                    />
                  </div>

                  {/* Title - Occupies the rest */}
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    {/* Wrapper relative để dropdown trùng lặp bám vào */}
                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                          <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder="Enter title..."
                                className={`!w-full transition-all duration-300 ${
                                  animatingFields.includes("title")
                                    ? "ring-2 ring-purple-400 shadow-lg shadow-purple-200"
                                    : ""
                                }`}
                                disabled={aiGenerating}
                              />
                            )}
                          />
                          {animatingFields.includes("title") && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                            </div>
                          )}
                        </div>
                        {!isViewMode && (
                          <Tooltip
                            title="AI will auto-generate a detailed title, description and estimate effort based on your input"
                            placement="top"
                          >
                            <button
                              type="button"
                              onClick={handleGenTask}
                              disabled={aiGenerating || loading}
                              className={`
                                inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm flex-shrink-0
                                transition-all duration-300 ease-out
                                ${
                                  aiGenerating
                                    ? "bg-indigo-600 text-white cursor-wait"
                                    : "bg-white text-indigo-600 border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                                shadow-sm hover:shadow-md
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                              `}
                            >
                              {aiGenerating ? (
                                <>
                                  <Sparkles
                                    size={16}
                                    className="animate-spin"
                                  />
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles size={16} />
                                  <span>Generate with AI</span>
                                </>
                              )}
                            </button>
                          </Tooltip>
                        )}
                      </div>

                      {errors.title && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.title.message}
                        </p>
                      )}

                      {/* Duplicate dropdown – absolute, floats below title */}
                      {duplicates.length > 0 &&
                        isDuplicateVisible &&
                        status === ModalStatus.Create && (
                          <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-gray-200 bg-white shadow-md p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span className="text-xs text-gray-500">
                                  Could match {duplicates.length} existing tasks
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsDuplicateVisible(false)}
                                className="text-gray-300 hover:text-gray-500 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {duplicates.map((dup) => {
                                const pct = Math.round(
                                  (dup.similarityScore ?? 0) * 100,
                                );
                                return (
                                  <div
                                    key={dup.id}
                                    className="flex items-center justify-between gap-3 rounded px-2 py-1.5 text-xs hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                  >
                                    <span className="flex-1 truncate text-gray-700">
                                      <span className="text-gray-400 mr-1">
                                        #{dup.id}
                                      </span>
                                      {dup.title}
                                    </span>
                                    <div className="flex items-center gap-2 flex-shrink-0 text-gray-400">
                                      <span className="text-[11px]">
                                        {pct}% similarity
                                      </span>
                                      {dup.status && (
                                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                                          {dup.status}
                                        </span>
                                      )}
                                      <a
                                        href={`/task?id=${dup.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mô tả */}
              <div className="space-y-1 relative">
                <label className="text-xs font-medium text-gray-700">
                  Description
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      rows={5}
                      placeholder="Add detailed description..."
                      className={`w-full resize-none transition-all duration-300 ${
                        animatingFields.includes("description")
                          ? "ring-2 ring-purple-400 shadow-lg shadow-purple-200"
                          : ""
                      }`}
                      disabled={isViewMode || aiGenerating}
                    />
                  )}
                />
                {animatingFields.includes("description") && (
                  <div className="absolute right-4 top-8">
                    <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Người phụ trách */}
                <div className="space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">
                      Assignee
                    </label>
                    {!isViewMode && (
                      <Tooltip title="AI will analyze the task and suggest the most suitable person">
                        <button
                          type="button"
                          onClick={handleSuggestAssignee}
                          disabled={aiSuggestingAssignee || loading}
                          className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          {aiSuggestingAssignee ? (
                            <>
                              <Sparkles className="w-3 h-3 animate-spin" />
                              Suggesting...
                            </>
                          ) : (
                            <>
                              <Users className="w-3 h-3" />
                              Suggest
                            </>
                          )}
                        </button>
                      </Tooltip>
                    )}
                  </div>
                  <div
                    className={`transition-all duration-300 ${
                      animatingFields.includes("assigneeId")
                        ? "ring-2 ring-purple-400 rounded shadow-lg shadow-purple-200"
                        : ""
                    }`}
                  >
                    <Controller
                      name="assigneeId"
                      control={control}
                      render={({ field }) => (
                        <UserSelector
                          value={field.value}
                          onSelect={(user) => field.onChange(user)}
                          disabled={aiSuggestingAssignee}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">
                    Reviewer
                  </label>
                  <Controller
                    name="reviewerId"
                    control={control}
                    render={({ field }) => (
                      <UserSelector
                        value={field.value}
                        onSelect={(user) => field.onChange(user)}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* QC Review Section - Only shown in QC mode */}
            {(isQCMode || selectedTask?.status === TaskStatus.Done) && (
              <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  QC Review
                </h4>

                {/* Pass/Fail Radio */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">
                    Review result <span className="text-red-500">*</span>
                  </label>
                  <Radio.Group
                    value={qcReviewStatus}
                    onChange={(e) => setQcReviewStatus(e.target.value)}
                    className="flex gap-4"
                    disabled={isViewMode}
                  >
                    <Radio value="PASS" className="text-sm font-medium">
                      Pass - Meets requirements
                    </Radio>
                    <Radio value="FAIL" className="text-sm font-medium">
                      Fail - Does not meet requirements
                    </Radio>
                  </Radio.Group>
                </div>

                {qcReviewStatus === "PASS" && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Score */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">
                        Score (0-10)
                      </label>
                      <Controller
                        name="score"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            min={0}
                            max={10}
                            step={0.5}
                            className="!w-full"
                            placeholder="Enter score"
                            onChange={(value) => field.onChange(value)}
                            disabled={isViewMode}
                          />
                        )}
                      />
                    </div>

                    {/* Actual Effort */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">
                        Actual hours
                      </label>
                      <Controller
                        name="actualEffort"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            min={0}
                            className="!w-full"
                            placeholder="Enter hours"
                            onChange={(value) => field.onChange(value)}
                            disabled={isViewMode}
                          />
                        )}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Notes
                  </label>
                  <Controller
                    name="qcNote"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Add notes..."
                        className="w-full resize-none"
                        disabled={isViewMode}
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {/* Block 2: Planning & Settings */}
            <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Planning & Setup
              </h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Hạn hoàn thành */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Due date
                  </label>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        showTime
                        className="w-full"
                        value={
                          field.value ? dayjs.unix(field.value) : undefined
                        }
                        onChange={(date) => field.onChange(date?.unix())}
                        format="DD/MM/YYYY HH:mm"
                      />
                    )}
                  />
                </div>

                <div className="flex flex-row justify-between">
                  {/* Effort ước tính */}
                  <div className="space-y-1 relative">
                    <div className="flex items-center justify-between gap-2">
                      <RequiredLabel required>Estimate effort</RequiredLabel>
                      {!isViewMode && (
                        <Tooltip title="AI will estimate the required hours based on task content">
                          <button
                            type="button"
                            onClick={handleSuggestEffort}
                            disabled={aiSuggestingEffort || loading}
                            className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            {aiSuggestingEffort ? (
                              <>
                                <Sparkles className="w-3 h-3 animate-spin" />
                                Calculating...
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                Suggest
                              </>
                            )}
                          </button>
                        </Tooltip>
                      )}
                    </div>
                    <Controller
                      name="estimateEffort"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          min={0}
                          className={`!w-[280px] transition-all duration-300 ${
                            animatingFields.includes("estimateEffort")
                              ? "ring-2 ring-purple-400 shadow-lg shadow-purple-200"
                              : ""
                          }`}
                          placeholder="Enter story points"
                          onChange={(value) => field.onChange(value)}
                          disabled={
 aiSuggestingEffort
                          }
                        />
                      )}
                    />
                    {errors.estimateEffort && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.estimateEffort.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Trạng thái */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Status
                  </label>
                  <Controller
                    name="status"
                    control={control}
                    defaultValue={TaskStatus.Pending}
                    render={({ field }) => (
                      <EnumSelector
                        label={TaskStatusLabels}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {/* Độ ưu tiên */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Priority
                  </label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <EnumSelector
                        label={TaskPriorityLabels}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Checklist — shown in both create and update modes */}
            <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Checklist
                </h4>
                {todos.length > 0 && (
                  <span className="text-[11px] text-gray-400">
                    {todos.filter((t) => t.isCompleted).length} / {todos.length}
                  </span>
                )}
              </div>
              <TodoList
                taskId={
                  status === ModalStatus.Update ? selectedTask?.id : undefined
                }
                initialTodos={todos}
                onChange={setTodos}
              />
            </div>

            {/* Document Tabs */}
            <TaskDocumentsSection
              taskId={
                status === ModalStatus.Update ? selectedTask?.id : undefined
              }
              projectId={watchedProjectId || selectedTask?.project?.id}
            />
          </Space>
        </form>
      </Spin>
    </Modal>
  );
});

export default CreateTaskModal;
