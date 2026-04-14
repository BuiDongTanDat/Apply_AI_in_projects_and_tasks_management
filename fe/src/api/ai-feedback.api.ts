import axiosInstance from "./axiosInstance";
import type {
    AiFeedbackQuery,
    AiFeedbackListResponse,
    AiFeedbackSummary,
    ExplicitFeedbackBody,
    ImplicitFeedbackBody,
} from "@/types/ai-feedback.type";

/** PATCH /ai-feedback/:id/explicit — User clicks 👍/👎 */
const submitExplicit = async (
    feedbackId: number,
    body: ExplicitFeedbackBody,
): Promise<void> => {
    await axiosInstance.patch(`/ai-feedback/${feedbackId}/explicit`, body);
};

/**
 * PATCH /ai-feedback/implicit — Implicit feedback for task UPDATE
 * (when taskId already exists). For task CREATE, embed aiFeedback in
 * the task create payload instead — see taskApi.create().
 */
const submitImplicit = async (body: ImplicitFeedbackBody): Promise<void> => {
    await axiosInstance.patch(`/ai-feedback/implicit`, body);
};

/** GET /ai-feedback/project/:projectId/summary */
const getProjectSummary = async (
    projectId: number,
): Promise<AiFeedbackSummary> => {
    const res = await axiosInstance.get(
        `/ai-feedback/project/${projectId}/summary`,
    );
    return res.data.metadata;
};

/** GET /ai-feedback — paginated list with filters */
const findAll = async (
    query: AiFeedbackQuery,
): Promise<AiFeedbackListResponse> => {
    const res = await axiosInstance.get("/ai-feedback", { params: query });
    return res.data.metadata;
};

export const aiFeedbackApi = {
    submitExplicit,
    submitImplicit,
    getProjectSummary,
    findAll,
};
