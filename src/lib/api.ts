import { UnifiedTrackingInfo, TrackingEvent } from '@/app/api/utils/types';

const API_BASE_URL = '/api'; 

interface ApiResponse<T> {
  message: string;
  data?: T;
  token?: string;
  userId?: string;
  userName?: string;
  errors?: any[];
  carrier?: string;
  error?: string;
}

/**
 * @param endpoint The API endpoint (e.g., 'auth/login').
 * @param data The data to send in the request body.
 * @param token Optional: JWT token for authentication.
 * @returns The API response.
 */
export async function postApi<T>(endpoint: string, data: any, token: string | null = null): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  const result: ApiResponse<T> = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `API error: ${response.status}`);
  }
  return result;
}

/**
 * @param endpoint The API endpoint (e.g., 'track/123').
 * @param token Optional: JWT token for authentication.
 * @returns The API response.
 */
export async function getApi<T>(endpoint: string, token: string | null = null): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: 'GET',
    headers,
  });

  const result: ApiResponse<T> = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `API error: ${response.status}`);
  }
  return result;
}


export async function registerUser(data: any): Promise<ApiResponse<{ token: string; userId: string }>> {
  return postApi('auth/register', data);
}

export async function loginUser(data: any): Promise<ApiResponse<{ token: string; userId: string; userName: string }>> {
  return postApi('auth/login', data);
}

export async function trackShipment(trackingNumber: string, alias: string | undefined, token: string | null): Promise<ApiResponse<UnifiedTrackingInfo>> {
  return postApi('track', { trackingNumber, alias }, token);
}

export async function getCachedTracking(trackingNumber: string, token: string | null): Promise<ApiResponse<UnifiedTrackingInfo>> {
  return getApi(`track/${trackingNumber}`, token);
}

export async function getTrackingHistory(trackingNumber: string, token: string | null): Promise<ApiResponse<TrackingEvent[]>> {
  return getApi(`track/history/${trackingNumber}`, token);
}