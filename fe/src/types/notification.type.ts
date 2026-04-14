export interface NotificationMetadata {
  taskId?: number;
  action?: string;
  role?: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  metadata: NotificationMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  message: string;
  code: number;
  metadata: {
    notifications: NotificationItem[];
    page: {
      total: number;
      currentPage: number;
      pages: number;
    };
  };
}
