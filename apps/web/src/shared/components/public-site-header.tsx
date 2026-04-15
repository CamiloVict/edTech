'use client';

import { UserButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';

import { useBootstrapQuery } from '@/features/bootstrap/hooks/use-bootstrap';
import { consumerHubHref } from '@/features/consumer/lib/consumer-hub';
import { SiteLogo } from '@/shared/components/site-logo';
import {
  siteHeaderBarClass,
  siteHeaderInnerClass,
  siteHeaderNavLinkClass,
  siteHeaderNavLinkEmphasisClass,
  siteHeaderUserWrapClass,
} from '@/shared/components/site-header-theme';
import { buttonStyles } from '@/shared/components/ui/button';

export function PublicSiteHeader() {
  const { isSignedIn, isLoaded } = useAuth();
  const bootstrapQuery = useBootstrapQuery({
    enabled: Boolean(isLoaded && isSignedIn),
  });

  const boot = bootstrapQuery.data;
  const navLoading = isSignedIn && (bootstrapQuery.isFetching || bootstrapQuery.isPending);

  const logoHref =
    isLoaded &&
    isSignedIn &&
    boot &&
    !navLoading &&
    !bootstrapQuery.isError
      ? boot.needsRoleSelection
        ? '/role'
        : boot.needsOnboarding && boot.user.role
          ? boot.user.role === 'CONSUMER'
            ? '/onboarding/consumer'
            : '/onboarding/provider'
          : boot.user.role === 'CONSUMER'
            ? '/explorar'
            : boot.user.role === 'PROVIDER'
              ? '/dashboard/provider'
              : '/'
      : '/';

  return (
    <header className={siteHeaderBarClass}>
      <div className={siteHeaderInnerClass}>
        <SiteLogo href={logoHref} />
        <nav className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          {!isLoaded ? (
            <span className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
          ) : !isSignedIn ? (
            <>
              <Link
                href="/sign-in"
                className={`${siteHeaderNavLinkClass} sm:px-4`}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/sign-up"
                className={buttonStyles('primary', 'px-3 py-2 sm:px-4')}
              >
                Crear cuenta
              </Link>
            </>
          ) : (
            <>
              <Link href="/explorar" className={siteHeaderNavLinkClass}>
                Educadores
              </Link>

              {navLoading ? (
                <span className="px-2 py-2 text-xs text-muted-foreground">Cargando menú…</span>
              ) : bootstrapQuery.isError ? (
                <Link
                  href="/mi-espacio"
                  className={buttonStyles('primary', 'px-3 py-2 text-sm')}
                >
                  Activar mi cuenta
                </Link>
              ) : boot?.needsRoleSelection ? (
                <Link
                  href="/role"
                  className={buttonStyles('primary', 'px-3 py-2 text-sm')}
                >
                  Elegir perfil
                </Link>
              ) : boot?.needsOnboarding && boot.user.role ? (
                <Link
                  href={
                    boot.user.role === 'CONSUMER'
                      ? '/onboarding/consumer'
                      : '/onboarding/provider'
                  }
                  className={buttonStyles('primary', 'px-3 py-2 text-sm')}
                >
                  Completar registro
                </Link>
              ) : boot?.user.role === 'CONSUMER' ? (
                <>
                  <Link
                    href={consumerHubHref('resumen')}
                    className={siteHeaderNavLinkEmphasisClass}
                  >
                    Mi espacio
                  </Link>
                  <Link
                    href={consumerHubHref('familia')}
                    className={siteHeaderNavLinkClass}
                  >
                    Familia y datos
                  </Link>
                </>
              ) : boot?.user.role === 'PROVIDER' ? (
                <>
                  <Link
                    href="/dashboard/provider"
                    className={siteHeaderNavLinkEmphasisClass}
                  >
                    Mi panel
                  </Link>
                  <Link href="/profile/provider" className={siteHeaderNavLinkClass}>
                    Mi perfil
                  </Link>
                </>
              ) : (
                <Link
                  href="/mi-espacio"
                  className={buttonStyles('primary', 'px-3 py-2 text-sm')}
                >
                  Ir a mi espacio
                </Link>
              )}

              <div className={siteHeaderUserWrapClass}>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'h-9 w-9',
                    },
                  }}
                />
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
