import Link from 'next/link';

type SiteLogoProps = {
  href?: string;
  className?: string;
};

export function SiteLogo({ href = '/', className = '' }: SiteLogoProps) {
  const mark = (
    <span
      className={`inline-flex items-baseline gap-0.5 text-xl font-bold tracking-tight ${className}`}
    >
      <span className="text-emerald-700">Trofo</span>
      <span className="text-stone-900">School</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="rounded-md outline-none ring-emerald-600/0 transition hover:opacity-90 focus-visible:ring-2">
        {mark}
      </Link>
    );
  }

  return mark;
}
