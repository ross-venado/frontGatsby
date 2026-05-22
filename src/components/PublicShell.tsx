export function PublicShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-jade">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-4xl font-bold tracking-normal text-ink md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 text-lg leading-8 text-black/65">{description}</p>
        ) : null}
      </div>
      <div className="mt-8">{children}</div>
    </main>
  );
}
