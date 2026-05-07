import apiClient from './client';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: string;
  referenceId?: string;
}

export const notificationApi = {
  getNotifications: async (userId: string): Promise<AppNotification[]> => {
    const res = await apiClient.get(`/api/admin/notifications/user/${userId}`);
    return res.data;
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    const res = await apiClient.get(`/api/admin/notifications/user/${userId}/unread-count`);
    return res.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/api/admin/notifications/${id}/read`);
  },
  
  createNotification: async (data: Partial<AppNotification>): Promise<AppNotification> => {
    const res = await apiClient.post('/api/admin/notifications', data);
    return res.data;
  }
};
