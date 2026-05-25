'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ModulePlaceholder } from '@/components/ModulePlaceholder';

export default function WorkshopPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <ModulePlaceholder
          actions={[{ href: '/dashboard/services', label: 'Administrar servicios' }]}
          description="Modulo preparado para talleres mecanicos, herreria, PVC, vidrio y aluminio. El flujo actual permite publicar servicios y recibir contacto directo."
          eyebrow="Modulo plus"
          items={[
            'Servicios por categoria interna',
            'Rangos de precio',
            'Solicitud por WhatsApp',
            'Ordenes de trabajo en siguiente fase',
          ]}
          title="Talleres y servicios tecnicos"
        />
      </DashboardLayout>
    </AuthGuard>
  );
}
