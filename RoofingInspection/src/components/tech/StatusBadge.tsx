import React from 'react'
import { Text, View, ViewStyle, TextStyle } from 'react-native'
import type { JobStatus } from '../../services/api/types'
import { tech } from '../../screens/TechScreens/techTheme'
import { typography } from '../../theme/typography'

type Props = {
  status: JobStatus
}

const LABELS: Record<JobStatus, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export function StatusBadge({ status }: Props) {
  const palette =
    status === 'in_progress'
      ? { bg: '#FEF3C7', border: '#FCD34D', text: '#92400E' }
      : status === 'completed'
        ? { bg: tech.successMuted, border: '#A7F3D0', text: '#065F46' }
        : { bg: tech.primaryMuted, border: '#C7D2FE', text: tech.primaryDark }

  return (
    <View
      style={[
        $base,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
    >
      <View style={[$dot, { backgroundColor: palette.text }]} />
      <Text style={[$text, { color: palette.text }]}>{LABELS[status]}</Text>
    </View>
  )
}

const $base: ViewStyle = {
  borderRadius: tech.radiusPill,
  paddingHorizontal: 10,
  paddingVertical: 4,
  alignSelf: 'flex-start',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  borderWidth: 1,
}

const $dot: ViewStyle = {
  width: 6,
  height: 6,
  borderRadius: 3,
}

const $text: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 11,
}
