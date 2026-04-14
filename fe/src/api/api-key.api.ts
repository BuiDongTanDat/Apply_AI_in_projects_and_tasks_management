import axiosInstance from "./axiosInstance";
import type {
  ApiKey,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
  SetSelectedApiKeyRequest,
  ApiKeyUsagePage,
  ApiKeyUsageOverview,
} from "@/types/api-key.type";

/** GET /api-keys — list API keys for current user */
const getApiKeys = async (): Promise<ApiKey[]> => {
  const res = await axiosInstance.get("/api-keys");
  return res.data?.metadata ?? res.data;
};

/** POST /api-keys — create a new API key (BYOK) for current user */
const createApiKey = async (body: CreateApiKeyRequest): Promise<ApiKey> => {
  const res = await axiosInstance.post("/api-keys", body);
  return res.data?.metadata ?? res.data;
};

/** PATCH /api-keys/:id — update name / isActive */
const updateApiKey = async (
  id: number,
  body: UpdateApiKeyRequest,
): Promise<ApiKey> => {
  const res = await axiosInstance.patch(`/api-keys/${id}`, body);
  return res.data?.metadata ?? res.data;
};

/** DELETE /api-keys/:id — delete an API key */
const deleteApiKey = async (id: number): Promise<{ deleted: boolean }> => {
  const res = await axiosInstance.delete(`/api-keys/${id}`);
  return res.data?.metadata ?? res.data;
};

/** PATCH /users/setting-api-key — set/unset selected API key for current user */
const setSelectedApiKey = async (
  body: SetSelectedApiKeyRequest,
): Promise<SetSelectedApiKeyRequest> => {
  const res = await axiosInstance.patch("/users/setting-api-key", body);
  return res.data?.metadata ?? res.data;
};

/** GET /api-keys/:id/usages — paginated usage history for a key */
const getApiKeyUsages = async (
  id: number,
  params?: { page?: number; limit?: number },
): Promise<ApiKeyUsagePage> => {
  const res = await axiosInstance.get(`/api-keys/${id}/usages`, { params });
  return res.data?.metadata ?? res.data;
};

/** GET /api-keys/:id/usages/overview — aggregate stats for a key */
const getApiKeyUsageOverview = async (
  id: number,
): Promise<ApiKeyUsageOverview> => {
  const res = await axiosInstance.get(`/api-keys/${id}/usages/overview`);
  return res.data?.metadata ?? res.data;
};

export const apiKeyApi = {
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  setSelectedApiKey,
  getApiKeyUsages,
  getApiKeyUsageOverview,
};

