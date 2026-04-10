import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useHomeGreeting } from '@/features/home/hooks/useHomeGreeting';
import { Screen } from '@/shared/ui/Screen';
import { useSessionStore } from '@/shared/stores/useSessionStore';

export function HomeScreen() {
  const role = useSessionStore((s) => s.role);
  const setRole = useSessionStore((s) => s.setRole);
  const greeting = useHomeGreeting();

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>{greeting}</Text>
        <Text style={styles.subtitle}>
          App mobile · arquitectura por features · listo para consumidores y
          proveedores
        </Text>
      </View>

      <Text style={styles.label}>Tipo de cuenta (preview MVP)</Text>
      <View style={styles.row}>
        <RoleChip
          label="Familia"
          active={role === 'consumer'}
          onPress={() => setRole('consumer')}
        />
        <RoleChip
          label="Proveedor"
          active={role === 'provider'}
          onPress={() => setRole('provider')}
        />
      </View>
    </Screen>
  );
}

function RoleChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 28, marginTop: 8 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: { fontSize: 15, lineHeight: 22, color: '#444' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', gap: 12 },
  chip: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  chipText: { textAlign: 'center', fontSize: 16, color: '#333' },
  chipTextActive: { color: '#1d4ed8', fontWeight: '600' },
});
