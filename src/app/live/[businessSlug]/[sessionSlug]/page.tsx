import { notFound } from 'next/navigation';
import { PublicLiveSale } from '@/components/live/PublicLiveSale';
import { apiFetch } from '@/lib/api';
import type { LiveSession } from '@/types/mercadito';

type PageProps = {
  params: Promise<{ businessSlug: string; sessionSlug: string }>;
};

export default async function LiveSalePage({ params }: PageProps) {
  const { businessSlug, sessionSlug } = await params;
  const session = await apiFetch<LiveSession>(
    `/public/live/${businessSlug}/${sessionSlug}`,
  ).catch(() => null);

  if (!session) {
    notFound();
  }

  return (
    <PublicLiveSale
      businessSlug={businessSlug}
      initialSession={session}
      sessionSlug={sessionSlug}
    />
  );
}
