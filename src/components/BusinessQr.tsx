'use client';

import { QRCodeSVG } from 'qrcode.react';

type BusinessQrProps = {
  value: string;
  label: string;
  size?: number;
};

export function BusinessQr({ value, label, size = 240 }: BusinessQrProps) {
  return (
    <div className="inline-block max-w-full rounded-lg border border-black/10 bg-white p-4">
      <div className="grid aspect-square place-items-center rounded-md bg-white">
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          marginSize={2}
          title={label}
          fgColor="#17202a"
          bgColor="#ffffff"
        />
      </div>
    </div>
  );
}
