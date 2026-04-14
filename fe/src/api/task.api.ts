import { CreateTaskForm } from "@/pages/task/handler/form";
import axiosInstance from "./axiosInstance";
import { QueryParam } from "@/types/query.type";
import type { AiFeedbackPayload } from "@/types/ai-feedback.type";
import type { TodoItem } from "@/types/task.type";
import type {
  AiReviewPerformanceResponse,
  PerformanceDashboardResponse,
  PerformanceDashboardPayload,
  AiReviewPerformancePayload,
} from "@/types/performance.type";

const create = async (
  data: CreateTaskForm & { aiFeedback?: AiFeedbackPayload },
) => {
  const response = await axiosInstance.post("/task", data);
  return response.data;
};

const update = async (id: string, data: CreateTaskForm) => {
  const response = await axiosInstance.patch(`/task/${id}`, data);
  return response.data;
};

const updateTodos = async (id: string, todos: TodoItem[]) => {
  const response = await axiosInstance.patch(`/task/${id}`, { todos });
  return response.data;
};

const getById = async (id: string) => {
  const response = await axiosInstance.get(`/task/${id}`);
  return response.data;
};

const findAll = async (param: QueryParam) => {
  const response = await axiosInstance.get("/task", { params: param });
  return response.data;
};

const dlt = async (id: string) => {
  const response = await axiosInstance.delete(`/task/${id}`);
  return response.data;
};

const genTask = async (data: any) => {
  const response = await axiosInstance.post("/task/ai-gen", data);
  return response.data;
};

const sendToQC = async (id: string) => {
  const response = await axiosInstance.post(`/task/${id}/submit-qc`);
  return response.data;
};

const submitQCReview = async (
  id: string,
  data: { passed: boolean; score?: number; actualEffort?: number },
) => {
  const response = await axiosInstance.post(`/task/${id}/qc-review`, data);
  return response.data;
};

const getSuggestedTasks = async (data: any) => {
  const response = await axiosInstance.get(`/task/suggest-today`, {
    params: data,
  });
  return response.data;
};

const getSuggestedDev = async (data: any) => {
  const response = await axiosInstance.post(`/task/suggest-developer`, data);
  return response.data;
};

const getSuggestedStoryPoint = async (data: any) => {
  const response = await axiosInstance.post(`/task/estimate-sp`, data);
  return response.data;
};

const checkDuplicate = async (data: any) => {
  const response = await axiosInstance.post(`/task/check-duplicate`, data);
  return response.data;
};

const createTaskComment = async (taskId: number, data: FormData, userId: number) => {
  const response = await axiosInstance.post(`/task/${taskId}/comments`, data, {
    headers: {
      "x-user-id": String(userId),
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const getTaskComments = async (taskId: number) => {
  const response = await axiosInstance.get(`/task/${taskId}/comments`);
  return response.data;
};

const getPerformanceDashboard = async (data: PerformanceDashboardPayload) => {
  const response = await axiosInstance.post<PerformanceDashboardResponse>(
    "/task/performance-dashboard",
    data,
  );
  return response.data;
};

const aiReviewPerformance = async (data: AiReviewPerformancePayload) => {
  const response = await axiosInstance.post<AiReviewPerformanceResponse>(
    "/task/ai-review-performance",
    data,
  );
  return response.data;
};

export const taskApi = {
  create,
  update,
  updateTodos,
  findAll,
  dlt,
  genTask,
  sendToQC,
  submitQCReview,
  getSuggestedTasks,
  getSuggestedDev,
  getSuggestedStoryPoint,
  checkDuplicate,
  getById,
  createTaskComment,
  getTaskComments,
  getPerformanceDashboard,
  aiReviewPerformance,
};
