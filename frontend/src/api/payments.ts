import apiClient from './client';
import type { Allocation, Paiement } from '../types';

export const paymentApi = {
  // Allocations
  getAllocations: async (): Promise<Allocation[]> => {
    const res = await apiClient.get('/api/payments/allocations');
    return Array.isArray(res.data) ? res.data : res.data.content || [];
  },
  getAllocationById: async (id: string): Promise<Allocation> => {
    const res = await apiClient.get(`/api/payments/allocations/${id}`);
    return res.data;
  },
  createAllocation: async (data: Partial<Allocation>): Promise<Allocation> => {
    const res = await apiClient.post('/api/payments/allocations', data);
    return res.data;
  },
  updateAllocationStatus: async (id: string, statut: string): Promise<Allocation> => {
    const res = await apiClient.put(`/api/payments/allocations/${id}/status`, { statut });
    return res.data;
  },

  // Paiements
  getPaiements: async (): Promise<Paiement[]> => {
    const res = await apiClient.get('/api/payments/paiements');
    return Array.isArray(res.data) ? res.data : res.data.content || [];
  },
  getPaiementsByAllocation: async (allocationId: string): Promise<Paiement[]> => {
    const res = await apiClient.get(`/api/payments/allocations/${allocationId}/paiements`);
    return Array.isArray(res.data) ? res.data : res.data.content || [];
  },
  createPaiement: async (data: Partial<Paiement>): Promise<Paiement> => {
    const res = await apiClient.post('/api/payments/paiements', data);
    return res.data;
  },
  updatePaiementStatus: async (id: string, statut: string): Promise<Paiement> => {
    const res = await apiClient.put(`/api/payments/paiements/${id}/status`, { statut });
    return res.data;
  },
};
