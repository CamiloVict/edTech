/**
 * Mientras el Server Component sincroniza con la API y redirige,
 * Next muestra este segmento en lugar de una pantalla en blanco.
 */
export default function MiEspacioLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 px-4">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-stone-300 border-t-stone-700"
        aria-hidden
      />
      <div className="text-center">
        <p className="text-sm font-medium text-stone-900">Preparando tu espacio</p>
        <p className="mt-1 max-w-sm text-xs text-stone-600">
          Un momento: estamos enlazando tu cuenta con la aplicación.
        </p>
      </div>
    </div>
  );
}
