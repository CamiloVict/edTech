'use client';

import { useEffect, useMemo, useState } from 'react';
import { PLATFORM_DEFAULT_CURRENCY } from '@repo/currency';

import type { AgeBand, EducatorOffer, OfferType, ServiceMode } from '@/features/educator-hub/domain/types';
import { newOfferId } from '@/features/educator-hub/lib/local-offers-storage';
import { parseMoneyInputToMajorUnits } from '@/shared/lib/parse-money-input';
import { buttonStyles } from '@/shared/components/ui/button';

const AGE_OPTIONS: { id: AgeBand; label: string }[] = [
  { id: '0_3', label: '0–3 años' },
  { id: '4_7', label: '4–7 años' },
  { id: '8_12', label: '8–12 años' },
  { id: '13_18', label: '13–18 años' },
];

const TYPE_OPTIONS: { id: OfferType; label: string }[] = [
  { id: 'ONE_TO_ONE', label: '1:1' },
  { id: 'WORKSHOP', label: 'Taller / grupo' },
  { id: 'MINI_COURSE', label: 'Mini curso o paquete' },
  { id: 'AGE_PROGRAM', label: 'Programa por edad' },
  { id: 'LEARNING_PATH', label: 'Ruta de aprendizaje' },
  { id: 'EXPERIENCE', label: 'Experiencia / evento' },
  { id: 'CUSTOM', label: 'Personalizada (libre)' },
];

const MODE_OPTIONS: { id: ServiceMode; label: string }[] = [
  { id: 'IN_PERSON', label: 'Presencial' },
  { id: 'ONLINE', label: 'Online' },
  { id: 'HYBRID', label: 'Híbrido' },
];

export const OFFER_SUGGESTIONS: {
  label: string;
  hint: string;
  patch: Partial<EducatorOffer>;
}[] = [
  {
    label: '1:1 · sesión',
    hint: 'Un estudiante, duración típica',
    patch: {
      type: 'ONE_TO_ONE',
      durationMinutes: 60,
      maxSeats: 1,
      title: 'Clase individual',
      suggestedFrequency: '1 sesión / semana',
    },
  },
  {
    label: 'Paquete de sesiones',
    hint: 'Varias citas con un foco',
    patch: {
      type: 'MINI_COURSE',
      durationMinutes: 45,
      maxSeats: 1,
      title: 'Paquete de sesiones 1:1',
      suggestedFrequency: '2 sesiones / semana',
    },
  },
  {
    label: 'Taller grupal',
    hint: 'Grupo pequeño, un tema',
    patch: {
      type: 'WORKSHOP',
      durationMinutes: 90,
      maxSeats: 12,
      title: 'Taller grupal',
      suggestedFrequency: '1 encuentro / quincena',
    },
  },
  {
    label: 'Club o programa recurrente',
    hint: 'Misma cohorte varias semanas',
    patch: {
      type: 'AGE_PROGRAM',
      durationMinutes: 60,
      maxSeats: 8,
      title: 'Club semanal',
      suggestedFrequency: '1 sesión / semana',
    },
  },
  {
    label: 'Ruta personalizada',
    hint: 'Objetivos a mediano plazo',
    patch: {
      type: 'LEARNING_PATH',
      durationMinutes: 50,
      maxSeats: 6,
      title: 'Ruta de aprendizaje',
      suggestedFrequency: '2 sesiones / semana',
    },
  },
  {
    label: 'Evento único',
    hint: 'Intensivo o visita',
    patch: {
      type: 'EXPERIENCE',
      durationMinutes: 180,
      maxSeats: 15,
      title: 'Experiencia educativa',
      suggestedFrequency: 'Evento puntual',
    },
  },
  {
    label: 'En blanco',
    hint: 'Sin sugerencias; tú defines todo',
    patch: {
      type: 'CUSTOM',
      title: '',
      description: '',
      durationMinutes: 60,
      maxSeats: null,
      suggestedFrequency: 'A convenir con la familia',
    },
  },
];

function createEmptyOffer(): EducatorOffer {
  return {
    id: newOfferId(),
    type: 'ONE_TO_ONE',
    title: '',
    category: '',
    description: '',
    ageBands: [],
    modality: 'HYBRID',
    durationMinutes: 60,
    priceMinor: 0,
    currency: PLATFORM_DEFAULT_CURRENCY,
    objectives: [],
    methodologyNote: '',
    suggestedFrequency: 'A convenir',
    maxSeats: 1,
    status: 'DRAFT',
    bookingsCount: 0,
    viewsCount: 0,
  };
}

function minorToPriceInputString(minor: number): string {
  if (!Number.isFinite(minor) || minor <= 0) return '';
  const major = Math.round(minor / 100);
  return major.toLocaleString('es-CO');
}

function parsePriceMinor(raw: string): { ok: true; minor: number } | { ok: false; message: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, message: 'Indica un precio en COP.' };
  const major = parseMoneyInputToMajorUnits(trimmed);
  if (!Number.isFinite(major) || major <= 0) return { ok: false, message: 'Precio no válido. Ejemplo: 80.000 o 80000' };
  const minor = Math.round(major * 100);
  return { ok: true, minor };
}

export type EducatorOfferEditorMode = 'create' | 'edit';

export type EducatorOfferEditorProps = {
  open: boolean;
  onClose: () => void;
  /** null = nueva oferta desde cero */
  seed: EducatorOffer | null;
  mode: EducatorOfferEditorMode;
  onSave: (offer: EducatorOffer, intent: 'draft' | 'publish') => void | Promise<void>;
};

export function EducatorOfferEditorModal({
  open,
  onClose,
  seed,
  mode,
  onSave,
}: EducatorOfferEditorProps) {
  const [form, setForm] = useState<EducatorOffer>(() => createEmptyOffer());
  const [priceInput, setPriceInput] = useState('');
  const [objectivesText, setObjectivesText] = useState('');
  const [maxSeatsInput, setMaxSeatsInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const seedKey = seed ? seed.id : 'new';

  useEffect(() => {
    if (!open) return;
    const base = seed ? { ...seed } : createEmptyOffer();
    setForm(base);
    setPriceInput(minorToPriceInputString(base.priceMinor));
    setObjectivesText((base.objectives ?? []).join('\n'));
    setMaxSeatsInput(base.maxSeats == null ? '' : String(base.maxSeats));
    setError(null);
  }, [open, seedKey, seed]);

  const dialogTitle = useMemo(() => (mode === 'create' ? 'Nueva oferta' : 'Editar oferta'), [mode]);

  function applySuggestion(patch: Partial<EducatorOffer>) {
    setForm((prev) => ({
      ...prev,
      ...patch,
      id: prev.id,
      currency: prev.currency,
      bookingsCount: prev.bookingsCount,
      viewsCount: prev.viewsCount,
      status: prev.status,
    }));
    if (typeof patch.priceMinor === 'number' && patch.priceMinor > 0) {
      setPriceInput(minorToPriceInputString(patch.priceMinor));
    }
    if (patch.maxSeats !== undefined) {
      setMaxSeatsInput(patch.maxSeats == null ? '' : String(patch.maxSeats));
    }
    setError(null);
  }

  function toggleAge(b: AgeBand) {
    setForm((prev) => ({
      ...prev,
      ageBands: prev.ageBands.includes(b) ? prev.ageBands.filter((x) => x !== b) : [...prev.ageBands, b],
    }));
  }

  function buildOfferForSave(status: 'DRAFT' | 'PUBLISHED'): EducatorOffer | null {
    const objectives = objectivesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    let maxSeats: number | null = form.maxSeats;
    const ms = maxSeatsInput.trim();
    if (ms === '') maxSeats = null;
    else {
      const n = Number(ms);
      if (!Number.isInteger(n) || n < 1) {
        setError('Cupos: número entero ≥ 1, o vacío para “sin límite en texto”.');
        return null;
      }
      maxSeats = n;
    }

    const priceTrim = priceInput.trim();
    let priceMinor = 0;
    if (priceTrim === '') {
      if (status === 'PUBLISHED') {
        setError('Indica un precio en COP para publicar.');
        return null;
      }
      priceMinor = 0;
    } else {
      const parsed = parsePriceMinor(priceTrim);
      if (!parsed.ok) {
        setError(parsed.message);
        return null;
      }
      priceMinor = parsed.minor;
      if (status === 'PUBLISHED' && priceMinor <= 0) {
        setError('El precio debe ser mayor que cero para publicar.');
        return null;
      }
    }

    const t = form.title.trim();
    const d = form.description.trim();
    if (status === 'PUBLISHED') {
      if (t.length < 2) {
        setError('El título debe tener al menos 2 caracteres para publicar.');
        return null;
      }
      if (d.length < 20) {
        setError('La descripción debe tener al menos 20 caracteres para publicar (puedes guardar borrador antes).');
        return null;
      }
      if (!form.durationMinutes || form.durationMinutes < 15) {
        setError('Duración mínima sugerida: 15 minutos.');
        return null;
      }
    }

    return {
      ...form,
      title: t,
      description: d,
      objectives,
      methodologyNote: form.methodologyNote.trim(),
      category: form.category.trim(),
      suggestedFrequency: form.suggestedFrequency.trim() || 'A convenir',
      maxSeats,
      priceMinor,
      currency: PLATFORM_DEFAULT_CURRENCY,
      status,
    };
  }

  async function handleSave(intent: 'draft' | 'publish') {
    setError(null);
    const next = buildOfferForSave(intent === 'publish' ? 'PUBLISHED' : 'DRAFT');
    if (!next) return;
    try {
      await onSave(next, intent);
      onClose();
    } catch (e) {
      const msg =
        e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string'
          ? (e as { message: string }).message
          : 'No se pudo guardar. Inténtalo de nuevo.';
      setError(msg);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-editor-title"
        className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-2xl flex-col rounded-t-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <div>
            <h2 id="offer-editor-title" className="text-lg font-semibold text-[var(--foreground)]">
              {dialogTitle}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Sugerencias abajo; puedes cambiar cualquier campo. Nada queda fijo hasta que guardes.
            </p>
          </div>
          <button type="button" onClick={onClose} className={buttonStyles('ghost', 'shrink-0 rounded-lg px-2 py-1')}>
            Cerrar
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Ideas para empezar
            </p>
            <div className="flex flex-wrap gap-2">
              {OFFER_SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => applySuggestion(s.patch)}
                  className="max-w-full rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2 text-left text-sm transition hover:bg-[var(--muted)]"
                >
                  <span className="font-medium text-[var(--foreground)]">{s.label}</span>
                  <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{s.hint}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">Tipo de oferta</span>
              <select
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as OfferType }))}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">Área o etiqueta (opcional)</span>
              <input
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="Ej. lectoescritura, STEAM, crianza respetuosa…"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">Título</span>
              <input
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Nombre que verán las familias"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">Descripción</span>
              <textarea
                className="mt-1 min-h-[120px] w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Qué incluye, materiales, nivel, lo que la familia debe saber…"
              />
            </label>

            <fieldset>
              <legend className="text-sm font-medium text-[var(--foreground)]">Edades (opcional)</legend>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Vacío = no restringes por edad en el texto.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {AGE_OPTIONS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAge(a.id)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                      form.ageBands.includes(a.id)
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">Modalidad</span>
              <select
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                value={form.modality}
                onChange={(e) => setForm((p) => ({ ...p, modality: e.target.value as ServiceMode }))}
              >
                {MODE_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-[var(--foreground)]">Duración (minutos)</span>
                <input
                  type="number"
                  min={15}
                  step={5}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm tabular-nums"
                  value={form.durationMinutes || ''}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, durationMinutes: Number(e.target.value) || 0 }))
                  }
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[var(--foreground)]">Precio (COP)</span>
                <input
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm tabular-nums"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="Ej. 80.000"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">Frecuencia sugerida (texto libre)</span>
              <input
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                value={form.suggestedFrequency}
                onChange={(e) => setForm((p) => ({ ...p, suggestedFrequency: e.target.value }))}
                placeholder="Ej. 1 sesión / semana, flexible por chat…"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">Cupos máx. (opcional)</span>
              <input
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm tabular-nums"
                value={maxSeatsInput}
                onChange={(e) => setMaxSeatsInput(e.target.value)}
                placeholder="Vacío si no quieres fijar número"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">Objetivos (uno por línea, opcional)</span>
              <textarea
                className="mt-1 min-h-[72px] w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                value={objectivesText}
                onChange={(e) => setObjectivesText(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">Metodología o notas (opcional)</span>
              <textarea
                className="mt-1 min-h-[72px] w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                value={form.methodologyNote}
                onChange={(e) => setForm((p) => ({ ...p, methodologyNote: e.target.value }))}
              />
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-[var(--border)] bg-[var(--card)] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={onClose} className={buttonStyles('secondary', 'w-full rounded-xl sm:w-auto')}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSave('draft')}
            className={buttonStyles('secondary', 'w-full rounded-xl sm:w-auto')}
          >
            Guardar borrador
          </button>
          <button
            type="button"
            onClick={() => handleSave('publish')}
            className={buttonStyles('primary', 'w-full rounded-xl sm:w-auto')}
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  );
}
