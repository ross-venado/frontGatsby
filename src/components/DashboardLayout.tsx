'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { activeModuleLinks } from '@/lib/business-modules';
import { clearSession, getUser } from '@/lib/auth';
import type { AuthUser, Business } from '@/types/mercadito';

const links = [
  { href: '/dashboard', label: 'Negocio' },
  { href: '/dashboard/categories', label: 'Categorias' },
  { href: '/dashboard/products', label: 'Productos' },
  { href: '/dashboard/services', label: 'Servicios' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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

  const businessLinks = [...links, ...activeModuleLinks(business)];

  const visibleLinks =
    user?.role === 'admin'
      ? [...links, { href: '/cq-backoffice', label: 'Backoffice' }]
      : businessLinks;

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-5 md:grid-cols-[260px_1fr] md:py-8">
      <aside className="h-fit rounded-2xl border border-black/10 bg-white p-4 shadow-soft md:sticky md:top-6">
        <div className="rounded-xl bg-ink p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-jade/90">
            Panel del negocio
          </p>
          <p className="mt-2 text-lg font-black leading-tight">
            {business?.name || user?.name || 'Mi local'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-white/10 px-2.5 py-1">
              {business?.plan || 'plan'}
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1">
              {business?.status || 'estado'}
            </span>
          </div>
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 md:grid md:overflow-visible md:pb-0">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                pathname === link.href
                  ? 'bg-jade text-white shadow-sm'
                  : 'text-black/65 hover:bg-black/5 hover:text-ink'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          className="btn-secondary mt-5 w-full justify-center"
          onClick={() => {
            clearSession();
            router.push('/login');
          }}
        >
          Salir
        </button>
      </aside>
      <section className="min-w-0">{children}</section>
    </main>
  );
}
