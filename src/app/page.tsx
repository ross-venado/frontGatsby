import Link from 'next/link';
import { BusinessCard } from '@/components/BusinessCard';
import { EmptyState } from '@/components/EmptyState';
import { apiFetch } from '@/lib/api';
import type { Business, BusinessCategory } from '@/types/mercadito';

export default async function HomePage() {
  const [categories, businesses] = await Promise.all([
    apiFetch<BusinessCategory[]>('/public/categories').catch(() => []),
    apiFetch<Business[]>('/public/businesses').catch(() => []),
  ]);

  return (
    <main>
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-jade">
              by CodeQuetzal
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-normal text-ink md:text-6xl">
              Mercadito Chimalteco
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-black/65">
              Locales digitales para restaurantes, talleres, importadores,
              repuestos, servicios y negocios de Chimaltenango.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="btn-primary" href="/businesses">
                Ver negocios
              </Link>
              <Link className="btn-secondary" href="/login">
                Registrar mi negocio
              </Link>
            </div>
          </div>
          <div className="surface rounded-lg p-5">
            <div className="grid grid-cols-2 gap-3">
              {['WhatsApp', 'QR', 'Catalogo', 'Ubicacion'].map((item) => (
                <div key={item} className="rounded-md bg-black/[0.03] p-4">
                  <p className="text-sm font-semibold text-ink">{item}</p>
                  <p className="mt-1 text-xs text-black/55">Listo para vender</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-md bg-jade px-4 py-3 text-sm font-semibold text-white">
              MVP conectado a NestJS + MongoDB
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink">Categorias</h2>
            <p className="mt-1 text-sm text-black/60">
              Nichos iniciales para vender rapido en Chimaltenango.
            </p>
          </div>
          <Link className="btn-secondary" href="/businesses">
            Explorar
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <div key={category._id} className="surface rounded-lg p-4">
              <p className="text-sm font-semibold text-ink">{category.name}</p>
              <p className="mt-1 text-xs text-black/55">/{category.slug}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink">Locales destacados</h2>
            <p className="mt-1 text-sm text-black/60">
              Negocios activos dentro del mercadito.
            </p>
          </div>
        </div>
        {businesses.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {businesses.slice(0, 6).map((business) => (
              <BusinessCard key={business._id} business={business} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Todavia no hay negocios activos"
            description="Crea un negocio desde el panel y apruebalo desde admin para verlo aqui."
          />
        )}
      </section>
    </main>
  );
}
