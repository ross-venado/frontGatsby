import Link from 'next/link';
import type { Business } from '@/types/mercadito';

function categoryName(business: Business) {
  if (!business.categoryId || typeof business.categoryId === 'string') {
    return 'Local digital';
  }

  return business.categoryId.name;
}

export function BusinessCard({ business }: { business: Business }) {
  return (
    <article className="surface flex h-full flex-col overflow-hidden rounded-lg">
      <div className="h-28 bg-gradient-to-br from-jade/20 via-maize/25 to-clay/20">
        {business.coverUrl ? (
          <div
            aria-hidden="true"
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${business.coverUrl})` }}
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-jade">
          {categoryName(business)}
        </p>
        <h2 className="mt-2 text-lg font-bold text-ink">{business.name}</h2>
        <p className="mt-2 line-clamp-3 text-sm text-black/60">
          {business.description || 'Local digital con WhatsApp, ubicacion y catalogo.'}
        </p>
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
