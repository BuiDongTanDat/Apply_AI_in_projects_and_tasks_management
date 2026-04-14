import axiosInstance from "./axiosInstance";

const findAll = async (projectId: number) => {
  const response = await axiosInstance.get(`/project/${projectId}/schedules`);
  return response.data;
};

const getOne = async (projectId: number, scheduleId: number) => {
  const response = await axiosInstance.get(
    `/project/${projectId}/schedules/${scheduleId}`
  );
  return response.data;
};

const create = async (projectId: number, data: any) => {
  const response = await axiosInstance.post(
    `/project/${projectId}/schedules`,
    data
  );
  return response.data;
};

const update = async (projectId: number, scheduleId: number, data: any) => {
  const response = await axiosInstance.patch(
    `/project/${projectId}/schedules/${scheduleId}`,
    data
  );
  return response.data;
};

const remove = async (projectId: number, scheduleId: number) => {
  const response = await axiosInstance.delete(
    `/project/${projectId}/schedules/${scheduleId}`
  );
  return response.data;
};

const reorder = async (projectId: number, data: any) => {
  const response = await axiosInstance.patch(
    `/project/${projectId}/schedules/reorder`,
    data
  );
  return response.data;
};

const bulkAssignTasks = async (
  projectId: number,
  scheduleId: number,
  data: any
) => {
  const response = await axiosInstance.post(
    `/project/${projectId}/schedules/${scheduleId}/tasks/bulk-assign`,
    data
  );
  return response.data;
};

const reorderTasks = async (
  projectId: number,
  scheduleId: number,
  data: any
) => {
  const response = await axiosInstance.patch(
    `/project/${projectId}/schedules/${scheduleId}/tasks/reorder`,
    data
  );
  return response.data;
};

export const scheduleApi = {
  findAll,
  getOne,
  create,
  update,
  remove,
  reorder,
  bulkAssignTasks,
  reorderTasks,
};
