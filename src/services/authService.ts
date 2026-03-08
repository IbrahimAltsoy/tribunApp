/**
 * Auth Service
 * Handles all authentication API calls to TribunApp backend
 */

import * as SecureStore from 'expo-secure-store';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  GoogleSignInRequest,
  AppleSignInRequest,
} from '../types/auth';
import { getApiBaseUrl, joinUrl } from '../utils/apiBaseUrl';

const API_BASE_URL = getApiBaseUrl('http://localhost:5000');
const AUTH_URL = joinUrl(API_BASE_URL, '/api/auth');

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const USER_KEY = 'auth_user';

// ─── Token Storage ─────────────────────────────────────────────────────────

export const storeTokens = async (response: AuthResponse): Promise<void> => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, response.token);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken);
  await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, response.expiresAt);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));
};

export const clearTokens = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
};

export const getAccessToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

export const getStoredUser = async () => {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const isTokenExpired = async (): Promise<boolean> => {
  const expiry = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
  if (!expiry) return true;
  return new Date(expiry) <= new Date();
};

// ─── Auth Header Helper ────────────────────────────────────────────────────

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

// ─── API Calls ─────────────────────────────────────────────────────────────

const login = async (request: LoginRequest): Promise<AuthResponse> => {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || json.error || 'Giriş başarısız.');
  }

  const data: AuthResponse = json.data || json;
  await storeTokens(data);
  return data;
};

const register = async (request: RegisterRequest): Promise<void> => {
  const response = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const json = await response.json();

  if (!response.ok) {
    // Backend either returns ApiResponse { message } or ValidationProblemDetails { title, errors }
    const errorMsg =
      json.message ||
      json.error ||
      (json.errors
        ? Object.values(json.errors as Record<string, string[]>)
            .flat()
            .join(' ')
        : null) ||
      json.title ||
      'Kayıt başarısız.';
    throw new Error(errorMsg);
  }
  // Token saklanmaz — email doğrulanmadan authenticated yapılmamalı
};

const refreshToken = async (): Promise<AuthResponse | null> => {
  const storedRefreshToken = await getRefreshToken();
  if (!storedRefreshToken) return null;

  const response = await fetch(`${AUTH_URL}/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: storedRefreshToken }),
  });

  if (!response.ok) {
    await clearTokens();
    return null;
  }

  const json = await response.json();
  const data: AuthResponse = json.data || json;
  await storeTokens(data);
  return data;
};

const logout = async (): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    await fetch(`${AUTH_URL}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
    });
  } catch {
    // Ignore network errors on logout
  } finally {
    await clearTokens();
  }
};

const googleSignIn = async (request: GoogleSignInRequest): Promise<AuthResponse> => {
  const response = await fetch(`${AUTH_URL}/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || json.error || 'Google girişi başarısız.');
  }

  const data: AuthResponse = json.data || json;
  await storeTokens(data);
  return data;
};

const appleSignIn = async (request: AppleSignInRequest): Promise<AuthResponse> => {
  const response = await fetch(`${AUTH_URL}/apple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || json.error || 'Apple girişi başarısız.');
  }

  const data: AuthResponse = json.data || json;
  await storeTokens(data);
  return data;
};

const PROFILE_URL = joinUrl(API_BASE_URL, '/api/profile');

const updateProfile = async (request: {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<import('../types/auth').UserDto> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PROFILE_URL}/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(request),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Profil güncellenemedi.');
  const updated = json.data || json;
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updated));
  return updated;
};

const deleteAccount = async (): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PROFILE_URL}/me`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...headers },
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.message || 'Hesap silinemedi.');
  }
  await clearTokens();
};

const forgotPassword = async (email: string): Promise<void> => {
  const response = await fetch(`${AUTH_URL}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.message || 'İstek gönderilemedi.');
  }
};

const changePassword = async (request: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PROFILE_URL}/me/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.message || 'Şifre değiştirilemedi.');
  }
};

export const authService = {
  login,
  register,
  logout,
  refreshToken,
  googleSignIn,
  appleSignIn,
  updateProfile,
  forgotPassword,
  changePassword,
  deleteAccount,
  storeTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  isTokenExpired,
  getAuthHeaders,
};
