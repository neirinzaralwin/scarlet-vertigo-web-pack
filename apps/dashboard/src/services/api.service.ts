import { getAuthCookie } from '@/utils/authCookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

export interface RequestConfig extends RequestInit {
    requiresAuth?: boolean;
}

export class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
        const { requiresAuth = true, headers: customHeaders = {}, ...restConfig } = config;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Add custom headers
        if (customHeaders) {
            Object.entries(customHeaders).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    headers[key] = value;
                }
            });
        }

        // Add auth token if required
        if (requiresAuth) {
            const token = getAuthCookie();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, {
                ...restConfig,
                headers,
            });

            // Handle common HTTP errors
            if (response.status === 401) {
                console.error('Unauthorized access - token may be expired');
                throw new Error('Authentication token not found or expired.');
            }

            if (response.status === 403) {
                throw new Error('Access forbidden - insufficient permissions.');
            }

            if (response.status === 404) {
                throw new Error('Resource not found.');
            }

            if (!response.ok) {
                const errorData = await response.text();
                console.error(`API Error (${response.status}):`, errorData);
                throw new Error(`API Error: ${response.statusText} - ${errorData}`);
            }

            // Handle 204 No Content responses
            if (response.status === 204) {
                return {} as T;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error instanceof Error ? error : new Error('An unexpected error occurred.');
        }
    }

    // HTTP Methods
    async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, { ...config, method: 'GET' });
    }

    async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, { ...config, method: 'DELETE' });
    }

    // File upload method for multipart form data
    async uploadFiles<T>(endpoint: string, formData: FormData, config?: Omit<RequestConfig, 'headers'>): Promise<T> {
        const { requiresAuth = true, ...restConfig } = config || {};

        const headers: HeadersInit = {};

        // Add auth token if required
        if (requiresAuth) {
            const token = getAuthCookie();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        // Don't set Content-Type for FormData - browser will set it with boundary

        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: formData,
                ...restConfig,
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error(`Upload failed (${response.status}):`, errorData);
                throw new Error(`Upload failed: ${response.statusText} - ${errorData}`);
            }

            return await response.json();
        } catch (error) {
            console.error('File upload failed:', error);
            throw error instanceof Error ? error : new Error('File upload failed.');
        }
    }
}

// Create and export a default instance
export const apiService = new ApiService();
