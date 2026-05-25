'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ModulePlaceholder } from '@/components/ModulePlaceholder';

export default function AppointmentsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <ModulePlaceholder
          actions={[{ href: '/dashboard/services', label: 'Administrar servicios' }]}
          description="Modulo preparado para belleza, citas y servicios por horario. En esta fase muestra la base comercial sin agenda automatizada."
          eyebrow="Modulo plus"
          items={[
            'Servicios listos para solicitar cita',
            'Contacto directo por WhatsApp',
            'Agenda manual en siguiente fase',
            'Estados de cita en siguiente fase',
          ]}
          title="Citas"
        />
      </DashboardLayout>
    </AuthGuard>
  );
}
