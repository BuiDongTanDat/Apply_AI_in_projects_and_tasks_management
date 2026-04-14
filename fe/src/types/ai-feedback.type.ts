// ─── Enums ────────────────────────────────────────────────────────────────────

export enum AiActionType {
    STORY_POINT_SUGGESTION = "STORY_POINT_SUGGESTION",
    TASK_GENERATION = "TASK_GENERATION",
    TASK_DESCRIPTION = "TASK_DESCRIPTION",
    PRIORITY_SUGGESTION = "PRIORITY_SUGGESTION",
    ASSIGNEE_SUGGESTION = "ASSIGNEE_SUGGESTION",
    TASK_SPLIT = "TASK_SPLIT",
    DUPLICATE_CHECK = "DUPLICATE_CHECK",
    OTHER = "OTHER",
}

export enum FeedbackValue {
    Positive = "positive",
    Negative = "negative",
}

export enum FeedbackSource {
    Explicit = "explicit",
    Implicit = "implicit",
}

export enum FeedbackStatus {
    Pending = "pending",
    Resolved = "resolved",
    Expired = "expired",
}

// ─── Labels for UI rendering ─────────────────────────────────────────────────

export const AiActionTypeLabels: Record<AiActionType, string> = {
    [AiActionType.STORY_POINT_SUGGESTION]: "Story Point",
    [AiActionType.TASK_GENERATION]: "Task Generation",
    [AiActionType.TASK_DESCRIPTION]: "Task Description",
    [AiActionType.PRIORITY_SUGGESTION]: "Priority",
    [AiActionType.ASSIGNEE_SUGGESTION]: "Assignee",
    [AiActionType.TASK_SPLIT]: "Task Split",
    [AiActionType.DUPLICATE_CHECK]: "Duplicate Check",
    [AiActionType.OTHER]: "Other",
};

// ─── Entity ───────────────────────────────────────────────────────────────────

export interface AiFeedback {
    id: number;
    actionType: AiActionType;
    projectId: number | null;
    taskId: number | null;
    userId: number;
    suggestedValue: Record<string, unknown>;
    actualValue: Record<string, unknown> | null;
    feedback: FeedbackValue | null;
    feedbackSource: FeedbackSource | null;
    status: FeedbackStatus;
    comment: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
}

// ─── Query / Pagination ───────────────────────────────────────────────────────

export interface AiFeedbackQuery {
    projectId?: number;
    taskId?: number;
    userId?: number;
    actionType?: AiActionType;
    feedback?: FeedbackValue;
    feedbackSource?: FeedbackSource;
    status?: FeedbackStatus;
    fromDate?: number; // unix ms
    toDate?: number;   // unix ms
    page?: number;
    limit?: number;
}

export interface AiFeedbackListResponse {
    feedbacks: AiFeedback[];
    page: {
        total: number;
        currentPage: number;
        pages: number;
    };
}

// ─── Dashboard Summary ────────────────────────────────────────────────────────

export interface AiFeedbackByAction {
    actionType: AiActionType;
    total: number;
    positive: number;
    negative: number;
    pending: number;
    acceptanceRate: number;
}

export interface AiFeedbackSummary {
    projectId: number;
    totalSuggestions: number;
    resolvedCount: number;
    positiveCount: number;
    negativeCount: number;
    overallAcceptanceRate: number;
    byActionType: AiFeedbackByAction[];
}

// ─── Request bodies ───────────────────────────────────────────────────────────

export interface ExplicitFeedbackBody {
    feedback: FeedbackValue;
    comment?: string;
}

export interface ImplicitFeedbackBody {
    feedbackId: number;
    actualValue: Record<string, unknown>;
    taskId: number;
}

/** Embedded in task create payload when SP was suggested by AI */
export interface AiFeedbackPayload {
    feedbackId: number;
    actualValue: Record<string, unknown>;
}
