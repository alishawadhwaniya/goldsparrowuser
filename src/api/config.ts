console.log("import.meta.env.VITE_APP_API_URL", import.meta.env.VITE_APP_API_URL);
export const API_BASE_URL = import.meta.env.VITE_APP_API_URL; // Match your backend port

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    PROFILE: '/users/profile',
  },
  // Add other endpoint groups as needed
} as const;

// HTTP request headers
export const getAuthHeader = (token: string) => ({
  'Authorization': `Bearer ${token}`,
});

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

// Error handling
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
} 