import Link from 'next/link';
import { BusinessCard } from '@/components/BusinessCard';
import { EmptyState } from '@/components/EmptyState';
import { PublicShell } from '@/components/PublicShell';
import { apiFetch } from '@/lib/api';
import type { Business, BusinessCategory } from '@/types/mercadito';

type BusinessesPageProps = {
  searchParams: Promise<{ category?: string }>;
};

function businessCategorySlug(business: Business) {
  if (!business.categoryId || typeof business.categoryId === 'string') {
    return '';
  }

  return business.categoryId.slug;
}

export default async function BusinessesPage({ searchParams }: BusinessesPageProps) {
  const { category } = await searchParams;
  const [categories, businesses] = await Promise.all([
    apiFetch<BusinessCategory[]>('/public/categories').catch(() => []),
    apiFetch<Business[]>('/public/businesses').catch(() => []),
  ]);

  const selectedCategory = categories.find((item) => item.slug === category);
  const filteredBusinesses = selectedCategory
    ? businesses.filter((business) => businessCategorySlug(business) === selectedCategory.slug)
    : businesses;

  return (
    <PublicShell
      eyebrow="Marketplace publico"
      title={selectedCategory ? selectedCategory.name : 'Negocios de Chimaltenango'}
      description={
        selectedCategory
          ? selectedCategory.description || 'Locales disponibles en esta categoria.'
          : 'Explora locales digitales con catalogo, servicios, WhatsApp y ubicacion.'
      }
    >
      <div className="mb-6 rounded-2xl border border-black/10 bg-white p-4 shadow-soft">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-jade">
              Directorio local
            </p>
            <p className="mt-1 text-sm text-black/55">
              {filteredBusinesses.length} locales encontrados
            </p>
          </div>
          {selectedCategory ? (
            <Link className="btn-secondary" href="/businesses">
              Ver todas
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${
            selectedCategory
              ? 'border-black/10 bg-white text-ink'
              : 'border-jade bg-jade text-white'
          }`}
          href="/businesses"
        >
          Todos
        </Link>
        {categories.map((category) => (
          <Link
            key={category._id}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${
              selectedCategory?.slug === category.slug
                ? 'border-jade bg-jade text-white'
                : 'border-black/10 bg-white text-ink'
            }`}
            href={`/businesses?category=${category.slug}`}
          >
            {category.name}
          </Link>
        ))}
      </div>

      {filteredBusinesses.length ? (
        <div className="grid gap-5 md:grid-cols-3">
          {filteredBusinesses.map((business) => (
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
