'use client';

import type { AuthResponse, AuthUser } from '@/types/mercadito';

const tokenKey = 'mercadito_token';
const userKey = 'mercadito_user';
const sessionEvent = 'mercadito_session_changed';

function emitSessionChange() {
  window.dispatchEvent(new Event(sessionEvent));
}

export function saveSession(session: AuthResponse) {
  localStorage.setItem(tokenKey, session.token);
  localStorage.setItem(userKey, JSON.stringify(session.user));
  emitSessionChange();
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
  emitSessionChange();
}

export function onSessionChange(listener: () => void) {
  window.addEventListener(sessionEvent, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(sessionEvent, listener);
    window.removeEventListener('storage', listener);
  };
}
