import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export interface UserProfile {
  _id: string;
  username: string;
  role: string;
  isActive: boolean;
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(API_ENDPOINTS.USERS.PROFILE);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch user profile');
  }
}; 