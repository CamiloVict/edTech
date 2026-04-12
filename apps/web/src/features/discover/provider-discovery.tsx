'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { useBootstrapQuery } from '@/features/bootstrap/hooks/use-bootstrap';
import { ProviderCard } from '@/features/discover/provider-card';
import { ProviderDetailModal } from '@/features/discover/provider-detail-modal';
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

function useDiscoverViewer() {
  const { userId, isLoaded } = useAuth();
  const bootstrapQuery = useBootstrapQuery({
    enabled: Boolean(isLoaded && userId),
  });

  return useMemo(() => {
    const boot = bootstrapQuery.data;
    const isSignedIn = Boolean(userId);
    const role = boot?.user.role ?? null;
    const consumerComplete =
      boot?.consumerProfile?.isProfileCompleted === true;
    const canBook = role === 'CONSUMER' && consumerComplete;
    const isProviderViewer = role === 'PROVIDER';

    return {
      isLoaded,
      isSignedIn,
      role,
      canBook,
      isProviderViewer,
      bootstrapPending: Boolean(userId) && bootstrapQuery.isPending,
      needsRoleSelection: boot?.needsRoleSelection === true,
    };
  }, [
    userId,
    isLoaded,
    bootstrapQuery.data,
    bootstrapQuery.isPending,
  ]);
}

export function ProviderDiscovery() {
  const [kind, setKind] = useState<string>('');
  const [selected, setSelected] = useState<DiscoverProvider | null>(null);
  const viewer = useDiscoverViewer();

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

  const cardCta = useMemo(() => {
    if (!viewer.isLoaded || viewer.bootstrapPending) {
      return {
        primaryLabel: 'Ver ficha',
        hint: 'Cargando…',
      };
    }
    if (!viewer.isSignedIn) {
      return {
        primaryLabel: 'Ver ficha',
        hint: 'Inicia sesión para ver tarifas y solicitar cita.',
      };
    }
    if (viewer.isProviderViewer) {
      return {
        primaryLabel: 'Ver ficha',
        hint: 'Vista de educador: revisa tarifas y ventanas de colegas.',
      };
    }
    if (viewer.canBook) {
      return {
        primaryLabel: 'Ver ficha y tarifas',
        hint: 'Podrás solicitar una cita si hay ventanas publicadas.',
      };
    }
    if (viewer.role === 'CONSUMER') {
      return {
        primaryLabel: 'Ver ficha y tarifas',
        hint: 'Completa tu perfil de familia para poder solicitar citas.',
        secondaryLink: {
          href: '/profile/consumer',
          label: 'Completar perfil',
        },
      };
    }
    if (viewer.needsRoleSelection) {
      return {
        primaryLabel: 'Ver ficha',
        hint: 'Elige perfil familia para ver tarifas y reservar con educadores.',
        secondaryLink: { href: '/role', label: 'Elegir perfil' },
      };
    }
    return {
      primaryLabel: 'Ver ficha',
      hint: 'Regístrate como familia para ver tarifas y solicitar citas.',
      secondaryLink: { href: '/mi-espacio', label: 'Ir a mi espacio' },
    };
  }, [viewer]);

  const modalViewer = useMemo(
    () => ({
      isSignedIn: viewer.isSignedIn,
      canBook: viewer.canBook,
      isProviderViewer: viewer.isProviderViewer,
    }),
    [viewer.isSignedIn, viewer.canBook, viewer.isProviderViewer],
  );

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
            <ProviderCard
              key={p.id}
              provider={p}
              cta={cardCta}
              onViewDetails={() => setSelected(p)}
            />
          ))}
        </div>
      )}

      <ProviderDetailModal
        open={selected !== null}
        onClose={() => setSelected(null)}
        summary={selected}
        viewer={modalViewer}
      />
    </div>
  );
}
