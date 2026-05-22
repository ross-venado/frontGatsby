'use client';

import { QRCodeSVG } from 'qrcode.react';

type BusinessQrProps = {
  value: string;
  label: string;
};

export function BusinessQr({ value, label }: BusinessQrProps) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <div className="grid aspect-square place-items-center rounded-md bg-white">
        <QRCodeSVG
          value={value}
          size={240}
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
