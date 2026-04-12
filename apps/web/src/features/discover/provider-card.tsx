import Image from 'next/image';
import Link from 'next/link';

type Provider = {
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

export type ProviderCardCta = {
  primaryLabel: string;
  hint?: string;
  secondaryLink?: { href: string; label: string };
};

const kindLabel: Record<string, string> = {
  TEACHER: 'Profesor',
  BABYSITTER: 'Cuidador/a',
  TUTOR: 'Tutoría',
};

export function ProviderCard({
  provider,
  cta,
  onViewDetails,
}: {
  provider: Provider;
  cta: ProviderCardCta;
  onViewDetails: () => void;
}) {
  const rating =
    provider.averageRating != null
      ? provider.averageRating.toFixed(1)
      : 'Sin valorar';
  const kinds = provider.kinds.map((k) => kindLabel[k] ?? k).join(' · ');

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:border-emerald-200/80 hover:shadow-md">
      <div className="relative h-40 w-full bg-gradient-to-br from-emerald-100 to-stone-100">
        {provider.photoUrl ? (
          <Image
            src={provider.photoUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-semibold text-emerald-800/40">
            {provider.displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
            provider.isAvailable
              ? 'bg-emerald-800 text-white'
              : 'bg-stone-700 text-white'
          }`}
        >
          {provider.isAvailable ? 'Disponible' : 'No disponible'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-semibold text-stone-900">
            {provider.displayName}
          </h3>
          {provider.headline ? (
            <p className="mt-1 text-sm text-stone-600">{provider.headline}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {kinds ? (
            <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-700">
              {kinds}
            </span>
          ) : null}
          <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-900">
            ★ {rating}
            {provider.reviewCount > 0
              ? ` (${provider.reviewCount})`
              : ''}
          </span>
        </div>
        {provider.availabilityText ? (
          <p className="text-sm text-stone-600 line-clamp-2">
            {provider.availabilityText}
          </p>
        ) : null}
        {provider.bio ? (
          <p className="line-clamp-3 text-sm text-stone-500">{provider.bio}</p>
        ) : null}
        <div className="mt-auto space-y-2 border-t border-stone-100 pt-3">
          {cta.hint ? (
            <p className="text-xs leading-snug text-stone-500">{cta.hint}</p>
          ) : null}
          <button
            type="button"
            onClick={onViewDetails}
            className="w-full rounded-xl bg-emerald-800 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-900"
          >
            {cta.primaryLabel}
          </button>
          {cta.secondaryLink ? (
            <Link
              href={cta.secondaryLink.href}
              className="block text-center text-xs font-semibold text-emerald-900 underline"
            >
              {cta.secondaryLink.label}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
