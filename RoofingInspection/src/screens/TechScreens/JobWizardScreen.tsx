import React, { FC, ReactNode } from 'react'
import {
  ScrollView,
  Text,
  Pressable,
  View,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Screen } from '../../components/Screen'
import { JobStepBar } from '../../components/tech/JobStepBar'
import { typography } from '../../theme/typography'
import type { JobStepId } from '../../services/api/types'
import { JOB_STEPS } from './jobSteps'
import { tech, $techLoading } from './techTheme'

type Props = {
  title: string
  jobId: string
  activeStep: JobStepId
  unlockedSteps: JobStepId[]
  children: ReactNode
  footer?: ReactNode
  showStepBar?: boolean
  onBack?: () => void
  loading?: boolean
  subtitle?: string
}

export const JobWizardScreen: FC<Props> = ({
  title,
  jobId,
  activeStep,
  unlockedSteps,
  children,
  footer,
  showStepBar = true,
  onBack,
  loading,
  subtitle,
}) => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const stepIndex = Math.max(
    0,
    JOB_STEPS.findIndex((s) => s.id === activeStep),
  )
  const stepTotal = JOB_STEPS.length
  const progress = (stepIndex + 1) / stepTotal

  if (loading) {
    return (
      <Screen
        preset="fixed"
        safeAreaEdges={['top', 'bottom']}
        backgroundColor={tech.bg}
        contentContainerStyle={$techLoading}
      >
        <ActivityIndicator size="large" color={tech.primary} />
        <Text style={$loadingText}>Loading visit…</Text>
      </Screen>
    )
  }

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top', 'bottom']}
      backgroundColor={tech.bg}
      contentContainerStyle={$root}
      systemBarStyle="dark"
    >
      <View style={$header}>
        <View style={$headerTop}>
          <Pressable
            onPress={onBack ?? (() => navigation.goBack())}
            hitSlop={12}
            style={({ pressed }) => [$backBtn, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={tech.primary} />
            <Text style={$backText}>Back</Text>
          </Pressable>
          <Text style={$stepCount}>
            Step {stepIndex + 1}/{stepTotal}
          </Text>
        </View>
        <Text style={$title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={$subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        <View style={$progressTrack}>
          <View style={[$progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <ScrollView
        style={$scrollFlex}
        contentContainerStyle={$scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {showStepBar && (
          <JobStepBar
            jobId={jobId}
            activeStep={activeStep}
            unlockedSteps={unlockedSteps}
          />
        )}
        {children}
      </ScrollView>

      {footer ? (
        <View
          style={[
            $footer,
            { paddingBottom: Math.max(insets.bottom > 0 ? 8 : 16, 12) },
          ]}
        >
          {footer}
        </View>
      ) : null}
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: tech.bg,
}

const $header: ViewStyle = {
  backgroundColor: tech.surface,
  paddingHorizontal: 16,
  paddingTop: 8,
  paddingBottom: 12,
  borderBottomWidth: 1,
  borderBottomColor: tech.border,
}

const $headerTop: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
}

const $backBtn: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 2,
  paddingVertical: 4,
  paddingRight: 8,
  marginLeft: -4,
}

const $backText: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
  color: tech.primary,
}

const $stepCount: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 12,
  color: tech.textMuted,
}

const $title: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 20,
  color: tech.text,
  marginBottom: 2,
}

const $subtitle: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: tech.textSecondary,
  marginBottom: 10,
}

const $progressTrack: ViewStyle = {
  height: 4,
  borderRadius: 2,
  backgroundColor: tech.border,
  marginTop: 10,
  overflow: 'hidden',
}

const $progressFill: ViewStyle = {
  height: '100%',
  borderRadius: 2,
  backgroundColor: tech.primary,
}

const $scrollFlex: ViewStyle = { flex: 1 }

const $scroll: ViewStyle = {
  paddingHorizontal: 16,
  paddingTop: 14,
  paddingBottom: 28,
}

const $footer: ViewStyle = {
  paddingHorizontal: 16,
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: tech.border,
  backgroundColor: tech.surface,
}

const $loadingText: TextStyle = {
  marginTop: 12,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: tech.textSecondary,
}
