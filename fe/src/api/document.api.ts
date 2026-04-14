import axiosInstance from "./axiosInstance";
import { Document, DocumentType } from "@/types/document.type";

/**
 * Upload document using native fetch to avoid axios content-type override.
 * From the API docs: do NOT set Content-Type manually; let the browser set it.
 */
const uploadDocument = async (
  file: File,
  payload: {
    type: DocumentType;
    projectId: number;
    taskId?: number;
  }
): Promise<{ metadata: Document }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", payload.type);
  formData.append("projectId", String(payload.projectId));
  if (payload.taskId) {
    formData.append("taskId", String(payload.taskId));
  }

  const token = window.localStorage.getItem("accessToken");
  const userId = window.localStorage.getItem("user_id");

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (userId) headers["x-user-id"] = userId;
  // Do NOT set Content-Type — let browser set multipart with boundary

  const response = await fetch(`${import.meta.env.VITE_API_URL}/document`, {
    method: "POST",
    body: formData,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.message || `Upload failed: ${response.status}`);
  }

  return response.json();
};

const getProjectDocuments = async (projectId: number): Promise<{ metadata: Document[] }> => {
  const response = await axiosInstance.get(`/document/project/${projectId}`);
  return response.data;
};

const getTaskDocuments = async (
  taskId: number,
  type?: DocumentType
): Promise<{ metadata: Document[] }> => {
  const params = type ? { type } : {};
  const response = await axiosInstance.get(`/document/task/${taskId}`, { params });
  return response.data;
};

const deleteDocument = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/document/${id}`);
};

export const documentApi = {
  uploadDocument,
  getProjectDocuments,
  getTaskDocuments,
  deleteDocument,
};
