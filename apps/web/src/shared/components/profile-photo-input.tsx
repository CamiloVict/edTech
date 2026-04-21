'use client';

import { useCallback, useId, useRef, useState } from 'react';

import { imageFileToStoredDataUrl } from '@/shared/lib/profile-image';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/field';

export type ProfilePhotoInputProps = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  /** Texto del campo de enlace manual (https…). */
  urlLabel?: string;
  urlHint?: string;
};

/**
 * Foto de perfil: subir archivo desde el dispositivo, tomar foto con la cámara, o pegar URL.
 * Los vídeos en “Elegir archivo” aún no se persisten; se muestra un aviso (solo imágenes).
 */
export function ProfilePhotoInput({
  value,
  onChange,
  disabled = false,
  urlLabel = 'O pega un enlace público (opcional)',
  urlHint = 'Si la imagen ya está en internet (Drive, Dropbox con enlace directo, etc.).',
}: ProfilePhotoInputProps) {
  const id = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHttpUrl = value.trim().startsWith('http');
  const isDataImage = value.startsWith('data:image/');
  const urlInputValue = isHttpUrl ? value : '';

  const handleFile = useCallback(
    async (file: File | null) => {
      setError(null);
      if (!file) return;
      if (file.type.startsWith('video/')) {
        setError(
          'Los vídeos aún no se pueden guardar desde el archivo. Más adelante habrá subida directa; de momento puedes usar solo imagen o un enlace público al vídeo.',
        );
        return;
      }
      setBusy(true);
      try {
        const dataUrl = await imageFileToStoredDataUrl(file);
        onChange(dataUrl);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo procesar la imagen.');
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  const onPickFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;
      e.target.value = '';
      void handleFile(f);
    },
    [handleFile],
  );

  return (
    <div className="space-y-3">
      {(isDataImage || isHttpUrl) && value.trim() ? (
        <div className="flex flex-wrap items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Vista previa de la foto de perfil"
            className="h-24 w-24 shrink-0 rounded-xl border border-border object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            className="text-xs"
            disabled={disabled || busy}
            onClick={() => onChange('')}
          >
            Quitar foto
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || busy}
          onClick={() => fileInputRef.current?.click()}
        >
          {busy ? 'Procesando…' : 'Elegir archivo'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || busy}
          onClick={() => cameraInputRef.current?.click()}
        >
          Tomar foto
        </Button>
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">
        “Elegir archivo” abre galería o carpetas (móvil o PC). “Tomar foto” usa la cámara cuando el
        dispositivo lo permite. Solo se guardan imágenes; los vídeos, por ahora, con enlace.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept="image/*,video/*"
        aria-hidden
        tabIndex={-1}
        disabled={disabled || busy}
        onChange={onPickFiles}
      />
      <input
        ref={cameraInputRef}
        type="file"
        className="sr-only"
        accept="image/*"
        capture="environment"
        aria-hidden
        tabIndex={-1}
        disabled={disabled || busy}
        onChange={onPickFiles}
      />

      {error ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <span className="text-base font-semibold text-foreground">{urlLabel}</span>
        {urlHint ? (
          <span className="-mt-0.5 text-sm leading-relaxed text-muted-foreground">{urlHint}</span>
        ) : null}
        <Input
          id={`${id}-url`}
          value={urlInputValue}
          disabled={disabled || busy}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
        />
      </div>
    </div>
  );
}
