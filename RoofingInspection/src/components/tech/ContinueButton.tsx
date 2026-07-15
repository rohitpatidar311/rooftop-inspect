import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { tech } from '../../screens/TechScreens/techTheme'
import { typography } from '../../theme/typography'

type Props = {
  text: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary'
}

export function ContinueButton({
  text,
  onPress,
  disabled,
  loading,
  variant = 'primary',
}: Props) {
  const isSecondary = variant === 'secondary'
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        $btn,
        isSecondary ? $secondary : $primary,
        (disabled || loading) && $disabled,
        pressed && !disabled && !loading && $pressed,
      ]}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? tech.primary : '#fff'} />
      ) : (
          <Text style={[
          $text,
          isSecondary && { color: tech.primary },
        ]}>
          {text}
        </Text>
      )}
    </Pressable>
  )
}

const $btn: ViewStyle = {
  borderRadius: tech.radiusSm,
  minHeight: 52,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 16,
  width: '100%',
}

const $primary: ViewStyle = {
  backgroundColor: tech.primary,
}

const $secondary: ViewStyle = {
  backgroundColor: tech.surface,
  borderWidth: 1,
  borderColor: tech.borderStrong,
}

const $pressed: ViewStyle = { opacity: 0.92, transform: [{ scale: 0.99 }] }
const $disabled: ViewStyle = { opacity: 0.45 }

const $text: TextStyle = {
  fontFamily: typography.primary.semiBold,
  color: '#FFFFFF',
  fontSize: 16,
}
