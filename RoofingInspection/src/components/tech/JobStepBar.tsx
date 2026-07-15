import React from 'react'
import {
  ScrollView,
  Text,
  Pressable,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { JobStepId } from '../../services/api/types'
import type { JobStackParamList } from '../../navigators/navigatorTypes'
import { JOB_STEPS } from '../../screens/TechScreens/jobSteps'
import { tech } from '../../screens/TechScreens/techTheme'
import { typography } from '../../theme/typography'

type Props = {
  jobId: string
  activeStep: JobStepId
  unlockedSteps: JobStepId[]
}

export function JobStepBar({ jobId, activeStep, unlockedSteps }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<JobStackParamList>>()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={$row}
      style={$scroll}
    >
      {JOB_STEPS.map((step, index) => {
        const active = step.id === activeStep
        const unlocked = unlockedSteps.includes(step.id)
        return (
          <Pressable
            key={step.id}
            disabled={!unlocked}
            onPress={() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(navigation.navigate as any)(step.route, { jobId })
            }}
            style={({ pressed }) => [
              $pill,
              active ? $pillActive : unlocked ? $pillUnlocked : $pillLocked,
              pressed && unlocked && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled: !unlocked }}
            accessibilityLabel={step.label}
          >
            <Text style={[
              $index,
              active ? $indexActive : unlocked ? $indexUnlocked : $indexLocked,
            ]}>
              {index + 1}
            </Text>
            <Text
              style={[
                $pillText,
                active
                  ? $pillTextActive
                  : unlocked
                    ? $pillTextUnlocked
                    : $pillTextLocked,
              ]}
              numberOfLines={1}
            >
              {step.label}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const $scroll: ViewStyle = { marginBottom: 16, flexGrow: 0 }

const $row: ViewStyle = {
  flexDirection: 'row',
  gap: 8,
  paddingRight: 8,
}

const $pill: ViewStyle = {
  borderRadius: tech.radiusPill,
  paddingHorizontal: 12,
  paddingVertical: 8,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  borderWidth: 1,
}

const $pillActive: ViewStyle = {
  backgroundColor: tech.primary,
  borderColor: tech.primary,
}

const $pillUnlocked: ViewStyle = {
  backgroundColor: tech.surface,
  borderColor: tech.borderStrong,
}

const $pillLocked: ViewStyle = {
  backgroundColor: '#F8FAFC',
  borderColor: tech.border,
  opacity: 0.7,
}

const $index: TextStyle = {
  fontFamily: typography.primary.bold,
  fontSize: 11,
  minWidth: 14,
  textAlign: 'center',
}

const $indexActive: TextStyle = { color: '#FFFFFF' }
const $indexUnlocked: TextStyle = { color: tech.primary }
const $indexLocked: TextStyle = { color: tech.textMuted }

const $pillText: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 12,
}

const $pillTextActive: TextStyle = { color: '#FFFFFF' }
const $pillTextUnlocked: TextStyle = { color: tech.textSecondary }
const $pillTextLocked: TextStyle = { color: tech.textMuted }
