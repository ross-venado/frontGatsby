import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { RestaurantTablesManager } from '@/components/restaurant/RestaurantTablesManager';

export default function RestaurantTablesPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <RestaurantTablesManager />
      </DashboardLayout>
    </AuthGuard>
  );
}
