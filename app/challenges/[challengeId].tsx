import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ChallengeDetailScreen() {
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Challenge</Text>
      <Text style={styles.title}>Challenge detail</Text>
      <Text style={styles.body}>
        Challenge ID: <Text style={styles.code}>{challengeId}</Text>
      </Text>
      <Text style={styles.body}>
        Goals, members, check-ins, and feed activity will connect here in the next tasks.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 24,
  },
  code: {
    color: '#111827',
    fontWeight: '700',
  },
  container: {
    flex: 1,
    gap: 14,
    padding: 24,
    paddingTop: 84,
  },
  eyebrow: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '800',
  },
});
