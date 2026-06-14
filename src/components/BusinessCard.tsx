import Link from 'next/link';
import type { Business } from '@/types/mercadito';

function categoryName(business: Business) {
  if (!business.categoryId || typeof business.categoryId === 'string') {
    return 'Local digital';
  }

  return business.categoryId.name;
}

export function BusinessCard({ business }: { business: Business }) {
  const hasCatalog = business.modules?.includes('marketplace');
  const hasRestaurant = business.modules?.includes('restaurant');
  const hasAdvancedModule = business.modules?.some((module) => module !== 'marketplace');

  return (
    <article className="surface flex h-full flex-col overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-jade/40">
      <div className="relative h-36 bg-gradient-to-br from-jade/20 via-maize/25 to-clay/20">
        {business.coverUrl ? (
          <div
            aria-hidden="true"
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${business.coverUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
          {business.status === 'active' ? (
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase text-jade">
              Activo
            </span>
          ) : null}
          {hasAdvancedModule ? (
            <span className="rounded-full bg-ink/90 px-3 py-1 text-[11px] font-black uppercase text-white">
              Modulo pro
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-jade">
          {categoryName(business)}
        </p>
        <h2 className="mt-2 line-clamp-2 text-xl font-black leading-tight text-ink">{business.name}</h2>
        <p className="mt-2 line-clamp-3 text-sm text-black/60">
          {business.description || 'Local digital con WhatsApp, ubicacion y catalogo.'}
        </p>
        <div className="mt-4 grid gap-2 text-sm text-black/55">
          {business.address ? (
            <p className="line-clamp-1">Ubicacion: {business.address}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {hasCatalog ? (
              <span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-bold">
                Catalogo
              </span>
            ) : null}
            {business.whatsapp ? (
              <span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-bold">
                WhatsApp
              </span>
            ) : null}
            {hasRestaurant ? (
              <span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-bold">
                Restaurante
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/60">
            Plan {business.plan}
          </span>
          <Link className="btn-secondary" href={`/businesses/${business.slug}`}>
            Ver local
          </Link>
        </div>
      </div>
    </article>
  );
}
