import Link from 'next/link';
import { PublicShell } from '@/components/PublicShell';

const plans = [
  {
    name: 'Free',
    price: 'Q 0',
    description: 'Para probar el local digital sin complicarse.',
    features: ['3 productos', 'Pagina publica', 'WhatsApp y ubicacion', 'QR basico'],
  },
  {
    name: 'Basic',
    price: 'Q 0',
    description: 'Gratis para negocios que ya quieren verse mas completos.',
    features: ['10 productos', 'Catalogo ordenado', 'QR y enlace publico', 'Soporte inicial'],
  },
  {
    name: 'Plus',
    price: 'Q 199',
    description: 'Para activar el modulo adicional segun el nicho.',
    featured: true,
    features: [
      '30 productos',
      'Modulo por nicho',
      'Venta en vivo con historial',
      'Metricas basicas',
    ],
  },
  {
    name: 'Pro',
    price: 'Q 349',
    description: 'Para locales con mas movimiento y catalogo amplio.',
    features: [
      '100 productos',
      'Modulos avanzados',
      'Venta en vivo avanzada',
      'Soporte prioritario',
    ],
  },
];

const niches = [
  ['Restaurantes', 'Menu QR, mesas, pedidos y venta en vivo'],
  ['Tiendas', 'Inventario, cotizaciones y venta en vivo'],
  ['Tecnologia', 'Inventario, cotizaciones y venta en vivo'],
  ['Repuestos', 'Inventario, cotizaciones y venta en vivo'],
  ['Importadores de carros', 'Automotriz y venta en vivo'],
  ['Talleres mecanicos', 'Ordenes, seguimiento y venta en vivo'],
  ['Polarizado y detailing', 'Taller y venta en vivo'],
  ['PVC, vidrio y aluminio', 'Cotizaciones y venta en vivo'],
  ['Herreria', 'Cotizaciones y venta en vivo'],
  ['Belleza y citas', 'Agenda, servicios y venta en vivo'],
  ['Servicios profesionales', 'Citas, cotizaciones y venta en vivo'],
];

const developerLinks = [
  ['Sitio oficial', 'https://vtemgt.com/'],
  [
    'TikTok CodeQuetzal',
    'https://www.tiktok.com/@codequetzal?is_from_webapp=1&sender_device=pc',
  ],
];

export default function PricingPage() {
  return (
    <PublicShell
      eyebrow="Planes para negocios locales"
      title="Elige el plan segun como vende tu negocio"
      description="Free y Basic son gratis para publicar. Plus y Pro activan el adicional del nicho: restaurante, inventario, citas, taller, automotriz, cotizaciones o venta en vivo."
    >
      <section className="grid gap-4 lg:grid-cols-4">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-2xl border p-5 shadow-soft ${
              plan.featured
                ? 'border-jade bg-ink text-white'
                : 'border-black/10 bg-white text-ink'
            }`}
          >
            <p className={`text-sm font-black ${plan.featured ? 'text-jade' : 'text-black/45'}`}>
              {plan.name}
            </p>
            <p className="mt-3 text-4xl font-black">{plan.price}</p>
            <p className={`mt-3 text-sm leading-6 ${plan.featured ? 'text-white/65' : 'text-black/58'}`}>
              {plan.description}
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className={plan.featured ? 'text-jade' : 'text-jade'}>OK</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-black/10 bg-white p-5 shadow-soft">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-jade">
              Plus por nicho
            </p>
            <h2 className="mt-1 text-2xl font-black text-ink">
              Cada negocio recibe herramientas diferentes
            </h2>
          </div>
          <Link className="btn-primary justify-center" href="/vende-en-chimaltenango">
            Quiero mi local digital
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {niches.map(([name, module]) => (
            <div key={name} className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
              <p className="font-black text-ink">{name}</p>
              <p className="mt-1 text-sm text-black/55">{module}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-black/10 bg-ink p-5 text-white shadow-soft sm:p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-jade">
              Desarrollado localmente
            </p>
            <h2 className="mt-2 text-2xl font-black leading-tight">
              Plataforma creada por VTEMGT / CodeQuetzal
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              El desarrollo y soporte del mercadito esta a cargo de CodeQuetzal,
              con enfoque en negocios locales, catalogos, QR y modulos por nicho.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {developerLinks.map(([label, href]) => (
              <a
                key={label}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white/15"
                href={href}
                rel="noreferrer"
                target="_blank"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
