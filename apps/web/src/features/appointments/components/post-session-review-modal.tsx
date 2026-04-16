'use client';

import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import {
  dismissAppointmentReviewPrompt,
  submitAppointmentReview,
  type AppointmentReviewAuthor,
  type AppointmentRow,
} from '@/features/appointments/api/appointments-api';
import { reviewPromptDeferSessionKey } from '@/features/appointments/lib/post-session-review-prompt';
import { ApiError } from '@/shared/lib/api';
import { Button } from '@/shared/components/ui/button';
import { Field, TextArea } from '@/shared/components/ui/field';

function starLabel(n: number): string {
  if (n === 1) return 'Muy mala';
  if (n === 2) return 'Mala';
  if (n === 3) return 'Regular';
  if (n === 4) return 'Buena';
  return 'Excelente';
}

export function PostSessionReviewModal({
  open,
  appointment,
  role,
  getToken,
  onClose,
  onUpdated,
}: {
  open: boolean;
  appointment: AppointmentRow | null;
  role: AppointmentReviewAuthor;
  getToken: () => Promise<string | null>;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!open) return;
    setStars(0);
    setComment('');
  }, [open, appointment?.id]);

  const submitMut = useMutation({
    mutationFn: async () => {
      if (!appointment) throw new Error('Cita no disponible');
      if (stars < 1 || stars > 5) {
        throw new Error('Elige una puntuación de 1 a 5 estrellas.');
      }
      return submitAppointmentReview(getToken, appointment.id, {
        stars,
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      });
    },
    onSuccess: () => {
      if (appointment && typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(reviewPromptDeferSessionKey(appointment.id, role));
      }
      onUpdated();
      onClose();
    },
  });

  const dismissMut = useMutation({
    mutationFn: async () => {
      if (!appointment) throw new Error('Cita no disponible');
      return dismissAppointmentReviewPrompt(getToken, appointment.id);
    },
    onSuccess: () => {
      if (appointment && typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(reviewPromptDeferSessionKey(appointment.id, role), '1');
      }
      onUpdated();
      onClose();
    },
  });

  const busy = submitMut.isPending || dismissMut.isPending;

  const defer = useCallback(() => {
    dismissMut.mutate();
  }, [dismissMut]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) defer();
    },
    [busy, defer],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onKey]);

  if (!open || !appointment) return null;

  const counterparty =
    role === 'CONSUMER'
      ? appointment.providerProfile.fullName?.trim() || 'el educador'
      : appointment.consumerProfile.fullName?.trim() || 'la familia';

  const title =
    role === 'CONSUMER'
      ? '¿Cómo fue la sesión con tu educador?'
      : '¿Cómo valoras a la familia en esta sesión?';

  const hint =
    role === 'CONSUMER'
      ? `Tu opinión ayuda a otras familias y reconoce el trabajo de ${counterparty}.`
      : `Tu valoración queda asociada a esta cita con ${counterparty}.`;

  const err =
    submitMut.error instanceof ApiError
      ? submitMut.error.message
      : submitMut.error instanceof Error
        ? submitMut.error.message
        : dismissMut.error instanceof ApiError
          ? dismissMut.error.message
          : dismissMut.error instanceof Error
            ? dismissMut.error.message
            : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={() => {
        if (!busy) defer();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-session-review-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-card shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-5 py-4">
          <h2 id="post-session-review-title" className="text-lg font-bold text-foreground">
            {title}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>

        <div className="space-y-4 px-5 py-4 text-sm">
          {err ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
              {err}
            </p>
          ) : null}

          <Field label="Puntuación" hint={stars ? starLabel(stars) : 'Toca las estrellas'}>
            <div className="flex flex-wrap gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={busy}
                  onClick={() => setStars(n)}
                  className={`rounded-lg px-2.5 py-1.5 text-lg transition ${
                    stars >= n
                      ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  aria-label={`${n} estrellas`}
                >
                  ★
                </button>
              ))}
            </div>
          </Field>

          <Field
            label="Comentario (opcional)"
            hint="Puedes dejarlo en blanco o contar cómo fue la experiencia."
          >
            <TextArea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              disabled={busy}
              placeholder="Ej.: puntualidad, comunicación, ambiente…"
            />
          </Field>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => defer()}
            >
              Ahora no
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={busy}
              onClick={() => submitMut.mutate()}
            >
              {submitMut.isPending ? 'Enviando…' : 'Enviar valoración'}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Si eliges «Ahora no», te recordaremos una vez más al volver. Después no volveremos a
            pedir valoración para esta cita.
          </p>
        </div>
      </div>
    </div>
  );
}
