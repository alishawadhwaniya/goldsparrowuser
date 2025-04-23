import { API_BASE_URL, ApiError, ApiResponse, DEFAULT_HEADERS } from './config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiClient {
  private static instance: ApiClient;
  private token: string | null = null;
  private axiosInstance;

  private constructor() {
    this.token = localStorage.getItem('token');

    // Create an Axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: DEFAULT_HEADERS,
    });

    // Add a request interceptor to add the token to all requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add a response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          this.setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          // window.location.href = '/login';
        }

        if (error.response) {
          throw new ApiError(
            error.response.status,
            error.response.data.message || 'An error occurred',
            error.response.data
          );
        }

        throw new ApiError(500, 'Network error occurred');
      }
    );
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.request({
        url: endpoint,
        ...options,
      });

      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new ApiError(error.status, error.message, error.data);
      }
      throw new ApiError(500, 'Network error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      data: data,
    });
  }

  async postFormData<T>(endpoint: string, data: FormData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: data,
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      data: data,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      data: data
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = ApiClient.getInstance(); 