import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hook';
import { notificationApi } from '@/api/notification.api';
import { markAsReadLocally } from '@/store/slices/notification';
import NotificationItem from './NotificationItem';
import { NotificationItem as NotificationType } from '@/types/notification.type';
import { BellOff } from 'lucide-react';
import { useNavigate } from 'react-router';

interface NotificationListProps {
  onItemClick?: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ onItemClick }) => {
  const { notifications, isLoading } = useAppSelector((state) => state.notification);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: NotificationType) => {
    // Navigate and auto-hide popover
    if (onItemClick) {
      onItemClick();
    }

    if (!notification.isRead) {
      // Optimistic update
      dispatch(markAsReadLocally(notification.id));
      try {
        await notificationApi.markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read', error);
      }
    }

    // Navigate logic based on metadata
    if (notification.metadata?.taskId) {
      navigate(`/task?taskId=${notification.metadata.taskId}`);
    }
  };

  return (
    <div className="w-80 max-h-[400px] flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        {/* Optional: Add "Mark all as read" button here in future */}
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {isLoading && notifications.length === 0 ? (
          <div className="p-4 flex justify-center items-center">
            <span className="text-gray-400 text-sm">Loading...</span>
          </div>
        ) : notifications.length > 0 ? (
          <div className="flex flex-col">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
              <BellOff className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-sm">All caught up!</p>
            <p className="text-gray-400 text-xs mt-1">Check back later for new notifications.</p>
          </div>
        )}
      </div>
      
      {notifications.length > 0 && (
         <div className="p-2 border-t border-gray-100 text-center sticky bottom-0 bg-white">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors py-1 px-3 rounded-md hover:bg-blue-50 w-full">
               View All
            </button>
         </div>
      )}
    </div>
  );
};

export default NotificationList;
