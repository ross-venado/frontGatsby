import Link from 'next/link';
import { BusinessWhatsAppOrder } from '@/components/BusinessWhatsAppOrder';
import { BusinessQr } from '@/components/BusinessQr';
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
  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/businesses/${business.slug}`;

  return (
    <main>
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="h-40 overflow-hidden rounded-lg bg-gradient-to-br from-jade/20 via-maize/25 to-clay/20 sm:h-56">
            {business.coverUrl ? (
              <div
                aria-hidden="true"
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${business.coverUrl})` }}
              />
            ) : null}
          </div>
          <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wide text-jade">
                Local digital
              </p>
              <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
                {business.name}
              </h1>
              <p className="mt-3 max-w-2xl text-black/65">
                {business.description || 'Catalogo, servicios, WhatsApp y ubicacion.'}
              </p>
              {business.address ? (
                <p className="mt-3 text-sm font-medium text-black/60">
                  {business.address}
                </p>
              ) : null}
            </div>
            <div className="grid gap-3 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
              {whatsapp ? (
                <a className="btn-primary" href={whatsapp} target="_blank">
                  Preguntar por WhatsApp
                </a>
              ) : null}
              {products.length ? (
                <Link className="btn-secondary" href={`/businesses/${slug}#pedido`}>
                  Armar pedido
                </Link>
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

      <section className="mx-auto max-w-6xl px-4 py-10">
        <BusinessWhatsAppOrder
          business={business}
          products={products}
          publicUrl={publicUrl}
        />
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-10 lg:grid-cols-[1fr_320px]">
        <div>
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
          <div className="mt-4">
            <BusinessQr value={publicUrl} label={`QR de ${business.name}`} />
          </div>
          <p className="mt-3 break-all text-sm text-black/60">
            {publicUrl}
          </p>
        </aside>
      </section>
    </main>
  );
}
