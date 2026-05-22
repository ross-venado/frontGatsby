'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { CatalogCategoryManager } from '@/components/CatalogCategoryManager';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function CategoriesPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <CatalogCategoryManager />
      </DashboardLayout>
    </AuthGuard>
  );
}
