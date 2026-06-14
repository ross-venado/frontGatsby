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

    if (response.status === 413) {
      throw new Error(
        'El archivo o la informacion enviada es demasiado grande. Usa una imagen mas liviana o pega un enlace de imagen.',
      );
    }

    let parsedMessage = '';
    try {
      const parsed = JSON.parse(message) as { message?: string | string[] };
      if (Array.isArray(parsed.message)) {
        parsedMessage = parsed.message.join(', ');
      } else {
        parsedMessage = parsed.message || '';
      }
    } catch {
      parsedMessage = message;
    }
    throw new Error(parsedMessage || `La API respondio con error ${response.status}`);
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

export function whatsappMessageUrl(phone?: string, message?: string) {
  if (!phone || !message) {
    return null;
  }

  const normalized = phone.replace(/[^\d]/g, '');
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
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

export type PublicAnalyticsEvent =
  | 'business_view'
  | 'whatsapp_click'
  | 'product_view'
  | 'service_view'
  | 'order_started';

export function trackPublicBusinessEvent(
  businessSlug: string,
  type: PublicAnalyticsEvent,
  metadata: Record<string, unknown> = {},
) {
  const payload = JSON.stringify({ type, metadata });
  const url = `${apiBaseUrl}/public/businesses/${businessSlug}/analytics`;

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
    return;
  }

  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}
