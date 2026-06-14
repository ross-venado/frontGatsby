import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BusinessQr } from '@/components/BusinessQr';
import { BusinessShareKit } from '@/components/BusinessShareKit';
import { TrackedWhatsAppLink } from '@/components/TrackedWhatsAppLink';
import { apiFetch, money, whatsappMessageUrl } from '@/lib/api';
import type { Business, Product } from '@/types/mercadito';

type PageProps = {
  params: Promise<{ businessSlug: string }>;
};

function groupProducts(products: Product[]) {
  return products.reduce<Record<string, Product[]>>((groups, product) => {
    const category = product.category || 'Menu';
    groups[category] = [...(groups[category] || []), product];
    return groups;
  }, {});
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { businessSlug } = await params;
  const [business, products] = await Promise.all([
    apiFetch<Business>(`/public/businesses/${businessSlug}`).catch(() => null),
    apiFetch<Product[]>(`/public/businesses/${businessSlug}/products`).catch(() => []),
  ]);

  if (!business) {
    notFound();
  }

  const activeProducts = products.filter((product) => product.status === 'active');
  const groupedProducts = groupProducts(activeProducts);
  const categories = Object.keys(groupedProducts);
  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/m/${business.slug}`;
  const whatsappHref = whatsappMessageUrl(
    business.whatsapp || business.phone,
    `Hola, vi el menu QR de ${business.name} en Mercadito Chimalteco y quiero hacer una consulta.`,
  );

  return (
    <main className="overflow-x-hidden bg-[#f8f6f0] text-ink">
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-30"
          style={business.coverUrl ? { backgroundImage: `url(${business.coverUrl})` } : undefined}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(18,53,45,0.96),rgba(15,139,111,0.86),rgba(246,183,60,0.52))]" />
        <div className="mx-auto grid max-w-6xl gap-7 px-4 py-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-white/70">
              Menu digital
            </p>
            <h1 className="mt-2 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
              {business.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
              Carta publica para ver platillos, precios y consultar directo con
              el restaurante.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {whatsappHref ? (
                <TrackedWhatsAppLink
                  businessSlug={business.slug}
                  className="btn-primary"
                  href={whatsappHref}
                  source="public_menu"
                >
                  Consultar por WhatsApp
                </TrackedWhatsAppLink>
              ) : null}
              <Link className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-white/15" href={`/businesses/${business.slug}`}>
                Ver local completo
              </Link>
            </div>
          </div>
          <div className="hidden rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur lg:block">
            <BusinessQr value={publicUrl} label={`Menu QR de ${business.name}`} size={190} />
            <p className="mt-3 text-center text-xs font-bold uppercase tracking-wide text-white/70">
              Escanea para abrir menu
            </p>
          </div>
        </div>
      </section>

      {categories.length ? (
        <nav className="sticky top-0 z-20 border-b border-black/10 bg-[#f8f6f0]/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <a
                key={category}
                className="shrink-0 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black text-ink shadow-sm"
                href={`#${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              >
                {category}
              </a>
            ))}
          </div>
        </nav>
      ) : null}

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {activeProducts.length ? (
            Object.entries(groupedProducts).map(([category, categoryProducts]) => (
              <section
                key={category}
                id={category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                className="scroll-mt-20 rounded-3xl border border-black/10 bg-white p-4 shadow-soft sm:p-5"
              >
                <div className="flex items-end justify-between gap-3 border-b border-black/10 pb-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-jade">
                      Carta
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-ink">{category}</h2>
                  </div>
                  <span className="rounded-full bg-jade/10 px-3 py-1 text-xs font-black text-jade">
                    {categoryProducts.length}
                  </span>
                </div>
                <div className="divide-y divide-black/10">
                  {categoryProducts.map((product) => (
                    <article key={product._id} className="grid gap-4 py-4 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:items-start">
                      <div className="h-28 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#eaf5ef,#fff7df)] sm:h-24">
                        {product.images?.[0] ? (
                          <div
                            aria-hidden="true"
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${product.images[0]})` }}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-black leading-tight text-ink">
                          {product.name}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-black/58">
                          {product.description || 'Producto del menu'}
                        </p>
                      </div>
                      <p className="w-fit rounded-full bg-[#f8f6f0] px-4 py-2 text-base font-black text-jade sm:justify-self-end">
                        {money(product.price)}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-soft">
              <h2 className="text-2xl font-black text-ink">Menu en preparacion</h2>
              <p className="mt-2 text-black/60">
                Este restaurante aun no tiene productos activos publicados.
              </p>
            </div>
          )}
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-soft">
            <p className="text-xs font-black uppercase tracking-wide text-jade">
              Resumen
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-[#f8f6f0] p-4">
                <p className="text-2xl font-black text-ink">{activeProducts.length}</p>
                <p className="mt-1 text-xs font-bold text-black/45">platillos</p>
              </div>
              <div className="rounded-xl bg-[#f8f6f0] p-4">
                <p className="text-2xl font-black text-ink">{categories.length}</p>
                <p className="mt-1 text-xs font-bold text-black/45">categorias</p>
              </div>
            </div>
          </div>
          {whatsappHref ? (
            <TrackedWhatsAppLink
              businessSlug={business.slug}
              className="btn-primary min-h-12 w-full"
              href={whatsappHref}
              source="public_menu_sidebar"
            >
              Consultar este menu
            </TrackedWhatsAppLink>
          ) : null}
          <BusinessShareKit
            businessName={`${business.name} - Menu`}
            publicUrl={publicUrl}
            whatsapp={business.whatsapp || business.phone}
          />
        </aside>
      </section>
    </main>
  );
}
