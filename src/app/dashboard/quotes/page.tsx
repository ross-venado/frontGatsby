'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ModulePlaceholder } from '@/components/ModulePlaceholder';

export default function QuotesPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <ModulePlaceholder
          actions={[
            { href: '/dashboard/services', label: 'Administrar servicios' },
            { href: '/dashboard/products', label: 'Administrar productos' },
          ]}
          description="Modulo preparado para negocios que venden por consulta, medidas o trabajo personalizado. Por ahora usa productos y servicios para armar el catalogo y recibir solicitudes por WhatsApp."
          eyebrow="Modulo plus"
          items={[
            'Catalogo con servicios cotizables',
            'Productos con precio visible o referencia',
            'Solicitud por WhatsApp desde la pagina publica',
            'Historial de cotizaciones persistente en siguiente fase',
          ]}
          title="Cotizaciones"
        />
      </DashboardLayout>
    </AuthGuard>
  );
}
