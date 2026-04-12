import { redirect } from 'next/navigation';

/** Compatibilidad: antes el cliente hacía sync aquí; ahora todo pasa por /mi-espacio. */
export default function BootstrapPage() {
  redirect('/mi-espacio');
}
