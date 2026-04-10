import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = PropsWithChildren<{
  /** Padding horizontal consistente entre pantallas */
  padded?: boolean;
}>;

export function Screen({ children, padded = true }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={[styles.inner, padded && styles.padded]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fafafa' },
  inner: { flex: 1 },
  padded: { paddingHorizontal: 20 },
});
