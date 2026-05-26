import { PropsWithChildren } from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewProps,
} from 'react-native';

import { design } from '@/src/design/theme';

export function AppScreen({ children, style, ...props }: PropsWithChildren<ViewProps>) {
  return (
    <View {...props} style={[styles.screen, style]}>
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />
      {children}
    </View>
  );
}

export function AppCard({ children, style, ...props }: PropsWithChildren<ViewProps>) {
  return (
    <View {...props} style={[styles.card, style]}>
      {children}
    </View>
  );
}

type AppButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function AppButton({ disabled, title, variant = 'primary', style, ...props }: AppButtonProps) {
  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={(state) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        disabled && styles.buttonDisabled,
        state.pressed && !disabled && styles.buttonPressed,
        typeof style === 'function' ? style(state) : style,
      ]}>
      <Text
        style={[
          styles.buttonText,
          variant !== 'primary' && styles.buttonTextSecondary,
          disabled && styles.buttonTextDisabled,
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

export function AppInput({ multiline, style, ...props }: TextInputProps) {
  return (
    <TextInput
      {...props}
      multiline={multiline}
      placeholderTextColor="#9A8F80"
      style={[styles.input, multiline && styles.textArea, style]}
    />
  );
}

export function Eyebrow({ children }: PropsWithChildren) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function StatusPill({ status }: { status: 'done' | 'missed' | 'pending' | 'skipped' }) {
  const label = {
    done: 'Done today',
    missed: 'Missed today',
    pending: 'Pending',
    skipped: 'Skipped today',
  }[status];

  return (
    <View
      style={[
        styles.pill,
        status === 'done' && styles.pillDone,
        status === 'missed' && styles.pillMissed,
        status === 'skipped' && styles.pillSkipped,
      ]}>
      <Text
        style={[
          styles.pillText,
          status === 'done' && styles.pillDoneText,
          status === 'missed' && styles.pillMissedText,
          status === 'skipped' && styles.pillSkippedText,
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: design.color.primary,
    borderRadius: design.radius.full,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonSecondary: {
    backgroundColor: design.color.wash,
    borderColor: design.color.border,
    borderWidth: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonTextDisabled: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: design.color.primary,
  },
  card: {
    backgroundColor: design.color.card,
    borderColor: 'rgba(232, 220, 203, 0.85)',
    borderRadius: design.radius.lg,
    borderWidth: 1,
    shadowColor: design.color.shadow,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  eyebrow: {
    color: design.color.teal,
    fontSize: design.type.meta,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FFFDF9',
    borderColor: design.color.border,
    borderRadius: design.radius.md,
    borderWidth: 1,
    color: design.color.ink,
    fontSize: design.type.body,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  orb: {
    borderRadius: 999,
    opacity: 0.55,
    position: 'absolute',
  },
  orbBottom: {
    backgroundColor: 'rgba(47, 125, 115, 0.13)',
    bottom: 90,
    height: 170,
    right: -95,
    width: 170,
  },
  orbTop: {
    backgroundColor: 'rgba(242, 166, 90, 0.22)',
    height: 220,
    right: -90,
    top: -90,
    width: 220,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: design.color.wash,
    borderRadius: design.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillDone: {
    backgroundColor: 'rgba(20, 125, 100, 0.12)',
  },
  pillDoneText: {
    color: design.color.success,
  },
  pillMissed: {
    backgroundColor: 'rgba(180, 35, 24, 0.1)',
  },
  pillMissedText: {
    color: design.color.error,
  },
  pillSkipped: {
    backgroundColor: 'rgba(182, 106, 30, 0.12)',
  },
  pillSkippedText: {
    color: design.color.warning,
  },
  pillText: {
    color: design.color.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  screen: {
    backgroundColor: design.color.bg,
    flex: 1,
    overflow: 'hidden',
  },
  textArea: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
});
