import apiClient from './client';

export interface SupportTicket {
  id: number;
  nom: string;
  email: string;
  sujet: string;
  message: string;
  statut: 'OUVERT' | 'RESOLU';
  createdAt: string;
  resolvedAt?: string;
}

export const supportApi = {
  submit: async (data: { nom: string; email: string; sujet: string; message: string }): Promise<SupportTicket> => {
    const res = await apiClient.post('/api/admin/support', data);
    return res.data;
  },

  getAll: async (): Promise<SupportTicket[]> => {
    const res = await apiClient.get('/api/admin/support');
    return Array.isArray(res.data) ? res.data : [];
  },

  resolve: async (id: number): Promise<SupportTicket> => {
    const res = await apiClient.patch(`/api/admin/support/${id}/resolve`);
    return res.data;
  },
};
