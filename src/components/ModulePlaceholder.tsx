'use client';

import Link from 'next/link';

type ModulePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: Array<{ href: string; label: string }>;
  items: string[];
};

export function ModulePlaceholder({
  actions = [],
  description,
  eyebrow,
  items,
  title,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-black/10 bg-ink text-white shadow-soft">
        <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_260px] md:items-center md:p-7">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-jade">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight md:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              {description}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-white/55">
              Siguiente fase
            </p>
            <p className="mt-2 text-2xl font-black text-white">Listo para crecer</p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              La base comercial ya esta activa. El historial y flujos internos se
              conectan encima de este modulo.
            </p>
          </div>
        </div>

        {actions.length ? (
          <div className="flex flex-wrap gap-2 border-t border-white/10 px-5 pb-5 md:px-7 md:pb-7">
            {actions.map((action) => (
              <Link key={action.href} className="btn-primary" href={action.href}>
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="surface rounded-2xl p-5">
        <h2 className="text-xl font-black text-ink">Base del modulo</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <div key={item} className="rounded-xl border border-black/10 bg-black/[0.03] p-4">
              <p className="font-semibold text-ink">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
