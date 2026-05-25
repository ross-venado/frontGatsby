'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { clearSession, getUser } from '@/lib/auth';
import type { AuthUser, Business } from '@/types/mercadito';

const links = [
  { href: '/dashboard', label: 'Negocio' },
  { href: '/dashboard/categories', label: 'Categorias' },
  { href: '/dashboard/products', label: 'Productos' },
  { href: '/dashboard/services', label: 'Servicios' },
];

function businessCategorySlug(business: Business | null) {
  if (!business?.categoryId || typeof business.categoryId !== 'object') {
    return '';
  }

  return business.categoryId.slug;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    const sessionUser = getUser();
    setUser(sessionUser);
    const token = localStorage.getItem('mercadito_token');
    if (!token || sessionUser?.role !== 'business_owner') return;

    void apiFetch<Business>('/business/me', { token })
      .then(setBusiness)
      .catch(() => setBusiness(null));
  }, []);

  const moduleLinks = [];

  if (businessCategorySlug(business) === 'tiendas') {
    moduleLinks.push({ href: '/dashboard/inventory', label: 'Inventario' });
  }

  if (business?.modules?.includes('restaurant')) {
    moduleLinks.push(
      { href: '/dashboard/restaurant', label: 'Restaurante' },
      { href: '/dashboard/restaurant/tables', label: 'Mesas' },
      { href: '/dashboard/restaurant/orders', label: 'Pedidos' },
    );
  }

  if (business?.modules?.includes('quotes')) {
    moduleLinks.push({ href: '/dashboard/quotes', label: 'Cotizaciones' });
  }

  if (business?.modules?.includes('appointments')) {
    moduleLinks.push({ href: '/dashboard/appointments', label: 'Citas' });
  }

  if (business?.modules?.includes('automotive')) {
    moduleLinks.push({ href: '/dashboard/automotive', label: 'Automotriz' });
  }

  if (business?.modules?.includes('workshop')) {
    moduleLinks.push({ href: '/dashboard/workshop', label: 'Taller' });
  }

  const businessLinks = [...links, ...moduleLinks];

  const visibleLinks =
    user?.role === 'admin'
      ? [...links, { href: '/cq-backoffice', label: 'Backoffice' }]
      : businessLinks;

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr] md:py-8">
      <aside className="surface h-fit rounded-lg p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-jade">
          Panel
        </p>
        <p className="mt-1 text-sm font-semibold text-ink">
          {user?.name || 'Usuario'}
        </p>
        <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 md:grid md:overflow-visible md:pb-0">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-black/70 hover:bg-black/5"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          className="btn-secondary mt-5 w-full"
          onClick={() => {
            clearSession();
            router.push('/login');
          }}
        >
          Salir
        </button>
      </aside>
      <section>{children}</section>
    </main>
  );
}
