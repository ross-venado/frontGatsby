import { PublicTableOrder } from '@/components/restaurant/PublicTableOrder';
import { apiFetch } from '@/lib/api';
import type { PublicRestaurantTablePayload } from '@/types/mercadito';

type PageProps = {
  params: Promise<{ businessSlug: string; qrSlug: string }>;
};

export default async function PublicRestaurantTablePage({ params }: PageProps) {
  const { businessSlug, qrSlug } = await params;
  const payload = await apiFetch<PublicRestaurantTablePayload>(
    `/public/restaurants/${businessSlug}/tables/${qrSlug}`,
  );

  return <PublicTableOrder payload={payload} />;
}
