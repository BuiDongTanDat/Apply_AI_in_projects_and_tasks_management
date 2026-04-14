import axiosInstance from "./axiosInstance";
import { NotificationResponse } from "@/types/notification.type";

const getNotifications = async (page: number = 1, limit: number = 20) => {
  const response = await axiosInstance.get<NotificationResponse>("/notifications", {
    params: { page, limit },
  });
  return response.data;
};

const markAsRead = async (id: number) => {
  const response = await axiosInstance.patch(`/notifications/${id}/read`);
  return response.data;
};

export const notificationApi = {
  getNotifications,
  markAsRead,
};
