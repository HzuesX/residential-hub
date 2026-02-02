import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, AuthResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add tenant ID if available
    const societyId = localStorage.getItem('societyId');
    if (societyId) {
      config.headers['X-Tenant-Id'] = societyId;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post<ApiResponse<AuthResponse>>(
            `${API_BASE_URL}/api/v1/auth/refresh`,
            { refreshToken }
          );
          
          if (response.data.success && response.data.data) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
export const api = {
  get: <T,>(url: string, params?: Record<string, unknown>) => 
    apiClient.get<ApiResponse<T>>(url, { params }).then(res => res.data),
    
  post: <T,>(url: string, data?: unknown) => 
    apiClient.post<ApiResponse<T>>(url, data).then(res => res.data),
    
  put: <T,>(url: string, data?: unknown) => 
    apiClient.put<ApiResponse<T>>(url, data).then(res => res.data),
    
  patch: <T,>(url: string, data?: unknown) => 
    apiClient.patch<ApiResponse<T>>(url, data).then(res => res.data),
    
  delete: <T,>(url: string) => 
    apiClient.delete<ApiResponse<T>>(url).then(res => res.data),
};

// Auth API
export const authApi = {
  login: (username: string, password: string) => 
    api.post<AuthResponse>('/api/v1/auth/login', { username, password }),
    
  register: (data: unknown) => 
    api.post<AuthResponse>('/api/v1/auth/register', data),
    
  refresh: (refreshToken: string) => 
    api.post<AuthResponse>('/api/v1/auth/refresh', { refreshToken }),
    
  logout: () => 
    api.post<void>('/api/v1/auth/logout'),
    
  validate: () => 
    api.get<boolean>('/api/v1/auth/validate'),
};

// User API
export const userApi = {
  getCurrentUser: () => 
    api.get<unknown>('/api/v1/users/me'),
    
  getUsers: (societyId: string) => 
    api.get<unknown[]>(`/api/v1/users/society/${societyId}`),
    
  getUserById: (id: string) => 
    api.get<unknown>(`/api/v1/users/${id}`),
    
  updateUser: (id: string, data: unknown) => 
    api.put<unknown>(`/api/v1/users/${id}`, data),
    
  checkUsername: (username: string) => 
    api.get<boolean>(`/api/v1/users/check-username?username=${username}`),
};

// Society API
export const societyApi = {
  getSocieties: () => 
    api.get<unknown[]>('/api/v1/societies'),
    
  getSociety: (id: string) => 
    api.get<unknown>(`/api/v1/societies/${id}`),
    
  createSociety: (data: unknown) => 
    api.post<unknown>('/api/v1/societies', data),
    
  updateSociety: (id: string, data: unknown) => 
    api.put<unknown>(`/api/v1/societies/${id}`, data),
};

// Visitor API
export const visitorApi = {
  getVisitors: (societyId: string) => 
    api.get<unknown[]>(`/api/v1/visitors/society/${societyId}`),
    
  getTodayVisitors: (societyId: string) => 
    api.get<unknown[]>(`/api/v1/visitors/society/${societyId}/today`),
    
  createVisitor: (data: unknown) => 
    api.post<unknown>('/api/v1/visitors', data),
    
  approveVisitor: (id: string) => 
    api.post<unknown>(`/api/v1/visitors/${id}/approve`),
    
  rejectVisitor: (id: string, reason: string) => 
    api.post<unknown>(`/api/v1/visitors/${id}/reject?reason=${encodeURIComponent(reason)}`),
    
  checkIn: (id: string) => 
    api.post<unknown>(`/api/v1/visitors/${id}/checkin`),
    
  checkOut: (id: string) => 
    api.post<unknown>(`/api/v1/visitors/${id}/checkout`),
    
  getStats: (societyId: string) => 
    api.get<unknown>(`/api/v1/visitors/society/${societyId}/stats`),
};

// Maintenance API
export const maintenanceApi = {
  getRequests: (societyId: string) => 
    api.get<unknown[]>(`/api/v1/maintenance/society/${societyId}`),
    
  createRequest: (data: unknown) => 
    api.post<unknown>('/api/v1/maintenance', data),
    
  updateRequest: (id: string, data: unknown) => 
    api.put<unknown>(`/api/v1/maintenance/${id}`, data),
    
  assignRequest: (id: string, assignedTo: string) => 
    api.post<unknown>(`/api/v1/maintenance/${id}/assign`, { assignedTo }),
};

// Announcement API
export const announcementApi = {
  getAnnouncements: (societyId: string) => 
    api.get<unknown[]>(`/api/v1/announcements/society/${societyId}`),
    
  createAnnouncement: (data: unknown) => 
    api.post<unknown>('/api/v1/announcements', data),
    
  updateAnnouncement: (id: string, data: unknown) => 
    api.put<unknown>(`/api/v1/announcements/${id}`, data),
    
  deleteAnnouncement: (id: string) => 
    api.delete<void>(`/api/v1/announcements/${id}`),
};

// Social API
export const socialApi = {
  getPosts: (societyId: string) => 
    api.get<unknown[]>(`/api/v1/social/posts/society/${societyId}`),
    
  createPost: (data: unknown) => 
    api.post<unknown>('/api/v1/social/posts', data),
    
  likePost: (postId: string) => 
    api.post<unknown>(`/api/v1/social/posts/${postId}/like`),
    
  getComments: (postId: string) => 
    api.get<unknown[]>(`/api/v1/social/posts/${postId}/comments`),
    
  addComment: (postId: string, content: string) => 
    api.post<unknown>(`/api/v1/social/posts/${postId}/comments`, { content }),
    
  getMessages: () => 
    api.get<unknown[]>('/api/v1/social/messages'),
    
  sendMessage: (receiverId: string, content: string) => 
    api.post<unknown>('/api/v1/social/messages', { receiverId, content }),
};

// Analytics API
export const analyticsApi = {
  getDashboardStats: (societyId: string) => 
    api.get<unknown>(`/api/v1/analytics/dashboard/${societyId}`),
    
  getVisitorStats: (societyId: string, period: string) => 
    api.get<unknown>(`/api/v1/analytics/visitors/${societyId}?period=${period}`),
    
  getPaymentStats: (societyId: string) => 
    api.get<unknown>(`/api/v1/analytics/payments/${societyId}`),
};

// Payment API
export const paymentApi = {
  getPayments: (societyId: string) => 
    api.get<unknown[]>(`/api/v1/payments/society/${societyId}`),
    
  getMyPayments: () => 
    api.get<unknown[]>('/api/v1/payments/my'),
    
  createPayment: (data: unknown) => 
    api.post<unknown>('/api/v1/payments', data),
    
  processPayment: (paymentId: string, paymentMethodId: string) => 
    api.post<unknown>(`/api/v1/payments/${paymentId}/process`, { paymentMethodId }),
};

// Audit API
export const auditApi = {
  getLogs: (societyId: string, params?: Record<string, unknown>) => 
    api.get<unknown[]>(`/api/v1/audit/society/${societyId}`, params),
    
  getUserLogs: (userId: string) => 
    api.get<unknown[]>(`/api/v1/audit/user/${userId}`),
};

export default apiClient;
