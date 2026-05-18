import apiClient from './client';
import type { DemandeLiquidation, StatutDossier } from '../types';

export const liquidationApi = {
  getAll: async (affilieId?: string) => {
    const url = affilieId ? `/api/liquidations/affilie/${affilieId}` : '/api/liquidations';
    const res = await apiClient.get(url);
    const items = Array.isArray(res.data) ? res.data : res.data.content || [];
    return items.map(mapToFrontend);
  },
  getById: async (id: string): Promise<DemandeLiquidation> => {
    const res = await apiClient.get(`/api/liquidations/${id}`);
    return mapToFrontend(res.data);
  },
  create: async (data: Partial<DemandeLiquidation>): Promise<DemandeLiquidation> => {
    const backendData = {
      affilieId: data.affilieId,
      // The backend auto sets dateDemande and status
    };
    const res = await apiClient.post('/api/liquidations', backendData);
    return mapToFrontend(res.data);
  },
  updateStatus: async (id: string, statut: string, motif?: string) => {
    const backendStatus = mapToBackendStatus(statut);
    const res = await apiClient.patch(`/api/liquidations/${id}/status?status=${backendStatus}${motif ? '&commentaire='+encodeURIComponent(motif) : ''}`);
    return mapToFrontend(res.data);
  },

  uploadDocument: async (id: string, file: File, type: string): Promise<DemandeLiquidation> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const response = await apiClient.post(`/api/liquidations/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return mapToFrontend(response.data);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToFrontend(item: any): DemandeLiquidation {
  return {
    id: item.id,
    affilieId: item.affilieId,
    affilieNom: item.affilieNom || item.nomComplet || item.affilieId,
    typeLiquidation: 'NORMALE',
    dateDepot: item.dateDemande ? item.dateDemande.split('T')[0] : new Date().toISOString().split('T')[0],
    statut: mapToFrontendStatus(item.status),
    motifRejet: item.commentaireAdmin,
    createdAt: item.dateDemande,
    documents: item.documents ? item.documents.map(mapToFrontendDocument) : []
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToFrontendDocument(doc: any): any {
  return {
    id: doc.id,
    typeDocument: doc.typeDocument,
    nomFichier: doc.fileUri ? doc.fileUri.split('/').pop() : 'Fichier',
    tailleFichier: 0,
    urlFichier: doc.fileUri,
    statut: doc.isVerified ? 'VALIDE' : 'EN_ATTENTE',
    uploadDate: new Date().toISOString()
  };
}

function mapToFrontendStatus(status: string): StatutDossier {
  switch (status) {
    case 'SUBMITTED': return 'DEPOSE';
    case 'PENDING_DOCUMENTS': return 'ATTENTE_DOCS';
    case 'UNDER_REVIEW': return 'EN_COURS';
    case 'VALIDATED': return 'VALIDE';
    case 'REJECTED': return 'REJETE';
    case 'COMPLETED': return 'LIQUIDE';
    default: return 'DEPOSE';
  }
}

function mapToBackendStatus(statut: string): string {
  switch (statut) {
    case 'DEPOSE': return 'SUBMITTED';
    case 'ATTENTE_DOCS': return 'PENDING_DOCUMENTS';
    case 'EN_COURS': return 'UNDER_REVIEW';
    case 'VALIDE': return 'VALIDATED';
    case 'REJETE': return 'REJECTED';
    case 'LIQUIDE': return 'COMPLETED';
    case 'BROUILLON': return 'SUBMITTED';
    case 'RETRACTE': return 'REJECTED';
    default: return 'SUBMITTED';
  }
}
