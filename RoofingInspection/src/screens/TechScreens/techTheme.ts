import { Platform, TextStyle, ViewStyle } from 'react-native'
import { typography } from '../../theme/typography'

/** Brand / field-app tokens (BFC technician flow) */
export const tech = {
  bg: '#F1F5F9',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#4F46E5',
  primaryMuted: '#EEF2FF',
  primaryDark: '#3730A3',
  success: '#059669',
  successMuted: '#ECFDF5',
  warning: '#D97706',
  warningMuted: '#FFFBEB',
  danger: '#DC2626',
  dangerMuted: '#FEF2F2',
  online: '#059669',
  radius: 14,
  radiusSm: 10,
  radiusPill: 999,
} as const

export const $techCard: ViewStyle = {
  backgroundColor: tech.surface,
  borderRadius: tech.radius,
  borderWidth: 1,
  borderColor: tech.border,
  padding: 16,
  ...Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
  }),
}

export const $techHeading: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: tech.text,
  marginBottom: 6,
}

export const $techSubheading: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: tech.textSecondary,
  lineHeight: 18,
  marginBottom: 14,
}

export const $techBody: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: tech.text,
}

export const $techMuted: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: tech.textMuted,
}

export const $techLoading: ViewStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: tech.bg,
  padding: 24,
}
