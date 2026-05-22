import { apiBaseUrl } from './config';

type RequestOptions = RequestInit & {
  token?: string | null;
};

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
    cache: options.cache ?? 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function money(value?: number) {
  if (value === undefined || value === null) {
    return 'Consultar';
  }

  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    maximumFractionDigits: 0,
  }).format(value);
}

export function whatsappUrl(phone?: string, businessName?: string) {
  if (!phone) {
    return null;
  }

  const normalized = phone.replace(/[^\d]/g, '');
  const text = encodeURIComponent(
    `Hola, quiero informacion sobre ${businessName || 'tu negocio'} en Mercadito Chimalteco.`,
  );

  return `https://wa.me/${normalized}?text=${text}`;
}

export function mapsUrl(address?: string, location?: { lat: number; lng: number }) {
  if (location) {
    return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
  }

  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  return null;
}
