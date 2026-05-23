'use client';

import { ChangeEvent, useState } from 'react';

type ImageUrlFieldProps = {
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  previewLabel?: string;
};

const maxFileSize = 5 * 1024 * 1024;
const maxDataUrlLength = 60_000;

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen.'));
    };
    image.src = url;
  });
}

async function compressImage(file: File) {
  const image = await loadImage(file);
  let maxSide = 900;
  let quality = 0.72;

  for (let attempt = 0; attempt < 9; attempt += 1) {
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Tu navegador no pudo procesar la imagen.');
    }

    canvas.width = width;
    canvas.height = height;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', quality);

    if (dataUrl.length <= maxDataUrlLength) {
      return dataUrl;
    }

    quality = Math.max(0.38, quality - 0.08);
    maxSide = Math.max(420, maxSide - 90);
  }

  throw new Error('La imagen sigue muy pesada. Usa un link externo por ahora.');
}

export function ImageUrlField({
  label,
  name,
  value,
  onChange,
  previewLabel = 'Vista previa',
}: ImageUrlFieldProps) {
  const [error, setError] = useState('');

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    setError('');
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Selecciona una imagen valida.');
      return;
    }

    if (file.size > maxFileSize) {
      setError('La imagen debe pesar menos de 5 MB.');
      return;
    }

    try {
      onChange(await compressImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo comprimir la imagen.');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1 grid gap-3 sm:grid-cols-[1fr_140px]">
        <input
          className="field"
          name={name}
          value={value}
          onChange={(event) => {
            setError('');
            onChange(event.target.value);
          }}
          placeholder="https://..."
        />
        <label className="btn-secondary cursor-pointer">
          Subir
          <input
            accept="image/*"
            className="sr-only"
            type="file"
            onChange={handleFile}
          />
        </label>
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-black/10 bg-black/[0.03]">
        {value ? (
          <div
            aria-label={previewLabel}
            className="h-32 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${value})` }}
          />
        ) : (
          <div className="grid h-24 place-items-center px-4 text-center text-sm text-black/45">
            Pega un link o sube una imagen. Se comprimira para esta demo.
          </div>
        )}
      </div>
      {value.startsWith('data:') ? (
        <p className="mt-2 text-xs text-black/45">
          Imagen comprimida para demo. En produccion conviene guardar archivo en storage.
        </p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </label>
  );
}
