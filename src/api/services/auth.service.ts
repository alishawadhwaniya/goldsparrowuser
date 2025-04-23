import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export interface LoginResponse {
  token: string;
  user: {
    _id: string;
    username: string;
    role: string;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (response.success && response.data) {
      apiClient.setToken(response.data.token);
      return response.data;
    }

    throw new Error(response.message || 'Login failed');
  },

  async logout(): Promise<void> {
    try {
      const token = apiClient.getToken();
      if (token) {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
      }
      apiClient.setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the request fails, we should still clear the token
      apiClient.setToken(null);
    }
  },

  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  }
}; 