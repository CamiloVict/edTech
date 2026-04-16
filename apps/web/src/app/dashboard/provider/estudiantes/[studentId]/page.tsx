'use client';

import Link from 'next/link';

export default function ProviderStudentDetailRoute() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-semibold text-[var(--foreground)]">
        Detalle de estudiante
      </h1>
      <p className="max-w-lg text-sm text-[var(--muted-foreground)]">
        El seguimiento por alumno y familia se conectará a tus citas y perfiles
        reales en una próxima versión. Mientras tanto, gestiona las reservas en
        Agenda y horarios.
      </p>
      <Link
        href="/dashboard/provider/estudiantes"
        className="text-sm font-medium text-[var(--primary-soft)] underline"
      >
        Volver al listado
      </Link>
    </div>
  );
}
