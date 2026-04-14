import axiosInstance from "./axiosInstance";
import { SSEEventMap } from "@/types/project.type";

const create = async (data: any) => {
  const response = await axiosInstance.post("/project", data);
  return response.data;
};
const update = async (projectId: number, data: any) => {
  const response = await axiosInstance.patch(`/project/${projectId}`, data);
  return response.data;
};

const getOne = async (projectId: number) => {
  const response = await axiosInstance.get(`/project/${projectId}`);
  return response.data;
};

const findAll = async (query: any) => {
  const response = await axiosInstance.get("/project", { params: query });
  return response;
};

const deleteProject = async (projectId: number) => {
  const response = await axiosInstance.delete(`/project/${projectId}`);
  return response.data;
};

const genProjectSchedule = async (projectId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post(
    `/project/${projectId}/gen-schedule`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};

/**
 * SSE-based generate: POST multipart → streams SSE events back.
 * Cannot use axios because axios buffers the full response.
 */
const genProjectScheduleSSE = async (
  projectId: number,
  file: File,
  onEvent: (event: SSEEventMap) => void,
  signal?: AbortSignal,
): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);

  const token = window.localStorage.getItem("accessToken");
  const userId = window.localStorage.getItem("user_id");

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (userId) headers["x-user-id"] = userId;

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/project/${projectId}/gantt/generate`,
    {
      method: "POST",
      body: formData,
      headers,
      signal,
    },
  );

  if (!response.ok || !response.body) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let eventName = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventName = line.slice(7).trim();
      } else if (line.startsWith("data: ") && eventName) {
        try {
          const data = JSON.parse(line.slice(6));
          onEvent({ event: eventName, data } as SSEEventMap);
        } catch {
          // malformed JSON — skip
        }
        eventName = "";
      }
    }
  }
};

export const projectApi = {
  create,
  getOne,
  update,
  findAll,
  deleteProject,
  genProjectSchedule,
  genProjectScheduleSSE,
};
