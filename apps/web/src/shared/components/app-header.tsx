'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

import { SiteLogo } from '@/shared/components/site-logo';
import {
  siteHeaderBarClass,
  siteHeaderInnerClass,
  siteHeaderNavLinkClass,
  siteHeaderNavLinkEmphasisClass,
  siteHeaderPageLabelClass,
  siteHeaderUserWrapClass,
} from '@/shared/components/site-header-theme';

export type AppHeaderLink = {
  href: string;
  label: string;
  /** Misma jerarquía visual que «Mi panel» en el menú público. */
  emphasized?: boolean;
};

export function AppHeader({
  pageLabel,
  links,
  logoHref = '/',
}: {
  pageLabel?: string;
  links: AppHeaderLink[];
  /** Inicio de la app (p. ej. catálogo o panel), no la landing de marketing. */
  logoHref?: string;
}) {
  return (
    <header className={siteHeaderBarClass}>
      <div className={siteHeaderInnerClass}>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-4">
          <SiteLogo href={logoHref} />
          {pageLabel ? (
            <span className={siteHeaderPageLabelClass}>{pageLabel}</span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <nav className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={
                  l.emphasized
                    ? siteHeaderNavLinkEmphasisClass
                    : siteHeaderNavLinkClass
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className={siteHeaderUserWrapClass}>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-9 w-9',
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
