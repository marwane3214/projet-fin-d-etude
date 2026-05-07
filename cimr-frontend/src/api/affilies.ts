import apiClient from './client';
import type { Affilie, BulletinAffiliation, Justificatif } from '../types';

export const affilieApi = {
  getAll: async (params?: { search?: string; page?: number; size?: number }) => {
    const res = await apiClient.get('/api/affilies', { params });
    return Array.isArray(res.data) ? res.data : res.data.content || [];
  },
  getById: async (id: string): Promise<Affilie> => {
    const res = await apiClient.get(`/api/affilies/${id}`);
    return res.data;
  },
  create: async (data: Partial<Affilie>): Promise<Affilie> => {
    const res = await apiClient.post('/api/affilies', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Affilie>): Promise<Affilie> => {
    const res = await apiClient.put(`/api/affilies/${id}`, data);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/affilies/${id}`);
  },
  updatePersonalInfo: async (id: string, data: { adresse?: string; situationFamiliale?: string; ville?: string }): Promise<Affilie> => {
    const res = await apiClient.patch(`/api/affilies/${id}/personal-info`, data);
    return res.data;
  },
  updateCndpConsent: async (id: string, consent: boolean): Promise<Affilie> => {
    const res = await apiClient.patch(`/api/affilies/${id}/cndp-consent`, { consent });
    return res.data;
  },
  addBulletin: async (id: string, bulletin: Partial<BulletinAffiliation>): Promise<BulletinAffiliation> => {
    const res = await apiClient.post(`/api/affilies/${id}/bulletins`, bulletin);
    return res.data;
  },
  addJustificatif: async (id: string, justificatif: Partial<Justificatif>): Promise<Justificatif> => {
    const res = await apiClient.post(`/api/affilies/${id}/documents`, justificatif);
    return res.data;
  },
  uploadJustificatif: async (id: string, file: File, nom: string, typeDocument: string): Promise<Justificatif> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('nom', nom);
    formData.append('typeDocument', typeDocument);
    const res = await apiClient.post(`/api/affilies/${id}/documents/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  getPoints: async (id: string): Promise<any> => {
    const res = await apiClient.get(`/api/affilies/${id}/points`);
    return res.data;
  },
  getContributions: async (id: string): Promise<any[]> => {
    const res = await apiClient.get(`/api/affilies/${id}/contributions`);
    return res.data;
  },
  suspend: async (id: string): Promise<Affilie> => {
    const res = await apiClient.post(`/api/affilies/${id}/suspend`);
    return res.data;
  },
  radiate: async (id: string, motif: string, contributionComp?: number): Promise<Affilie> => {
    const res = await apiClient.post(`/api/affilies/${id}/radiate`, { motif, contributionCompensatrice: contributionComp });
    return res.data;
  },
  exportData: async (id: string): Promise<Record<string, unknown>> => {
    const res = await apiClient.get(`/api/affilies/${id}/export`);
    return res.data;
  },
  anonymize: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/affilies/${id}`);
  },
};
