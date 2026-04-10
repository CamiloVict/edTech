'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export function AppHeader({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 py-4">
      <div className="flex flex-wrap items-center gap-6">
        <span className="font-semibold">{title}</span>
        <nav className="flex flex-wrap gap-4 text-sm text-zinc-700">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-zinc-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <UserButton />
    </header>
  );
}
