import apiClient from './client';
import type { LoginRequest, AuthUser } from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthUser> => {
    const res = await apiClient.post('/api/auth/login', data);
    return res.data;
  },
};
