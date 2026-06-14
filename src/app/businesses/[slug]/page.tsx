import Link from 'next/link';
import { BusinessShareKit } from '@/components/BusinessShareKit';
import { BusinessWhatsAppOrder } from '@/components/BusinessWhatsAppOrder';
import { TrackedWhatsAppLink } from '@/components/TrackedWhatsAppLink';
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
  const categorySlug =
    business.categoryId && typeof business.categoryId === 'object'
      ? business.categoryId.slug
      : '';
  const hasDigitalMenu = categorySlug === 'comida-y-restaurantes' || business.modules?.includes('restaurant');

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
                <TrackedWhatsAppLink
                  businessSlug={business.slug}
                  className="btn-primary"
                  href={whatsapp}
                  source="business_header"
                >
                  Preguntar por WhatsApp
                </TrackedWhatsAppLink>
              ) : null}
              {products.length ? (
                <Link className="btn-secondary" href={`/businesses/${slug}#pedido`}>
                  Armar pedido
                </Link>
              ) : null}
              {hasDigitalMenu ? (
                <Link className="btn-secondary" href={`/m/${business.slug}`}>
                  Ver menu digital
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

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        {services.length ? (
          <div>
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-soft">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-jade">
                    Tambien disponible
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-ink">Servicios</h2>
                </div>
                <p className="text-sm text-black/55">
                  Consulta disponibilidad directo con el negocio.
                </p>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {services.slice(0, 4).map((service) => (
                  <article key={service._id} className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
                    <h3 className="font-bold text-ink">{service.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-black/60">
                      {service.description || service.category || 'Servicio del local'}
                    </p>
                    <p className="mt-3 text-sm font-black text-jade">
                      Desde {money(service.priceFrom)}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:block" />
        )}

        <aside id="qr" className="h-fit">
          <BusinessShareKit
            businessName={business.name}
            publicUrl={publicUrl}
            whatsapp={business.whatsapp || business.phone}
          />
        </aside>
      </section>
    </main>
  );
}
