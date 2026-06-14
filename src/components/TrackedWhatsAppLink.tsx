'use client';

import type { ReactNode } from 'react';
import { trackPublicBusinessEvent } from '@/lib/api';

type TrackedWhatsAppLinkProps = {
  businessSlug: string;
  children: ReactNode;
  className?: string;
  href: string;
  source: string;
};

export function TrackedWhatsAppLink({
  businessSlug,
  children,
  className,
  href,
  source,
}: TrackedWhatsAppLinkProps) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      onClick={() => {
        trackPublicBusinessEvent(businessSlug, 'whatsapp_click', { source });
      }}
    >
      {children}
    </a>
  );
}
