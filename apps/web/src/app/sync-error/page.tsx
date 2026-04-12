import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { SiteLogo } from '@/shared/components/site-logo';
import {
  siteHeaderBarClass,
  siteHeaderInnerClass,
} from '@/shared/components/site-header-theme';

export default function SyncErrorPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className={siteHeaderBarClass}>
        <div className={siteHeaderInnerClass}>
          <SiteLogo href="/" />
        </div>
      </header>
      <div className="px-4 py-12">
        <div className="mx-auto max-w-md">
          <h1 className="text-xl font-bold text-stone-900">
            No pudimos conectar tu cuenta
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Revisa que la API esté en marcha, que{' '}
            <code className="rounded bg-stone-200 px-1">NEXT_PUBLIC_API_URL</code>{' '}
            sea correcta y que{' '}
            <code className="rounded bg-stone-200 px-1">CLERK_SECRET_KEY</code>{' '}
            en la API sea del mismo proyecto que esta app.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/mi-espacio">
              <Button className="w-full py-3">Intentar de nuevo</Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" className="w-full py-3">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
