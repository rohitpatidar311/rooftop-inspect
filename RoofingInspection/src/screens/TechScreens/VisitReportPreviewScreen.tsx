import React, { FC, useState } from 'react'
import {
  Image,
  ImageStyle,
  Text,
  View,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import type { JobStackScreenProps } from '../../navigators/navigatorTypes'
import { JobWizardScreen } from './JobWizardScreen'
import { ContinueButton } from '../../components/tech/ContinueButton'
import {
  SignaturePadModal,
  SignaturePreview,
} from '../../components/tech/SignaturePadModal'
import { useJobVisit } from './useJobVisit'
import { useAppDispatch } from '../../redux/hooks'
import {
  setSignature,
  setSigned,
  unlockStep,
  createEmptyProgress,
} from '../../redux/slices/visitSlice'
import { showToast } from '../../utils/toast'
import { JOB_STEPS } from './jobSteps'
import { tech, $techCard } from './techTheme'
import { typography } from '../../theme/typography'

type Props = JobStackScreenProps<'VisitReportPreview'>

export const VisitReportPreviewScreen: FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params
  const { job, progress, loading } = useJobVisit(jobId)
  const dispatch = useAppDispatch()
  const [signOpen, setSignOpen] = useState(false)
  const unlocked =
    progress?.unlockedSteps ?? createEmptyProgress(jobId).unlockedSteps
  const photos = progress?.photos ?? []
  const signaturePaths = progress?.signaturePaths ?? []
  const signatureSize = progress?.signatureSize ?? null

  const flaggedExceptions =
    job?.exceptions.filter((e) => progress?.exceptionFlags[e.id]) ?? []
  const roofEntries =
    job?.roofChecks.map((check) => ({
      check,
      result: progress?.roofResults[check.id],
    })) ?? []
  const unlockedCount =
    progress?.unlockedSteps.filter((id) =>
      JOB_STEPS.some((s) => s.id === id),
    ).length ?? 0

  const onContinue = () => {
    if (!progress?.signed || signaturePaths.length === 0) {
      showToast({ type: 'error', message: 'Please add a signature first.' })
      return
    }
    dispatch(unlockStep({ jobId, step: 'final' }))
    navigation.navigate('VisitFinalReport', { jobId })
  }

  return (
    <JobWizardScreen
      title={job?.siteName ?? 'Preview report'}
      subtitle="Review visit data and sign"
      jobId={jobId}
      activeStep="complete"
      unlockedSteps={unlocked}
      loading={loading || !job || !progress}
      footer={<ContinueButton text="Continue" onPress={onContinue} />}
    >
      {job && progress ? (
        <>
          <Text style={$siteMeta}>Preview summary · Steps 1–4</Text>

          <Section title="1 · Job overview">
            <Row label="Site" value={job.siteName} />
            <Row label="Address" value={job.address} />
            <Row label="Status" value={job.status.replace('_', ' ')} />
            <Row
              label="Steps unlocked"
              value={`${unlockedCount}/${JOB_STEPS.length}`}
            />
          </Section>

          <Section title="2 · Site capture">
            {photos.length === 0 ? (
              <Text style={$empty}>No photos captured.</Text>
            ) : (
              photos.map((photo, index) => (
                <View key={photo.id} style={$photoRow}>
                  {photo.uri ? (
                    <Image source={{ uri: photo.uri }} style={$thumb} />
                  ) : (
                    <View style={[$thumb, $thumbEmpty]}>
                      <Ionicons
                        name="image-outline"
                        size={20}
                        color={tech.textMuted}
                      />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={$photoCaption}>
                      #{photos.length - index} · {photo.caption}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Section>

          <Section title="3 · Roof inspect">
            {roofEntries.map(({ check, result }) => (
              <View key={check.id} style={$checkRow}>
                <StatusPill result={result} />
                <View style={{ flex: 1 }}>
                  <Text style={$checkText}>{check.label}</Text>
                  <Text style={$listMeta}>{check.group}</Text>
                </View>
              </View>
            ))}
          </Section>

          <Section title="4 · Exceptions">
            {flaggedExceptions.length === 0 ? (
              <Text style={$empty}>No exceptions flagged.</Text>
            ) : (
              flaggedExceptions.map((item) => (
                <View key={item.id} style={$checkRow}>
                  <Ionicons name="warning" size={18} color={tech.warning} />
                  <View style={{ flex: 1 }}>
                    <Text style={$checkText}>{item.label}</Text>
                    <Text style={$listMeta}>{item.category}</Text>
                  </View>
                </View>
              ))
            )}
          </Section>

          <Section title="5 · Signature">
            <Text style={$sigLabel}>Technician signature</Text>
            <Pressable
              style={({ pressed }) => [
                $sigPad,
                progress.signed && $sigPadDone,
                !(progress.signed && signaturePaths.length > 0) && $sigPadEmpty,
                pressed && { opacity: 0.9 },
              ]}
              onPress={() => setSignOpen(true)}
            >
              {progress.signed && signaturePaths.length > 0 ? (
                <View style={$sigPreviewWrap}>
                  <SignaturePreview
                    paths={signaturePaths}
                    size={signatureSize}
                    height={96}
                  />
                  <Text style={[$sigText, $sigHint]}>Tap to edit</Text>
                </View>
              ) : (
                <>
                  <Ionicons
                    name="create-outline"
                    size={28}
                    color={tech.textMuted}
                  />
                  <Text style={$sigText}>Tap to sign</Text>
                </>
              )}
            </Pressable>
            {progress.signed ? (
              <Pressable
                onPress={() => dispatch(setSigned({ jobId, signed: false }))}
                style={$clearSig}
              >
                <Text style={$clearSigText}>Clear signature</Text>
              </Pressable>
            ) : null}
          </Section>

          <SignaturePadModal
            visible={signOpen}
            initialPaths={signaturePaths}
            onCancel={() => setSignOpen(false)}
            onSave={({ paths, size }) => {
              dispatch(setSignature({ jobId, paths, size }))
              setSignOpen(false)
              showToast({ type: 'success', message: 'Signature saved.' })
            }}
          />
        </>
      ) : null}
    </JobWizardScreen>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <View style={[$techCard, $section]}>
      <Text style={$sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={$row}>
      <Text style={$rowLabel}>{label}</Text>
      <Text style={$rowValue}>{value}</Text>
    </View>
  )
}

function StatusPill({ result }: { result?: 'pass' | 'fail' | 'na' }) {
  const label =
    result === 'pass'
      ? 'PASS'
      : result === 'fail'
        ? 'FAIL'
        : result === 'na'
          ? 'N/A'
          : '—'
  const color =
    result === 'pass'
      ? tech.success
      : result === 'fail'
        ? tech.danger
        : tech.textMuted
  return (
    <View style={[$pill, { borderColor: color }]}>
      <Text style={[$pillText, { color }]}>{label}</Text>
    </View>
  )
}

const $siteMeta: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: tech.textSecondary,
  marginBottom: 12,
}

const $section: ViewStyle = {
  marginBottom: 12,
  gap: 8,
}

const $sectionTitle: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: tech.primary,
  marginBottom: 4,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
}

const $row: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 12,
}

const $rowLabel: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: tech.textSecondary,
}

const $rowValue: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  color: tech.text,
  textAlign: 'right',
  flex: 1,
  textTransform: 'capitalize',
}

const $empty: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: tech.textMuted,
}

const $photoRow: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
}

const $thumb: ImageStyle = {
  width: 56,
  height: 56,
  borderRadius: 8,
  backgroundColor: tech.bg,
}

const $thumbEmpty: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
}

const $photoCaption: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  color: tech.text,
  lineHeight: 18,
}

const $listMeta: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: tech.textSecondary,
  marginTop: 2,
  lineHeight: 16,
}

const $checkRow: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 10,
  paddingVertical: 4,
}

const $checkText: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: tech.text,
  flex: 1,
  lineHeight: 18,
}

const $pill: ViewStyle = {
  borderWidth: 1,
  borderRadius: 6,
  paddingHorizontal: 8,
  paddingVertical: 2,
  minWidth: 44,
  alignItems: 'center',
  marginTop: 2,
}

const $pillText: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 11,
}

const $sigLabel: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  color: tech.textSecondary,
  marginBottom: 4,
}

const $sigPad: ViewStyle = {
  minHeight: 140,
  borderRadius: tech.radius,
  borderWidth: 1.5,
  borderColor: tech.borderStrong,
  borderStyle: 'dashed',
  backgroundColor: tech.bg,
  alignItems: 'stretch',
  justifyContent: 'center',
  padding: 12,
  overflow: 'hidden',
}

const $sigPadDone: ViewStyle = {
  borderColor: '#A7F3D0',
  backgroundColor: tech.successMuted,
  borderStyle: 'solid',
}

const $sigPadEmpty: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}

const $sigPreviewWrap: ViewStyle = {
  width: '100%',
  alignItems: 'center',
  gap: 6,
}

const $sigText: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: tech.textSecondary,
  textAlign: 'center',
}

const $sigHint: TextStyle = {
  color: '#065F46',
  fontSize: 12,
}

const $clearSig: ViewStyle = {
  alignSelf: 'center',
  marginTop: 8,
  paddingVertical: 4,
}

const $clearSigText: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  color: tech.danger,
}
