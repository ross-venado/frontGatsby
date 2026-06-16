'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LiveSalesManager } from '@/components/live/LiveSalesManager';

export default function LiveSalesDashboardPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <LiveSalesManager />
      </DashboardLayout>
    </AuthGuard>
  );
}
