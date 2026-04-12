'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { ProviderCard } from '@/features/discover/provider-card';
import { publicApiRequest } from '@/shared/lib/api';
import { Field, Select } from '@/shared/components/ui/field';

export type DiscoverProvider = {
  id: string;
  displayName: string;
  headline: string | null;
  bio: string | null;
  photoUrl: string | null;
  kinds: string[];
  averageRating: number | null;
  reviewCount: number;
  isAvailable: boolean;
  availabilityText: string | null;
};

/** Respuesta del API Nest: array (no envuelto en `{ items }`). */
type DiscoverProviderApiRow = {
  id: string;
  fullName: string | null;
  bio: string | null;
  photoUrl: string | null;
  kinds: string[];
  averageRating: number;
  ratingCount: number;
  availabilitySummary: string | null;
  city: string | null;
};

function mapDiscoverRow(row: DiscoverProviderApiRow): DiscoverProvider {
  const rating =
    typeof row.averageRating === 'number' && !Number.isNaN(row.averageRating)
      ? row.averageRating
      : null;
  return {
    id: row.id,
    displayName: row.fullName?.trim() || 'Educador',
    headline: row.city,
    bio: row.bio,
    photoUrl: row.photoUrl,
    kinds: row.kinds,
    averageRating: rating,
    reviewCount: row.ratingCount,
    isAvailable: true,
    availabilityText: row.availabilitySummary,
  };
}

export function ProviderDiscovery() {
  const [kind, setKind] = useState<string>('');

  const query = useQuery({
    queryKey: ['discover', 'providers', kind],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (kind) params.set('kind', kind);
      const qs = params.toString();
      const raw = await publicApiRequest<DiscoverProviderApiRow[]>(
        `/discover/providers${qs ? `?${qs}` : ''}`,
      );
      return raw.map(mapDiscoverRow);
    },
  });

  const items = query.data ?? [];
  const empty = !query.isLoading && items.length === 0;

  return (
    <div className="space-y-4">
      <div className="max-w-md rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <Field label="Tipo de servicio">
          <Select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">Todos</option>
            <option value="TEACHER">Profesor particular</option>
            <option value="BABYSITTER">Cuidador/a infantil</option>
          </Select>
        </Field>
      </div>

      {query.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          No pudimos cargar el listado. Comprueba la conexión o inténtalo de
          nuevo.
        </div>
      ) : null}

      {query.isLoading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-stone-500 shadow-sm">
          Cargando educadores…
        </div>
      ) : empty ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-10 text-center text-stone-600">
          No hay perfiles que coincidan con el filtro. Prueba con otro tipo de
          servicio.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}
    </div>
  );
}
