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
      <section className="surface rounded-lg p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-jade">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-ink">{title}</h1>
        <p className="mt-3 max-w-2xl text-black/60">{description}</p>

        {actions.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {actions.map((action) => (
              <Link key={action.href} className="btn-primary" href={action.href}>
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="surface rounded-lg p-5">
        <h2 className="text-xl font-bold text-ink">Base del modulo</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <div key={item} className="rounded-lg bg-black/[0.03] p-4">
              <p className="font-semibold text-ink">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
