import apiClient from './client';
import type { AyantDroit } from '../types';

export const reversionApi = {
  getAll: async (): Promise<AyantDroit[]> => {
    const res = await apiClient.get('/api/reversions');
    return Array.isArray(res.data) ? res.data : res.data.content || [];
  },
  getById: async (id: string): Promise<AyantDroit> => {
    const res = await apiClient.get(`/api/reversions/${id}`);
    return res.data;
  },
  create: async (data: Partial<AyantDroit>): Promise<AyantDroit> => {
    const res = await apiClient.post('/api/reversions', data);
    return res.data;
  },
  updateStatus: async (id: string, statut: string, motif?: string): Promise<AyantDroit> => {
    const res = await apiClient.put(`/api/reversions/${id}/status`, { statut, motif });
    return res.data;
  },
  getByAffilie: async (affilieId: string): Promise<AyantDroit[]> => {
    const res = await apiClient.get(`/api/reversions/affilie/${affilieId}`);
    return Array.isArray(res.data) ? res.data : res.data.content || [];
  },
};
