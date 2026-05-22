'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Business } from '@/types/mercadito';

export default function RestaurantDashboardPage() {
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    void apiFetch<Business>('/business/me', { token })
      .then(setBusiness)
      .catch(() => setBusiness(null));
  }, []);

  const hasRestaurant = business?.modules?.includes('restaurant');

  return (
    <AuthGuard>
      <DashboardLayout>
        <section className="surface rounded-lg p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-jade">
            Modulo premium
          </p>
          <h1 className="mt-1 text-3xl font-bold text-ink">Restaurante</h1>
          {hasRestaurant ? (
            <>
              <p className="mt-3 max-w-2xl text-black/60">
                Maneja mesas, links QR y pedidos simples desde el menu digital del
                negocio.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Link className="surface rounded-lg p-5 hover:border-jade" href="/dashboard/restaurant/tables">
                  <h2 className="text-xl font-bold text-ink">Mesas</h2>
                  <p className="mt-2 text-sm text-black/60">
                    Crea mesas, genera QR y comparte el link publico.
                  </p>
                </Link>
                <Link className="surface rounded-lg p-5 hover:border-jade" href="/dashboard/restaurant/orders">
                  <h2 className="text-xl font-bold text-ink">Pedidos</h2>
                  <p className="mt-2 text-sm text-black/60">
                    Revisa pedidos por mesa y cambia el estado operativo.
                  </p>
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-lg bg-maize/15 p-5">
              <h2 className="text-xl font-bold text-ink">
                Activa el modulo restaurante para manejar mesas, pedidos y menu QR.
              </h2>
              <p className="mt-2 text-sm text-black/60">
                CodeQuetzal puede habilitarlo manualmente desde el backoffice para
                negocios de comida con plan premium.
              </p>
            </div>
          )}
        </section>
      </DashboardLayout>
    </AuthGuard>
  );
}
