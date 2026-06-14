'use client';

import { useId, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type BusinessShareKitProps = {
  businessName: string;
  publicUrl: string;
  whatsapp?: string;
};

function normalizedPhone(phone?: string) {
  return phone?.replace(/[^\d]/g, '') || '';
}

export function BusinessShareKit({
  businessName,
  publicUrl,
  whatsapp,
}: BusinessShareKitProps) {
  const rawId = useId();
  const qrId = `qr-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [message, setMessage] = useState('');
  const shareText = `Mira ${businessName} en Mercadito Chimalteco: ${publicUrl}`;
  const phone = normalizedPhone(whatsapp);
  const whatsappShareUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(shareText)}`
    : `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setMessage('Enlace copiado');
  }

  async function shareLocal() {
    if (navigator.share) {
      await navigator.share({
        title: businessName,
        text: shareText,
        url: publicUrl,
      });
      return;
    }

    await copyLink();
  }

  function downloadQr() {
    const svg = document.getElementById(qrId);
    if (!svg) return;

    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-qr.svg`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage('QR descargado');
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-soft sm:p-5">
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-jade">
              Listo para promocionar
            </p>
            <h2 className="mt-1 text-xl font-black leading-tight text-ink">
              Comparte tu local
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-jade/10 px-3 py-1 text-xs font-black text-jade">
            QR
          </span>
        </div>

        <div className="mt-4 grid place-items-center rounded-2xl border border-black/10 bg-[#f8f6f0] p-4">
          <div className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm">
            <QRCodeSVG
              id={qrId}
              value={publicUrl}
              size={176}
              level="H"
              marginSize={2}
              title={`QR de ${businessName}`}
              fgColor="#17202a"
              bgColor="#ffffff"
            />
          </div>
        </div>

        <div className="mt-4 min-w-0">
          <p className="rounded-xl border border-black/10 bg-black/[0.02] px-3 py-2 text-xs leading-5 text-black/58 [overflow-wrap:anywhere]">
            {publicUrl}
          </p>

          <a
            className="btn-primary mt-4 min-h-11 w-full justify-center"
            href={whatsappShareUrl}
            target="_blank"
          >
            Enviar por WhatsApp
          </a>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              className="btn-secondary min-h-11 px-2 text-xs sm:text-sm"
              type="button"
              onClick={() => void copyLink()}
            >
              Copiar
            </button>
            <button
              className="btn-secondary min-h-11 px-2 text-xs sm:text-sm"
              type="button"
              onClick={() => void shareLocal()}
            >
              Compartir
            </button>
            <button
              className="btn-secondary min-h-11 px-2 text-xs sm:text-sm"
              type="button"
              onClick={downloadQr}
            >
              QR
            </button>
          </div>
          {message ? <p className="mt-3 text-sm font-semibold text-jade">{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
