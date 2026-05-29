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

  const featured = businesses.slice(0, 6);
  const categoryPreview = categories.slice(0, 10);
  const heroBusiness = businesses[0];

  return (
    <main className="overflow-x-hidden bg-[#f8f6f0]">
      <section className="relative isolate overflow-hidden border-b border-black/10 bg-[#f8f6f0]">
        <div className="absolute inset-x-0 top-0 -z-10 h-[68%] bg-[linear-gradient(135deg,#fff7df_0%,#eaf5ef_44%,#f6dfd2_100%)]" />
        <div className="mx-auto grid max-w-6xl gap-7 px-4 py-7 sm:py-12 lg:min-h-[calc(100svh-76px)] lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center lg:py-14">
          <div className="min-w-0 max-w-3xl">
            <div className="inline-flex max-w-full rounded-full border border-jade/20 bg-white/70 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-jade shadow-sm backdrop-blur sm:px-4 sm:text-xs">
              Mercadito local by CodeQuetzal
            </div>
            <h1 className="mt-5 max-w-[11ch] text-[clamp(2.1rem,12vw,5.7rem)] font-black leading-[0.96] tracking-normal text-ink sm:max-w-none">
              Chimaltenango a un toque
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-black/68 sm:text-lg sm:leading-8">
              Descubre locales, menus, productos, servicios, ubicacion y pedidos
              por WhatsApp desde una experiencia pensada para celular.
            </p>
            <div className="mt-7 grid max-w-md gap-3 sm:grid-cols-2">
              <Link className="btn-primary min-h-12 px-4 text-sm sm:px-5 sm:text-base" href="/businesses">
                Explorar locales
              </Link>
              <Link className="btn-secondary min-h-12 px-4 text-sm sm:px-5 sm:text-base" href="/login">
                Crear mi local
              </Link>
            </div>

            <div className="mt-7 flex max-w-full gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categoryPreview.map((category) => (
                <Link
                  key={category._id}
                  href="/businesses"
                  className="shrink-0 rounded-full border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold text-ink shadow-sm sm:px-4 sm:text-sm"
                >
                  {category.name}
                </Link>
              ))}
            </div>

            <div className="mt-7 grid max-w-lg grid-cols-2 overflow-hidden rounded-xl border border-black/10 bg-white/75 shadow-soft backdrop-blur sm:grid-cols-3">
              <div className="p-3 sm:p-4">
                <p className="text-xl font-black text-ink sm:text-2xl">{categories.length}</p>
                <p className="mt-1 text-xs font-semibold text-black/48">categorias</p>
              </div>
              <div className="border-l border-black/10 p-3 sm:border-x sm:p-4">
                <p className="text-xl font-black text-ink sm:text-2xl">{businesses.length}</p>
                <p className="mt-1 text-xs font-semibold text-black/48">locales</p>
              </div>
              <div className="col-span-2 border-t border-black/10 p-3 sm:col-span-1 sm:border-t-0 sm:p-4">
                <p className="text-xl font-black text-ink sm:text-2xl">Icono</p>
                <p className="mt-1 text-xs font-semibold text-black/48">en el celular</p>
              </div>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="absolute -right-4 -top-4 hidden rounded-full bg-jade px-4 py-2 text-sm font-bold text-white shadow-soft sm:block">
              QR listo
            </div>
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl shadow-black/15 sm:rounded-[1.65rem]">
              <div className="relative h-44 bg-[linear-gradient(135deg,#12352d_0%,#0f8b6f_52%,#f6b73c_100%)] sm:h-56">
                {heroBusiness?.coverUrl ? (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-cover bg-center mix-blend-overlay"
                    style={{ backgroundImage: `url(${heroBusiness.coverUrl})` }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-black/18" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-white/70">
                    Local destacado
                  </p>
                  <h2 className="mt-1 line-clamp-2 text-2xl font-black leading-tight text-white sm:text-3xl">
                    {heroBusiness?.name || 'Tu negocio aqui'}
                  </h2>
                </div>
              </div>
              <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
                <div className="rounded-xl bg-[#f8f6f0] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-jade">
                    Desde el celular
                  </p>
                  <p className="mt-2 text-base font-black text-ink sm:text-lg">
                    Catalogo, direccion y pedido en un solo enlace
                  </p>
                </div>
                <div className="grid gap-3">
                  {[
                    ['1', 'Escanea el QR del local'],
                    ['2', 'Elige productos o servicios'],
                    ['3', 'Confirma por WhatsApp'],
                  ].map(([step, label]) => (
                    <div key={step} className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-black text-white">
                        {step}
                      </span>
                      <span className="text-sm font-bold text-ink">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 min-[360px]:grid-cols-[1fr_74px] sm:grid-cols-[1fr_84px]">
                  <div className="rounded-xl bg-jade p-4 text-white">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/70">
                      Pide sin app nueva
                    </p>
                    <p className="mt-1 text-lg font-black sm:text-xl">WhatsApp directo</p>
                  </div>
                  <div className="grid aspect-square grid-cols-4 gap-1 rounded-xl border border-black/10 bg-white p-3">
                    {Array.from({ length: 16 }).map((_, index) => (
                      <span
                        key={index}
                        className={(index + Math.floor(index / 4)) % 3 ? 'bg-ink' : 'bg-maize'}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white/80">
        <div className="mx-auto grid max-w-6xl gap-3 px-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Restaurantes', 'Menu QR, mesas y pedidos'],
            ['Tiendas', 'Catalogo e inventario simple'],
            ['Servicios', 'Cotizaciones y agenda futura'],
            ['Acceso rapido', 'Icono del local en el celular'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
              <p className="text-sm font-black text-ink">{title}</p>
              <p className="mt-1 text-sm text-black/55">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div className="min-w-0 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-jade">
              Explora rapido
            </p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-ink sm:text-3xl">Categorias del mercadito</h2>
            <p className="mt-2 text-sm leading-6 text-black/60">
              Nichos locales listos para vender por enlace, QR y WhatsApp.
            </p>
          </div>
          <Link className="btn-secondary hidden sm:inline-flex" href="/businesses">
            Ver directorio
          </Link>
        </div>
        {categories.length ? (
          <div className="flex max-w-full gap-3 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible md:grid-cols-3 lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
            {categories.map((category, index) => (
              <Link
                key={category._id}
                href="/businesses"
                className="surface min-w-[210px] rounded-xl p-4 transition hover:-translate-y-0.5 hover:border-jade/40 sm:min-w-0"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="mt-3 text-base font-black text-ink">{category.name}</p>
                <p className="mt-2 text-sm text-black/55">Ver locales disponibles</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Categorias en preparacion"
            description="Cuando el backend responda, las categorias apareceran aqui."
          />
        )}
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wide text-jade">
                Ya estan vendiendo
              </p>
              <h2 className="mt-2 text-2xl font-black leading-tight text-ink sm:text-3xl">Locales destacados</h2>
              <p className="mt-1 text-sm text-black/60">
                Negocios activos con catalogo, QR, ubicacion y pedido por WhatsApp.
              </p>
            </div>
            <Link className="btn-secondary hidden sm:inline-flex" href="/businesses">
              Ver todos
            </Link>
          </div>
          {featured.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {featured.map((business) => (
                <BusinessCard key={business._id} business={business} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Todavia no hay negocios activos"
              description="Crea un negocio desde el panel y apruebalo desde admin para verlo aqui."
            />
          )}
          <Link className="btn-primary mt-6 w-full sm:hidden" href="/businesses">
            Ver todos los locales
          </Link>
        </div>
      </section>
    </main>
  );
}
