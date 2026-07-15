import React, { FC, useMemo } from 'react'
import { Text, View, ViewStyle, TextStyle, Pressable } from 'react-native'
import type { JobStackScreenProps } from '../../navigators/navigatorTypes'
import { JobWizardScreen } from './JobWizardScreen'
import { ContinueButton } from '../../components/tech/ContinueButton'
import { useJobVisit } from './useJobVisit'
import { useAppDispatch } from '../../redux/hooks'
import { setRoofResult, unlockStep, createEmptyProgress } from '../../redux/slices/visitSlice'
import { tech, $techCard, $techHeading, $techSubheading } from './techTheme'
import { typography } from '../../theme/typography'

type Props = JobStackScreenProps<'RoofInspect'>
type Result = 'pass' | 'fail' | 'na'

export const RoofInspectScreen: FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params
  const { job, progress, loading } = useJobVisit(jobId)
  const dispatch = useAppDispatch()
  const unlocked = progress?.unlockedSteps ?? createEmptyProgress(jobId).unlockedSteps

  const grouped = useMemo(() => {
    if (!job) return []
    const map = new Map<string, typeof job.roofChecks>()
    for (const item of job.roofChecks) {
      const list = map.get(item.group) ?? []
      list.push(item)
      map.set(item.group, list)
    }
    return Array.from(map.entries())
  }, [job])

  return (
    <JobWizardScreen
      title={job?.siteName ?? 'Roof inspection'}
      subtitle="PASS / FAIL / N/A checklist"
      jobId={jobId}
      activeStep="roof"
      unlockedSteps={unlocked}
      loading={loading || !job || !progress}
      footer={
        <ContinueButton
          text="Continue"
          onPress={() => {
            dispatch(unlockStep({ jobId, step: 'exceptions' }))
            navigation.navigate('HvacExceptions', { jobId })
          }}
        />
      }
    >
      {job && progress ? (
        <>
          <Text style={$techHeading}>Roof Inspection</Text>
          <View style={$hintBox}>
            <Text style={$hint}>
              Following are the findings we found. (AI generated)
            </Text>
          </View>
          {grouped.map(([group, items]) => (
            <View key={group} style={$group}>
              <Text style={$groupTitle}>{group}</Text>
              {items.map((item) => {
                const result = progress.roofResults[item.id]
                return (
                  <View key={item.id} style={[$techCard, { marginBottom: 8, padding: 12 }]}>
                    <Text style={$itemLabel}>{item.label}</Text>
                    <View style={$buttons}>
                      {(['pass', 'fail', 'na'] as Result[]).map((option) => {
                        const active = result === option
                        return (
                          <Pressable
                            key={option}
                            onPress={() =>
                              dispatch(
                                setRoofResult({ jobId, checkId: item.id, result: option }),
                              )
                            }
                            style={[
                              $opt,
                              active && option === 'pass' && $optPass,
                              active && option === 'fail' && $optFail,
                              active && option === 'na' && $optNa,
                            ]}
                          >
                            <Text
                              style={[
                                $optText,
                                active && { color: '#FFFFFF' },
                              ]}
                            >
                              {option === 'pass' ? 'PASS' : option === 'fail' ? 'FAIL' : 'N/A'}
                            </Text>
                          </Pressable>
                        )
                      })}
                    </View>
                  </View>
                )
              })}
            </View>
          ))}
        </>
      ) : null}
    </JobWizardScreen>
  )
}

const $hintBox: ViewStyle = {
  backgroundColor: tech.warningMuted,
  borderRadius: tech.radiusSm,
  borderWidth: 1,
  borderColor: '#FCD34D',
  padding: 12,
  marginBottom: 16,
}

const $hint: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: '#92400E',
  lineHeight: 17,
}

const $group: ViewStyle = { marginBottom: 16 }

const $groupTitle: TextStyle = {
  fontFamily: typography.primary.bold,
  fontSize: 12,
  color: tech.textSecondary,
  marginBottom: 8,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}

const $itemLabel: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: tech.text,
  marginBottom: 10,
  lineHeight: 18,
}

const $buttons: ViewStyle = { flexDirection: 'row', gap: 8 }

const $opt: ViewStyle = {
  flex: 1,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: tech.borderStrong,
  paddingVertical: 10,
  alignItems: 'center',
  backgroundColor: tech.bg,
}

const $optPass: ViewStyle = {
  backgroundColor: tech.success,
  borderColor: tech.success,
}

const $optFail: ViewStyle = {
  backgroundColor: tech.danger,
  borderColor: tech.danger,
}

const $optNa: ViewStyle = {
  backgroundColor: '#64748B',
  borderColor: '#64748B',
}

const $optText: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 12,
  color: tech.textSecondary,
}
