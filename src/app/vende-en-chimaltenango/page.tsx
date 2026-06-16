import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const ownerWhatsApp = '50244456041';

const whatsappMessage = encodeURIComponent(
  'Hola, quiero mi local digital en Mercadito Chimalteco. Me interesa catalogo, QR, ubicacion y pedidos por WhatsApp.',
);

const whatsappHref = `https://wa.me/${ownerWhatsApp}?text=${whatsappMessage}`;

const packages = [
  {
    name: 'Basico',
    price: 'Q 0',
    description: 'Gratis para empezar con catalogo, ubicacion y WhatsApp.',
    features: ['Local publico', 'Hasta 10 productos', 'QR para imprimir', 'Soporte de arranque'],
  },
  {
    name: 'Plus',
    price: 'Q 199',
    description: 'Para negocios que quieren ordenar mejor sus consultas.',
    highlighted: true,
    features: [
      'Hasta 30 productos',
      'Modulo segun nicho',
      'Venta en vivo con historial',
      'Metricas basicas',
    ],
  },
  {
    name: 'Pro',
    price: 'Q 349',
    description: 'Para locales con mas movimiento o catalogo amplio.',
    features: [
      'Hasta 100 productos',
      'Modulo avanzado',
      'Venta en vivo avanzada',
      'Soporte prioritario',
    ],
  },
];

const steps = [
  ['1', 'Nos mandas datos y fotos', 'Nombre, direccion, WhatsApp, productos o menu.'],
  ['2', 'Armamos tu local digital', 'Te dejamos catalogo, enlace, QR y pagina lista.'],
  ['3', 'Empiezas a compartir', 'Lo usas en Facebook, estados, tarjetas, mostrador o delivery.'],
];

const niches = [
  ['Restaurantes', 'Menu, mesas, pedidos y venta en vivo'],
  ['Tiendas', 'Catalogo, inventario, cotizaciones y venta en vivo'],
  ['Servicios', 'Agenda, solicitudes y venta en vivo'],
  ['Talleres', 'Ordenes, seguimiento y venta en vivo'],
  ['Belleza', 'Servicios, citas y venta en vivo'],
  ['Herreria / PVC', 'Cotizaciones con medidas y venta en vivo'],
];

const developerLinks = [
  ['Sitio de VTEMGT', 'https://vtemgt.com/'],
  [
    'TikTok CodeQuetzal',
    'https://www.tiktok.com/@codequetzal?is_from_webapp=1&sender_device=pc',
  ],
];

export const metadata: Metadata = {
  title: 'Vende en Chimaltenango | Mercadito Chimalteco',
  description:
    'Te hacemos tu local digital en Chimaltenango: catalogo, QR, mapa y pedidos por WhatsApp sin app nueva ni tienda cara.',
};

export default function SellInChimaltenangoPage() {
  return (
    <main className="overflow-x-hidden bg-[#f8f6f0]">
      <section className="relative isolate overflow-hidden border-b border-black/10 bg-[#f8f6f0]">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#fff7df_0%,#eaf5ef_52%,#f7e1d2_100%)]" />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
          <div className="min-w-0">
            <div className="inline-flex rounded-full border border-jade/20 bg-white/75 px-4 py-2 text-xs font-black uppercase tracking-wide text-jade shadow-sm">
              Para negocios de Chimaltenango
            </div>
            <h1 className="mt-5 max-w-[13ch] text-[clamp(2.45rem,8vw,5.1rem)] font-black leading-[0.96] tracking-normal text-ink">
              Tu local digital, listo para vender
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-black/68 sm:text-lg sm:leading-8">
              Te hacemos catalogo, QR, ubicacion y pedidos por WhatsApp para que
              tus clientes encuentren tu negocio sin descargar otra app.
            </p>
            <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-[1fr_0.8fr]">
              <a className="btn-primary min-h-12 px-5 text-base" href={whatsappHref}>
                Quiero mi local digital
              </a>
              <Link className="btn-secondary min-h-12 px-5 text-base" href="/businesses">
                Ver locales
              </Link>
            </div>
            <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
              {['Sin app nueva', 'QR para compartir', 'Venta en vivo'].map((item) => (
                <div key={item} className="rounded-xl border border-black/10 bg-white/75 p-4 shadow-sm">
                  <p className="text-sm font-black text-ink">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="absolute right-5 top-5 z-10 rounded-full bg-jade px-4 py-2 text-sm font-black text-white shadow-soft">
              QR listo
            </div>
            <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl shadow-black/15">
              <div className="relative h-56 bg-[linear-gradient(135deg,#12352d_0%,#0f8b6f_52%,#f6b73c_100%)] p-6 text-white">
                <div className="absolute right-5 top-5 h-20 w-20 overflow-hidden rounded-2xl border border-white/20 bg-white/15 p-2">
                  <Image
                    src="/icons/icon-512.png"
                    alt="Mercadito Chimalteco"
                    width={80}
                    height={80}
                    className="h-full w-full rounded-xl object-cover"
                    priority
                  />
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-xs font-black uppercase tracking-wide text-white/70">
                    Ejemplo de local
                  </p>
                  <h2 className="mt-2 max-w-[11ch] text-4xl font-black leading-none">
                    Catalogo con WhatsApp
                  </h2>
                </div>
              </div>
              <div className="space-y-3 p-4">
                {[
                  ['Catalogo', 'Productos, precios y fotos ordenadas'],
                  ['Ubicacion', 'Mapa, direccion y contacto visible'],
                  ['Pedido', 'El cliente confirma por WhatsApp'],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-xl border border-black/10 bg-[#f8f6f0] p-4">
                    <p className="text-sm font-black text-ink">{title}</p>
                    <p className="mt-1 text-sm text-black/58">{description}</p>
                  </div>
                ))}
                <div className="grid grid-cols-[1fr_86px] gap-3">
                  <div className="rounded-xl bg-ink p-4 text-white">
                    <p className="text-xs font-black uppercase tracking-wide text-jade">
                      Listo para estados
                    </p>
                    <p className="mt-1 text-lg font-black">Comparte tu enlace</p>
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

      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-3">
          {steps.map(([number, title, description]) => (
            <article key={number} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-black text-white">
                {number}
              </span>
              <h2 className="mt-4 text-xl font-black text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-black/58">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase tracking-wide text-jade">
            Paquetes claros
          </p>
          <h2 className="mt-2 text-3xl font-black leading-tight text-ink">
            No vendemos una app complicada. Te dejamos el local funcionando.
          </h2>
          <p className="mt-3 text-base leading-7 text-black/60">
            El plan se elige segun cuantos productos tienes y que tanto control
            necesita tu negocio.
          </p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {packages.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-2xl border p-5 shadow-soft ${
                plan.highlighted
                  ? 'border-jade bg-ink text-white'
                  : 'border-black/10 bg-white text-ink'
              }`}
            >
              <p className={`text-sm font-black ${plan.highlighted ? 'text-jade' : 'text-black/45'}`}>
                {plan.name}
              </p>
              <p className="mt-3 text-4xl font-black">{plan.price}</p>
              <p className={`mt-3 text-sm leading-6 ${plan.highlighted ? 'text-white/68' : 'text-black/58'}`}>
                {plan.description}
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="font-black text-jade">OK</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-ink text-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-jade">
              Plus por nicho
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight">
              Cada tipo de negocio necesita algo diferente.
            </h2>
            <p className="mt-3 text-base leading-7 text-white/65">
              Empezamos con catalogo y WhatsApp. Cuando el negocio necesita mas,
              se activa el modulo segun su forma de vender.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {niches.map(([name, module]) => (
              <div key={name} className="rounded-xl border border-white/10 bg-white/10 p-4">
                <p className="font-black text-white">{name}</p>
                <p className="mt-1 text-sm leading-6 text-white/62">{module}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-soft sm:p-7">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-jade">
                Atencion local
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-ink">
                Te ayudamos a ponerlo bonito y a compartirlo.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-black/60">
                Ideal para negocios que no tienen tiempo de configurar sistemas:
                nosotros dejamos el local digital listo y tu solo lo compartes.
              </p>
            </div>
            <a className="btn-primary min-h-12 px-5 text-base" href={whatsappHref}>
              Escribirme por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:pb-12">
        <div className="rounded-3xl border border-black/10 bg-ink p-5 text-white shadow-soft sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-jade">
                Quienes lo desarrollan
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight">
                Hecho por VTEMGT / CodeQuetzal
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/65">
                Construimos herramientas web para negocios locales: catalogos,
                QR, pedidos por WhatsApp y modulos para restaurantes, tiendas,
                servicios y otros nichos.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {developerLinks.map(([label, href]) => (
                <a
                  key={label}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-black text-white transition hover:bg-white/15"
                  href={href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
