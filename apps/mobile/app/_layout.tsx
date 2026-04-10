import { Stack } from 'expo-router';

import { AppProviders } from '@/shared/providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
