import apiClient from './client';
import type { LoginRequest, AuthUser } from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthUser> => {
    const res = await apiClient.post('/api/auth/login', data);
    return res.data;
  },

  forgotPassword: async (usernameOrEmail: string): Promise<void> => {
    await apiClient.post('/api/auth/forgot-password', { usernameOrEmail });
  },

  validateResetToken: async (token: string): Promise<boolean> => {
    const res = await apiClient.get(`/api/auth/validate-token?token=${token}`);
    return res.data.valid;
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/api/auth/reset-password', { token, newPassword });
  },
};
