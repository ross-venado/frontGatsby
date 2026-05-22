import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { RestaurantOrdersManager } from '@/components/restaurant/RestaurantOrdersManager';

export default function RestaurantOrdersPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <RestaurantOrdersManager />
      </DashboardLayout>
    </AuthGuard>
  );
}
