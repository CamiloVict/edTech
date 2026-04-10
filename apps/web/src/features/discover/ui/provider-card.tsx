import type { DiscoverProvider } from '@/features/discover/types';

function kindLabel(k: DiscoverProvider['kinds'][number]) {
  return k === 'TEACHER' ? 'Docente' : 'Babysitter / cuidado';
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="text-amber-500" aria-label={`${value} de 5 estrellas`}>
      {'★'.repeat(Math.min(5, full))}
      <span className="text-zinc-300">
        {'★'.repeat(Math.max(0, 5 - full))}
      </span>
    </span>
  );
}

export function ProviderCard({ p }: { p: DiscoverProvider }) {
  const name = p.fullName ?? 'Profesional';
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <div className="relative aspect-square w-full bg-zinc-100">
        {p.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URLs arbitrarias de perfil
          <img
            src={p.photoUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-semibold text-zinc-400">
            {initials}
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {p.kinds.map((k) => (
            <span
              key={k}
              className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-zinc-800 shadow-sm backdrop-blur"
            >
              {kindLabel(k)}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight text-zinc-900">
            {name}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
          <Stars value={p.averageRating} />
          <span>
            {p.averageRating.toFixed(1)} ({p.ratingCount}{' '}
            {p.ratingCount === 1 ? 'valoración' : 'valoraciones'})
          </span>
        </div>
        {p.city && (
          <p className="text-sm text-zinc-500">{p.city}</p>
        )}
        {p.bio && (
          <p className="line-clamp-3 text-sm leading-relaxed text-zinc-700">
            {p.bio}
          </p>
        )}
        {p.availabilitySummary && (
          <div className="mt-auto rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            <span className="font-medium">Disponibilidad: </span>
            {p.availabilitySummary}
          </div>
        )}
        {p.focusAreas.length > 0 && (
          <p className="text-xs text-zinc-500">
            {p.focusAreas.slice(0, 4).join(' · ')}
            {p.focusAreas.length > 4 ? '…' : ''}
          </p>
        )}
      </div>
    </article>
  );
}
