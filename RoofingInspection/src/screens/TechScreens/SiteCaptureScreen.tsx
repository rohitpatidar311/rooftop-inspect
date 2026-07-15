import React, { FC, useState } from 'react'
import {
  ActivityIndicator,
  Text,
  View,
  ViewStyle,
  TextStyle,
  Pressable,
  TextInput,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { launchCamera, type Asset } from 'react-native-image-picker'
import type { JobStackScreenProps } from '../../navigators/navigatorTypes'
import { JobWizardScreen } from './JobWizardScreen'
import { ContinueButton } from '../../components/tech/ContinueButton'
import { SiteCaptureGallery } from '../../components/tech/SiteCaptureGallery'
import { useJobVisit } from './useJobVisit'
import { useAppDispatch } from '../../redux/hooks'
import {
  capturePhoto,
  removePhoto,
  unlockStep,
  createEmptyProgress,
} from '../../redux/slices/visitSlice'
import { showToast } from '../../utils/toast'
import { tech, $techHeading, $techSubheading } from './techTheme'
import { typography } from '../../theme/typography'

type Props = JobStackScreenProps<'SiteCapture'>

export const SiteCaptureScreen: FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params
  const { job, progress, loading } = useJobVisit(jobId)
  const dispatch = useAppDispatch()
  const [caption, setCaption] = useState('')
  const [openingCamera, setOpeningCamera] = useState(false)
  const unlocked = progress?.unlockedSteps ?? createEmptyProgress(jobId).unlockedSteps
  const photos = progress?.photos ?? []

  const onOpenCamera = async () => {
    setOpeningCamera(true)
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'back',
        saveToPhotos: false,
        quality: 0.8,
        includeBase64: false,
      })

      if (result.didCancel) return

      if (result.errorCode) {
        const message =
          result.errorCode === 'permission'
            ? 'Camera permission is required to take photos.'
            : result.errorMessage || 'Could not open camera.'
        showToast({ type: 'error', message })
        return
      }

      const asset: Asset | undefined = result.assets?.[0]
      const uri = asset?.uri
      if (!uri) {
        showToast({ type: 'error', message: 'No photo was returned.' })
        return
      }

      const nextCaption =
        caption.trim() || `Site photo ${photos.length + 1}`

      dispatch(
        capturePhoto({
          jobId,
          uri,
          caption: nextCaption,
        }),
      )
      setCaption('')
      showToast({ type: 'success', message: 'Photo Captured.' })
    } catch {
      showToast({ type: 'error', message: 'Failed to open camera.' })
    } finally {
      setOpeningCamera(false)
    }
  }

  return (
    <JobWizardScreen
      title={job?.siteName ?? 'Site capture'}
      jobId={jobId}
      activeStep="capture"
      unlockedSteps={unlocked}
      loading={loading || !job || !progress}
      footer={
        <ContinueButton
          text="Continue"
          onPress={() => {
            dispatch(unlockStep({ jobId, step: 'roof' }))
            navigation.navigate('RoofInspect', { jobId })
          }}
        />
      }
    >
      {progress ? (
        <>
          <Text style={$techHeading}>Site Capture</Text>
          <Text style={$techSubheading}>
            Open the camera to take a photo. Caption is saved and shown with each image.
          </Text>

          <Pressable
            style={({ pressed }) => [
              $cameraCard,
              pressed && !openingCamera && { opacity: 0.9 },
            ]}
            onPress={onOpenCamera}
            disabled={openingCamera}
            accessibilityRole="button"
            accessibilityLabel="Open Camera"
          >
            {openingCamera ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <>
                <View style={$cameraIconWrap}>
                  <Ionicons name="camera" size={36} color="#FFFFFF" />
                </View>
                <Text style={$cameraTitle}>Open Camera</Text>
                <Text style={$cameraHint}>Tap to take a site photo</Text>
              </>
            )}
            <Text style={$count}>
              {photos.length} photo{photos.length === 1 ? '' : 's'} captured
            </Text>
          </Pressable>

          <Text style={$captionLabel}>Photo Caption (optional)</Text>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="e.g. Roof hatch access, north side"
            placeholderTextColor={tech.textMuted}
            style={$captionInput}
            returnKeyType="done"
          />

          <Pressable
            style={({ pressed }) => [
              $captureBtn,
              openingCamera && { opacity: 0.6 },
              pressed && !openingCamera && { opacity: 0.9 },
            ]}
            onPress={onOpenCamera}
            disabled={openingCamera}
          >
            {openingCamera ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={$captureBtnText}>Take Photo</Text>
              </>
            )}
          </Pressable>

          <SiteCaptureGallery
            photos={photos}
            onRemove={(photoId) => dispatch(removePhoto({ jobId, photoId }))}
          />
        </>
      ) : null}
    </JobWizardScreen>
  )
}

const $cameraCard: ViewStyle = {
  minHeight: 200,
  borderRadius: tech.radius,
  backgroundColor: '#0F172A',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 14,
  paddingVertical: 28,
  gap: 8,
}

const $cameraIconWrap: ViewStyle = {
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: 'rgba(255,255,255,0.12)',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 4,
}

const $cameraTitle: TextStyle = {
  fontFamily: typography.primary.semiBold,
  color: '#FFFFFF',
  fontSize: 16,
}

const $cameraHint: TextStyle = {
  fontFamily: typography.primary.normal,
  color: '#94A3B8',
  fontSize: 13,
}

const $count: TextStyle = {
  fontFamily: typography.primary.normal,
  color: '#CBD5E1',
  marginTop: 8,
  fontSize: 12,
}

const $captionLabel: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  color: tech.textSecondary,
  marginBottom: 8,
}

const $captionInput: TextStyle = {
  backgroundColor: tech.surface,
  borderWidth: 1,
  borderColor: tech.borderStrong,
  borderRadius: tech.radiusSm,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: tech.text,
  marginBottom: 12,
}

const $captureBtn: ViewStyle = {
  backgroundColor: tech.primary,
  borderRadius: tech.radiusSm,
  minHeight: 48,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 8,
}

const $captureBtnText: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
  color: '#FFFFFF',
}
