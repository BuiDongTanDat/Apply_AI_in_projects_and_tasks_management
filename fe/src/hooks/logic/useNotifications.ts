import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import {
  setNotifications,
  prependNotification,
  setConnected,
  setLoading
} from '@/store/slices/notification';
import { notificationApi } from '@/api/notification.api';
import { useLocalStorage } from './useLocalStorage';
import { alert } from '@/provider/AlertService';

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.userInfo.user?.id);
  const [storedUserId] = useLocalStorage<string>('user_id', '');

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeUserId = userId || storedUserId;

  const fetchNotifications = async () => {
    if (!activeUserId) return;
    try {
      dispatch(setLoading(true));
      const res = await notificationApi.getNotifications(1, 20);
      if (res.code === 200 && res.metadata) {
        dispatch(
          setNotifications({
            items: res.metadata.notifications,
            total: res.metadata.page.total,
            page: res.metadata.page.currentPage,
          })
        );
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const connectWebSocket = () => {
    if (!activeUserId) return;

    // Prevent duplicate connections
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const wsUrl = `ws://localhost:3000/ws/notifications?userId=${activeUserId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Notification WebSocket connected');
      dispatch(setConnected(true));
      fetchNotifications(); // Fetch initial data or missed events on reconnect
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        switch (payload.event) {
          case 'notifications:connected':
            console.log('Server acknowledged connection', payload);
            break;
          case 'notifications:new': {
            const notifData = payload.data || payload;
            dispatch(prependNotification(notifData));
            alert(notifData.content, notifData.title, 'info');
            break;
          }
          default:
            if (payload.type?.startsWith('TASK_') || payload.type?.startsWith('PROJECT_')) {
              // If the payload format is direct instead of wrapped in 'event'
              dispatch(prependNotification(payload));
              alert(payload.content, payload.title, 'info');
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing notification message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Notification WebSocket disconnected');
      dispatch(setConnected(false));
      wsRef.current = null;

      // Attempt to reconnect after 3 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        if (activeUserId) connectWebSocket();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('Notification WebSocket error:', error);
    };

    wsRef.current = ws;
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  useEffect(() => {
    if (activeUserId) {
      connectWebSocket();
    } else {
      // Disconnect if user logs out
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [activeUserId]);

  return { fetchNotifications, disconnectWebSocket };
};
