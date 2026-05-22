import { BusinessCard } from '@/components/BusinessCard';
import { EmptyState } from '@/components/EmptyState';
import { PublicShell } from '@/components/PublicShell';
import { apiFetch } from '@/lib/api';
import type { Business, BusinessCategory } from '@/types/mercadito';

export default async function BusinessesPage() {
  const [categories, businesses] = await Promise.all([
    apiFetch<BusinessCategory[]>('/public/categories').catch(() => []),
    apiFetch<Business[]>('/public/businesses').catch(() => []),
  ]);

  return (
    <PublicShell
      eyebrow="Marketplace publico"
      title="Negocios de Chimaltenango"
      description="Explora locales digitales con catalogo, servicios, WhatsApp y ubicacion."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <span
            key={category._id}
            className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm text-black/65"
          >
            {category.name}
          </span>
        ))}
      </div>

      {businesses.length ? (
        <div className="grid gap-5 md:grid-cols-3">
          {businesses.map((business) => (
            <BusinessCard key={business._id} business={business} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No hay negocios activos"
          description="Cuando el admin apruebe locales, apareceran en este listado."
        />
      )}
    </PublicShell>
  );
}
