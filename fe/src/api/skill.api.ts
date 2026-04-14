import axiosInstance from "./axiosInstance";

const getAll = async () => {
  const response = await axiosInstance.get("/skills");
  return response.data?.metadata?.skills ?? [];
};

export const skillApi = {
  getAll,
};
