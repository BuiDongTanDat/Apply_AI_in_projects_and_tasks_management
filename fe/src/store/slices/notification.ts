import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NotificationItem } from "@/types/notification.type";

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isConnected: boolean;
  page: number;
  limit: number;
  total: number;
  isLoading: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  page: 1,
  limit: 20,
  total: 0,
  isLoading: false,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications: (
      state,
      action: PayloadAction<{ items: NotificationItem[]; total: number; page: number }>
    ) => {
      state.notifications = action.payload.items;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.unreadCount = action.payload.items.filter((item) => !item.isRead).length;
    },
    prependNotification: (state, action: PayloadAction<NotificationItem>) => {
      // Check if it already exists to prevent duplicate prepends
      const exists = state.notifications.some((n) => n.id === action.payload.id);
      if (!exists) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
        state.total += 1;
      }
    },
    markAsReadLocally: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setNotifications,
  prependNotification,
  markAsReadLocally,
  setConnected,
  setLoading,
} = notificationSlice.actions;

export default notificationSlice.reducer;
