import apiClient from './client';
import type { AuditLog } from '../types';

export const auditApi = {
  getAll: async (params?: { page?: number; size?: number; search?: string }): Promise<AuditLog[]> => {
    const res = await apiClient.get('/api/audit', { params });
    return Array.isArray(res.data) ? res.data : res.data.content || [];
  },
  getByEntity: async (entite: string, entiteId: string): Promise<AuditLog[]> => {
    const res = await apiClient.get(`/api/audit/${entite}/${entiteId}`);
    return Array.isArray(res.data) ? res.data : res.data.content || [];
  },
};
