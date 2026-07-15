import React, { FC } from 'react'
import { Text, View, ViewStyle, TextStyle, Pressable } from 'react-native'
import type { JobStackScreenProps } from '../../navigators/navigatorTypes'
import { JobWizardScreen } from './JobWizardScreen'
import { ContinueButton } from '../../components/tech/ContinueButton'
import { useJobVisit } from './useJobVisit'
import { useAppDispatch } from '../../redux/hooks'
import { toggleException, unlockStep, createEmptyProgress } from '../../redux/slices/visitSlice'
import { tech, $techCard, $techHeading, $techSubheading } from './techTheme'
import { typography } from '../../theme/typography'

type Props = JobStackScreenProps<'HvacExceptions'>

export const HvacExceptionsScreen: FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params
  const { job, progress, loading } = useJobVisit(jobId)
  const dispatch = useAppDispatch()
  const unlocked = progress?.unlockedSteps ?? createEmptyProgress(jobId).unlockedSteps

  return (
    <JobWizardScreen
      title={job?.siteName ?? 'Exceptions'}
      jobId={jobId}
      activeStep="exceptions"
      unlockedSteps={unlocked}
      loading={loading || !job || !progress}
      footer={
        <ContinueButton
          text="Continue"
          onPress={() => {
            dispatch(unlockStep({ jobId, step: 'complete' }))
            navigation.navigate('VisitReportPreview', { jobId })
          }}
        />
      }
    >
      {job && progress ? (
        <>
          <Text style={$techHeading}>Exceptions</Text>
          <Text style={$techSubheading}>
            Tap to flag. Flagged items route to supervisor QA.
          </Text>
          {job.exceptions.map((item) => {
            const flagged = !!progress.exceptionFlags[item.id]
            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  $techCard,
                  $row,
                  flagged && $rowFlagged,
                  pressed && { opacity: 0.92 },
                ]}
                onPress={() =>
                  dispatch(toggleException({ jobId, exceptionId: item.id }))
                }
              >
                <View style={{ flex: 1 }}>
                  <Text style={$category}>{item.category}</Text>
                  <Text style={$label}>{item.label}</Text>
                </View>
                <View style={[
                  $flagPill,
                  flagged && { backgroundColor: '#FDE68A' },
                ]}>
                  <Text style={[
                    $flag,
                    flagged && { color: '#92400E' },
                  ]}>
                    {flagged ? 'Flagged' : 'None'}
                  </Text>
                </View>
              </Pressable>
            )
          })}
        </>
      ) : null}
    </JobWizardScreen>
  )
}

const $row: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
  gap: 12,
}

const $rowFlagged: ViewStyle = {
  borderColor: '#F59E0B',
  backgroundColor: tech.warningMuted,
}

const $category: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 11,
  color: tech.textMuted,
  marginBottom: 2,
  textTransform: 'uppercase',
  letterSpacing: 0.3,
}

const $label: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: tech.text,
}

const $flagPill: ViewStyle = {
  borderRadius: tech.radiusPill,
  backgroundColor: tech.bg,
  paddingHorizontal: 10,
  paddingVertical: 6,
}

const $flag: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 12,
  color: tech.textMuted,
}
