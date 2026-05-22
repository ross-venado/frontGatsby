'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ItemManager } from '@/components/ItemManager';

export default function ServicesPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <ItemManager mode="services" />
      </DashboardLayout>
    </AuthGuard>
  );
}
