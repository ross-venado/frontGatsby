'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ItemManager } from '@/components/ItemManager';

export default function InventoryPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-5">
          <section className="surface rounded-lg p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-jade">
              Tiendas
            </p>
            <h1 className="mt-1 text-3xl font-bold text-ink">Inventario</h1>
            <p className="mt-3 max-w-2xl text-black/60">
              Controla productos, fotos, precios, estado y stock disponible para
              tu tienda.
            </p>
          </section>
          <ItemManager mode="products" />
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
