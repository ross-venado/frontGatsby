'use client';

import type { AuthResponse, AuthUser } from '@/types/mercadito';

const tokenKey = 'mercadito_token';
const userKey = 'mercadito_user';

export function saveSession(session: AuthResponse) {
  localStorage.setItem(tokenKey, session.token);
  localStorage.setItem(userKey, JSON.stringify(session.user));
}

export function getToken() {
  return localStorage.getItem(tokenKey);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(userKey);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function clearSession() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
}
