'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ModulePlaceholder } from '@/components/ModulePlaceholder';

export default function AutomotivePage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <ModulePlaceholder
          actions={[{ href: '/dashboard/products', label: 'Administrar catalogo' }]}
          description="Modulo preparado para importadores, repuestos, accesorios, luces, polarizado y detailing. El catalogo actual ya permite precio, imagen, estado y stock."
          eyebrow="Modulo plus"
          items={[
            'Inventario basico con stock',
            'Productos activos, inactivos o agotados',
            'Contacto por WhatsApp desde el local publico',
            'Ficha tecnica automotriz en siguiente fase',
          ]}
          title="Automotriz"
        />
      </DashboardLayout>
    </AuthGuard>
  );
}
