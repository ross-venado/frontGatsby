import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { apiFetch, mapsUrl, money, whatsappUrl } from '@/lib/api';
import type { Business, Product, Service } from '@/types/mercadito';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params;
  const [business, products, services] = await Promise.all([
    apiFetch<Business>(`/public/businesses/${slug}`),
    apiFetch<Product[]>(`/public/businesses/${slug}/products`).catch(() => []),
    apiFetch<Service[]>(`/public/businesses/${slug}/services`).catch(() => []),
  ]);

  const whatsapp = whatsappUrl(business.whatsapp || business.phone, business.name);
  const map = mapsUrl(business.address, business.location);

  return (
    <main>
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="h-48 overflow-hidden rounded-lg bg-gradient-to-br from-jade/20 via-maize/25 to-clay/20">
            {business.coverUrl ? (
              <div
                aria-hidden="true"
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${business.coverUrl})` }}
              />
            ) : null}
          </div>
          <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-jade">
                Local digital
              </p>
              <h1 className="mt-2 text-4xl font-bold text-ink">{business.name}</h1>
              <p className="mt-3 max-w-2xl text-black/65">
                {business.description || 'Catalogo, servicios, WhatsApp y ubicacion.'}
              </p>
              {business.address ? (
                <p className="mt-3 text-sm font-medium text-black/60">
                  {business.address}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              {whatsapp ? (
                <a className="btn-primary" href={whatsapp} target="_blank">
                  WhatsApp
                </a>
              ) : null}
              {map ? (
                <a className="btn-secondary" href={map} target="_blank">
                  Ubicacion
                </a>
              ) : null}
              <Link className="btn-secondary" href={`/businesses/${slug}#qr`}>
                QR
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-ink">Productos</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {products.length ? (
                products.map((product) => (
                  <article key={product._id} className="surface rounded-lg p-4">
                    <h3 className="font-semibold text-ink">{product.name}</h3>
                    <p className="mt-2 text-sm text-black/60">
                      {product.description || product.category || 'Producto del local'}
                    </p>
                    <p className="mt-3 font-bold text-jade">{money(product.price)}</p>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="Sin productos publicados"
                  description="Este negocio aun no ha activado productos."
                />
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-ink">Servicios</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {services.length ? (
                services.map((service) => (
                  <article key={service._id} className="surface rounded-lg p-4">
                    <h3 className="font-semibold text-ink">{service.name}</h3>
                    <p className="mt-2 text-sm text-black/60">
                      {service.description || service.category || 'Servicio del local'}
                    </p>
                    <p className="mt-3 font-bold text-jade">
                      Desde {money(service.priceFrom)}
                    </p>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="Sin servicios publicados"
                  description="Este negocio aun no ha activado servicios."
                />
              )}
            </div>
          </div>
        </div>

        <aside id="qr" className="surface h-fit rounded-lg p-5">
          <h2 className="text-lg font-bold text-ink">QR del local</h2>
          <div className="mt-4 grid aspect-square place-items-center rounded-lg border border-dashed border-black/20 bg-black/[0.03] text-center text-sm font-semibold text-black/50">
            URL lista para QR
          </div>
          <p className="mt-3 break-all text-sm text-black/60">
            {process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}
            /businesses/{business.slug}
          </p>
        </aside>
      </section>
    </main>
  );
}
