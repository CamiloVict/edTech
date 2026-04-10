import { HomeScreen } from '@/features/home';

/**
 * Route shell: solo compone la pantalla del feature.
 * La lógica vive en `src/features/*` (screaming architecture).
 */
export default function IndexRoute() {
  return <HomeScreen />;
}
