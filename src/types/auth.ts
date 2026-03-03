/**
 * Auth Types
 * Type definitions matching TribunApp backend Auth DTOs
 */

export interface UserDto {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  roles: string[];
  isActive: boolean;
  emailConfirmed: boolean;
  lastLoginAt: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface GoogleSignInRequest {
  idToken: string;
}

export interface AppleSignInRequest {
  identityToken: string;
  fullName?: string;
  nonce?: string;
}
