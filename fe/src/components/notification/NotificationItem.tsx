import React from 'react';
import { cn } from '@/lib/utils';
import { NotificationItem as NotificationType } from '@/types/notification.type';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Bell, CheckCircle2 } from 'lucide-react';

dayjs.extend(relativeTime);

interface NotificationItemProps {
  notification: NotificationType;
  onClick: (notification: NotificationType) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const { isRead, title, content, createdAt } = notification;

  return (
    <div
      onClick={() => onClick(notification)}
      className={cn(
        "flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 relative group",
        !isRead ? "bg-white" : "bg-transparent"
      )}
    >
      {/* Unread Indicator */}
      {!isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-r-md"></div>
      )}

      {/* Icon Area */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5",
        !isRead ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
      )}>
        {notification.type.includes('CREATED') || notification.type.includes('UPDATED') ? (
           <CheckCircle2 size={16} />
        ) : (
           <Bell size={16} />
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className={cn(
            "text-sm font-medium truncate",
            !isRead ? "text-gray-900" : "text-gray-700"
          )}>
            {title}
          </p>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {dayjs(createdAt).fromNow()}
          </span>
        </div>
        <p className={cn(
          "text-xs line-clamp-2",
          !isRead ? "text-gray-600" : "text-gray-500"
        )}>
          {content}
        </p>
      </div>
      
      {/* Unread Dot (Alternative visual cue inside) */}
      {!isRead && (
         <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
      )}
    </div>
  );
};

export default NotificationItem;
