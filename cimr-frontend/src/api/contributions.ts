import apiClient from './client';
import type { Contribution, PointsLedger, PointsPurchase, PointValue } from '../types';
import type { SimulationRequest, SimulationResponse } from '../types/simulation';

export const contributionApi = {
  // Enregistrer une contribution (Article 6)
  record: async (data: Partial<Contribution>): Promise<Contribution> => {
    const res = await apiClient.post('/api/contributions', data);
    return res.data;
  },

  getAll: async (): Promise<Contribution[]> => {
    const res = await apiClient.get('/api/contributions');
    return Array.isArray(res.data) ? res.data : res.data.content || [];
  },

  recordPoints: async (data: Partial<PointsLedger>): Promise<PointsLedger> => {
    const res = await apiClient.post('/api/contributions/points', data);
    return res.data;
  },

  getLivret: async (affilieId: string): Promise<any> => {
    const res = await apiClient.get(`/api/contributions/affilies/${affilieId}/livret`);
    return res.data;
  },

  getHistory: async (affilieId: string): Promise<Contribution[]> => {
    const res = await apiClient.get(`/api/contributions/history/${affilieId}`);
    return Array.isArray(res.data) ? res.data : res.data.content || [];
  },

  getPoints: async (affilieId: string): Promise<any> => {
    const res = await apiClient.get(`/api/contributions/points/${affilieId}`);
    return res.data;
  },

  setPointValue: async (data: Partial<PointValue>): Promise<PointValue> => {
    const res = await apiClient.post('/api/contributions/point-values', data);
    return res.data;
  },

  getPointValue: async (year: number): Promise<PointValue> => {
    const res = await apiClient.get(`/api/contributions/point-values/${year}`);
    return res.data;
  },

  getAllPointValues: async (): Promise<PointValue[]> => {
    const res = await apiClient.get('/api/contributions/point-values');
    return Array.isArray(res.data) ? res.data : [];
  },

  // ===== ACHAT DE POINTS =====
  submitPointsPurchase: async (data: FormData): Promise<PointsPurchase> => {
    const res = await apiClient.post('/api/contributions/points/purchase', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getAllPointsPurchases: async (): Promise<PointsPurchase[]> => {
    const res = await apiClient.get('/api/contributions/points/purchase');
    return Array.isArray(res.data) ? res.data : res.data.content || [];
  },

  getMyPointsPurchases: async (affilieId: string): Promise<PointsPurchase[]> => {
    const res = await apiClient.get(`/api/contributions/points/purchase/affilie/${affilieId}`);
    return Array.isArray(res.data) ? res.data : res.data.content || [];
  },

  validatePointsPurchase: async (id: string): Promise<PointsPurchase> => {
    const res = await apiClient.put(`/api/contributions/points/purchase/${id}/validate`);
    return res.data;
  },

  rejectPointsPurchase: async (id: string, motif: string): Promise<PointsPurchase> => {
    const res = await apiClient.put(`/api/contributions/points/purchase/${id}/reject`, { motif });
    return res.data;
  },

  // ===== SIMULATION =====
  simulatePension: async (data: SimulationRequest): Promise<SimulationResponse> => {
    const res = await apiClient.post('/api/contributions/simulate', data);
    return res.data;
  },
};
