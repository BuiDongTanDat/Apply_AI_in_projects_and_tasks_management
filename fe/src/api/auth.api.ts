/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "./axiosInstance";

const login = async (data: any) => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

const register = async (data: any) => {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data;
};

const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

const verifyEmail = async (token: string) => {
  const response = await axiosInstance.get(
    `/auth/verify-email?token=${encodeURIComponent(token)}`,
  );
  return response.data;
};

const profile = async () => {
  const response = await axiosInstance.get("/user/profile");
  return response.data;
};

const getGoogleAuthUrl = async () => {
  const response = await axiosInstance.get("/auth/google");
  return response.data;
};

export const authApi = {
  login,
  register,
  logout,
  verifyEmail,
  profile,
  getGoogleAuthUrl,
};
