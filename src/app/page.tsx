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
    <main className="bg-[#fbfaf6]">
      <section className="border-b border-black/10 bg-[#10251f] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1fr_440px] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-maize">
              Mercadito Chimalteco by CodeQuetzal
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight tracking-normal md:text-6xl">
              Un mapa vivo de locales, menus y servicios de Chimaltenango
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
              Descubre negocios cercanos, abre su catalogo, escanea su QR o habla
              directo por WhatsApp. Para vender local, sin tienda complicada.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="rounded-md bg-maize px-5 py-3 text-sm font-bold text-ink transition hover:bg-maize/90" href="/businesses">
                Buscar locales
              </Link>
              <Link className="rounded-md border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15" href="/login">
                Publicar mi negocio
              </Link>
            </div>
            <div className="mt-9 grid max-w-xl grid-cols-3 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/8 p-4">
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="mt-1 text-xs font-medium text-white/58">nichos activos</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/8 p-4">
                <p className="text-2xl font-bold">{businesses.length}</p>
                <p className="mt-1 text-xs font-medium text-white/58">locales visibles</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/8 p-4">
                <p className="text-2xl font-bold">QR</p>
                <p className="mt-1 text-xs font-medium text-white/58">para mostrador</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/12 bg-white p-4 text-ink shadow-2xl shadow-black/25">
            <div className="rounded-[1.5rem] bg-[#f2eee5] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-jade">
                    Vista cliente
                  </p>
                  <h2 className="mt-1 text-xl font-bold">Comedor del Parque</h2>
                </div>
                <div className="grid h-16 w-16 grid-cols-3 gap-1 rounded-lg bg-white p-2">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <span
                      key={index}
                      className={index % 2 ? 'bg-maize' : 'bg-ink'}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-5 rounded-xl bg-white p-4">
                <p className="text-sm font-semibold text-black/50">Menu de hoy</p>
                <div className="mt-3 space-y-3">
                  {[
                    ['Caldo de res', 'Q 35'],
                    ['Desayuno chapin', 'Q 28'],
                    ['Refresco natural', 'Q 10'],
                  ].map(([name, price]) => (
                    <div key={name} className="flex items-center justify-between rounded-lg bg-black/[0.03] px-3 py-2">
                      <span className="text-sm font-semibold">{name}</span>
                      <span className="text-sm font-bold text-jade">{price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-jade p-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                    WhatsApp
                  </p>
                  <p className="mt-2 text-lg font-bold">Pedir ahora</p>
                </div>
                <div className="rounded-xl bg-clay p-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                    Ubicacion
                  </p>
                  <p className="mt-2 text-lg font-bold">Como llegar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-5 md:grid-cols-4">
          {[
            ['Restaurantes', 'Menus QR y pedidos por mesa'],
            ['Talleres', 'Servicios, direccion y contacto'],
            ['Importadores', 'Catalogo rapido para vitrina'],
            ['Servicios', 'Cotizaciones por WhatsApp'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-lg bg-[#f7f3eb] p-4">
              <p className="font-bold text-ink">{title}</p>
              <p className="mt-1 text-sm text-black/55">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-jade">
              Explora por necesidad
            </p>
            <h2 className="mt-2 text-3xl font-bold text-ink">Categorias del mercadito</h2>
            <p className="mt-3 text-sm leading-6 text-black/60">
              Empieza por comida, repuestos, talleres, belleza o servicios
              profesionales. Cada categoria conecta con locales reales.
            </p>
            <Link className="btn-primary mt-5" href="/businesses">
              Ver directorio
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <div
                key={category._id}
                className="surface rounded-lg p-4 transition hover:-translate-y-0.5 hover:border-jade/40"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="mt-3 text-base font-bold text-ink">{category.name}</p>
                <p className="mt-2 text-sm text-black/55">Locales, catalogos y contacto</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-jade">
                Ya estan en linea
              </p>
              <h2 className="mt-2 text-3xl font-bold text-ink">Locales destacados</h2>
              <p className="mt-1 text-sm text-black/60">
                Negocios activos con catalogo, QR, ubicacion y WhatsApp.
              </p>
            </div>
            <Link className="btn-secondary" href="/businesses">
              Ver todos
            </Link>
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
        </div>
      </section>
    </main>
  );
}
