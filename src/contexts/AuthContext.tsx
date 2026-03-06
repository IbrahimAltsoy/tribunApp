import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { authService } from '../services/authService';
import type { UserDto, AuthResponse } from '../types/auth';

// Lazy-load GoogleSignin — not bundled in Expo Go runtime
type GoogleSigninType = typeof import('@react-native-google-signin/google-signin').GoogleSignin;
let GoogleSignin: GoogleSigninType | null = null;

const isExpoGo = Constants.appOwnership === 'expo';
if (!isExpoGo) {
  try {
    const mod = require('@react-native-google-signin/google-signin');
    GoogleSignin = mod.GoogleSignin as GoogleSigninType;
    GoogleSignin!.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
    });
  } catch {
    // Native module not available in this environment
  }
}

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  authState: AuthState;
  user: UserDto | null;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirmPassword: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  getToken: () => Promise<string | null>;
  updateUser: (updatedUser: UserDto) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<UserDto | null>(null);

  // On mount: check stored tokens
  useEffect(() => {
    (async () => {
      try {
        const storedUser = await authService.getStoredUser();
        const token = await authService.getAccessToken();

        if (!storedUser || !token) {
          setAuthState('unauthenticated');
          return;
        }

        // Try to refresh if expired
        const expired = await authService.isTokenExpired();
        if (expired) {
          const refreshed = await authService.refreshToken();
          if (refreshed) {
            setUser(refreshed.user);
            setAuthState('authenticated');
          } else {
            setAuthState('unauthenticated');
          }
        } else {
          setUser(storedUser);
          setAuthState('authenticated');
        }
      } catch {
        setAuthState('unauthenticated');
      }
    })();
  }, []);

  const handleAuthResponse = (response: AuthResponse) => {
    setUser(response.user);
    setAuthState('authenticated');
  };

  const login = useCallback(async (emailOrUsername: string, password: string) => {
    const response = await authService.login({ emailOrUsername, password });
    handleAuthResponse(response);
  }, []);

  const register = useCallback(async (
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
    displayName?: string,
  ) => {
    const response = await authService.register({ username, email, password, confirmPassword, displayName });
    handleAuthResponse(response);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setAuthState('unauthenticated');
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!GoogleSignin) {
      throw new Error('Google ile giriş bu ortamda desteklenmiyor. Gerçek cihaz veya development build gereklidir.');
    }
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const signInResult = await GoogleSignin.signIn();
    const idToken = signInResult.data?.idToken;
    if (!idToken) throw new Error('Google ID token alınamadı.');
    const response = await authService.googleSignIn({ idToken });
    handleAuthResponse(response);
  }, []);

  const signInWithApple = useCallback(async () => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const identityToken = credential.identityToken;
    if (!identityToken) throw new Error('Apple identity token alınamadı.');

    const fullName = credential.fullName
      ? [credential.fullName.givenName, credential.fullName.familyName]
          .filter(Boolean)
          .join(' ')
      : undefined;

    const response = await authService.appleSignIn({
      identityToken,
      fullName: fullName || undefined,
    });
    handleAuthResponse(response);
  }, []);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    const result = await authService.refreshToken();
    if (result) {
      setUser(result.user);
      setAuthState('authenticated');
      return true;
    }
    setUser(null);
    setAuthState('unauthenticated');
    return false;
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    const expired = await authService.isTokenExpired();
    if (expired) {
      const result = await authService.refreshToken();
      if (!result) {
        setUser(null);
        setAuthState('unauthenticated');
        return null;
      }
      setUser(result.user);
    }
    return authService.getAccessToken();
  }, []);

  const updateUser = useCallback((updatedUser: UserDto) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{ authState, user, login, register, logout, signInWithGoogle, signInWithApple, refreshAuth, getToken, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
