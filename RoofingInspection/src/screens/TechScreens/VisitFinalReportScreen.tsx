import React, { FC, useState } from 'react'
import {
  Image,
  ImageStyle,
  Share,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import type { JobStackScreenProps } from '../../navigators/navigatorTypes'
import { JobWizardScreen } from './JobWizardScreen'
import { ContinueButton } from '../../components/tech/ContinueButton'
import { SignaturePreview } from '../../components/tech/SignaturePadModal'
import { useJobVisit } from './useJobVisit'
import { useAppDispatch } from '../../redux/hooks'
import { submitVisit, createEmptyProgress } from '../../redux/slices/visitSlice'
import { api } from '../../services/api'
import { showToast } from '../../utils/toast'
import { buildVisitReportText } from './buildVisitReportText'
import { JOB_STEPS } from './jobSteps'
import { tech, $techCard } from './techTheme'
import { typography } from '../../theme/typography'

type Props = JobStackScreenProps<'VisitFinalReport'>

export const VisitFinalReportScreen: FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params
  const { job, progress, loading } = useJobVisit(jobId)
  const dispatch = useAppDispatch()
  const [submitting, setSubmitting] = useState(false)
  const [downloading, setDownloading] = useState(false)
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

  const onDownloadPdf = async () => {
    if (!job || !progress) return
    setDownloading(true)
    try {
      const report = buildVisitReportText(job, progress)
      await Share.share({
        title: `${job.siteName} — Visit Report.pdf`,
        message: report,
      })
      showToast({
        type: 'success',
        message: 'Report ready — save or share as PDF from the share sheet.',
      })
    } catch {
      showToast({ type: 'error', message: 'Could not download report.' })
    } finally {
      setDownloading(false)
    }
  }

  const onSubmit = async () => {
    if (!progress?.signed) {
      showToast({ type: 'error', message: 'Signature is required. Go back to Preview.' })
      return
    }
    setSubmitting(true)
    dispatch(submitVisit(jobId))
    const result = await api.submitVisit(jobId)
    setSubmitting(false)
    if (result.kind === 'ok') {
      showToast({ type: 'success', message: result.message })
      navigation.getParent()?.navigate('TodayJobs' as never)
    } else {
      showToast({
        type: 'error',
        message: result.kind === 'rejected' ? result.message : 'Submit failed.',
      })
    }
  }

  return (
    <JobWizardScreen
      title={job?.siteName ?? 'Final report'}
      subtitle="Full visit report"
      jobId={jobId}
      activeStep="final"
      unlockedSteps={unlocked}
      loading={loading || !job || !progress}
      footer={
        <View style={{ gap: 10 }}>
          <ContinueButton
            text="Download PDF"
            loading={downloading}
            onPress={onDownloadPdf}
          />
          <ContinueButton
            text="Close"
            variant="secondary"
            loading={submitting}
            onPress={onSubmit}
          />
        </View>
      }
    >
      {job && progress ? (
        <>
          <Text style={$siteMeta}>
            Complete report · All inspection data
          </Text>

          <Section title="1 · Job overview">
            <Row label="Site" value={job.siteName} />
            <Row label="Address" value={job.address} />
            <Row label="Status" value={job.status.replace('_', ' ')} />
            <Row
              label="Steps unlocked"
              value={`${unlockedCount}/${JOB_STEPS.length}`}
            />
            <Row
              label="Coordinates"
              value={`${job.latitude.toFixed(4)}, ${job.longitude.toFixed(4)}`}
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
            {signaturePaths.length > 0 ? (
              <View style={$sigBox}>
                <SignaturePreview
                  paths={signaturePaths}
                  size={signatureSize}
                  height={100}
                />
              </View>
            ) : (
              <Text style={$empty}>No signature on file.</Text>
            )}
            <Row
              label="Signed"
              value={progress.signed ? 'Yes' : 'No'}
            />
          </Section>
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

const $sigBox: ViewStyle = {
  height: 110,
  borderRadius: tech.radiusSm,
  borderWidth: 1,
  borderColor: tech.border,
  backgroundColor: tech.bg,
  padding: 8,
}
