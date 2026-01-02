/**
 * Authentication API client for user registration and login
 */
import { API_BASE_URL } from './config';
import { useState, useEffect } from 'react';

export interface UserRegister {
  email: string;
  password: string;
  name: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface UserWithToken {
  user: UserResponse;
  access_token: string;
  token_type: string;
}

export interface AuthCheckResponse {
  authenticated: boolean;
  user?: UserResponse;
  message?: string;
}

/**
 * Register a new user
 */
export async function register(data: UserRegister): Promise<UserWithToken> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Registration failed');
  }

  return response.json();
}

/**
 * Login user
 */
export async function login(data: UserLogin): Promise<UserWithToken> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }

  return response.json();
}

/**
 * Get current user information
 */
export async function getCurrentUser(token: string): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user information');
  }

  return response.json();
}

/**
 * Check authentication status
 */
export async function checkAuth(token?: string): Promise<AuthCheckResponse> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/check`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    return { authenticated: false, message: 'Guest' };
  }

  return response.json();
}

/**
 * Store authentication token
 */
export function storeAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('resumeMatcher:authToken', token);
  }
}

/**
 * Get stored authentication token
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('resumeMatcher:authToken');
  }
  return null;
}

/**
 * Remove authentication token (logout)
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('resumeMatcher:authToken');
  }
}

/**
 * Store user information
 */
export function storeUserInfo(user: UserResponse): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('resumeMatcher:user', JSON.stringify(user));
  }
}

/**
 * Get stored user information
 */
export function getUserInfo(): UserResponse | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('resumeMatcher:user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Remove user information (logout)
 */
export function removeUserInfo(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('resumeMatcher:user');
  }
}

/**
 * Complete logout - remove all auth data
 */
export function logout(): void {
  removeAuthToken();
  removeUserInfo();
}

/**
 * Custom hook to get authentication status and user info
 */
export function useAuth() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getUserInfo();

    if (token && storedUser) {
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
