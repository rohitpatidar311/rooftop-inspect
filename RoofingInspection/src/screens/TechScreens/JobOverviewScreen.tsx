import React, { FC } from 'react'
import {
  Image,
  ImageStyle,
  Linking,
  Platform,
  Pressable,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import type { JobStackScreenProps } from '../../navigators/navigatorTypes'
import { JobWizardScreen } from './JobWizardScreen'
import { ContinueButton } from '../../components/tech/ContinueButton'
import { StatusBadge } from '../../components/tech/StatusBadge'
import { useJobVisit } from './useJobVisit'
import { useAppDispatch } from '../../redux/hooks'
import { unlockStep, createEmptyProgress } from '../../redux/slices/visitSlice'
import { showToast } from '../../utils/toast'
import { tech, $techCard, $techHeading, $techBody } from './techTheme'
import { typography } from '../../theme/typography'

const siteMapImage = require('../../assets/images/job-site-map.png')

type Props = JobStackScreenProps<'JobOverview'>

export const JobOverviewScreen: FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params
  const { job, progress, loading } = useJobVisit(jobId)
  const dispatch = useAppDispatch()
  const unlocked = progress?.unlockedSteps ?? createEmptyProgress(jobId).unlockedSteps

  const startVisit = () => {
    dispatch(unlockStep({ jobId, step: 'capture' }))
    navigation.navigate('SiteCapture', { jobId })
  }

  const openInMaps = async () => {
    if (!job) return
    const { latitude, longitude, siteName } = job
    const label = encodeURIComponent(siteName)
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    })
    try {
      const canOpen = url ? await Linking.canOpenURL(url) : false
      if (canOpen && url) {
        await Linking.openURL(url)
        return
      }
      await Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      )
    } catch {
      showToast({ type: 'error', message: 'Could not open maps.' })
    }
  }

  return (
    <JobWizardScreen
      title={job?.siteName ?? 'Job'}
      subtitle={job?.address}
      jobId={jobId}
      activeStep="overview"
      unlockedSteps={unlocked}
      loading={loading || !job}
      onBack={() => navigation.getParent()?.navigate('TodayJobs' as never)}
      footer={<ContinueButton text="Start Inspection" onPress={startVisit} />}
    >
      {job ? (
        <>
          <Pressable
            onPress={openInMaps}
            style={({ pressed }) => [$mapCard, pressed && { opacity: 0.92 }]}
            accessibilityRole="button"
            accessibilityLabel="Open site location in maps"
          >
            <Image source={siteMapImage} style={$mapImage} resizeMode="cover" />
            <View style={$pinWrap} pointerEvents="none">
              <Ionicons name="location-sharp" size={36} color="#EA4335" />
            </View>
           
          </Pressable>

          <View style={$techCard}>
            <Text style={$techHeading}>Visit Summary</Text>
            <View style={$row}>
              <Text style={$label}>Status</Text>
              <StatusBadge status={job.status} />
            </View>
            <View style={$divider} />
            <View style={$row}>
              <Text style={$label}>Address</Text>
              <Text style={$value}>{job.address}</Text>
            </View>
            <View style={$divider} />
            <View style={$row}>
              <Text style={$label}>Services</Text>
              <Text style={[$value, { flex: 1, textAlign: 'right' }]}>
                {job.serviceTags.join(', ')}
              </Text>
            </View>
          </View>
        </>
      ) : null}
    </JobWizardScreen>
  )
}

const $mapCard: ViewStyle = {
  height: 220,
  borderRadius: tech.radius,
  overflow: 'hidden',
  marginBottom: 16,
  backgroundColor: '#E2E8F0',
  borderWidth: 1,
  borderColor: tech.border,
}

const $mapImage: ImageStyle = {
  width: '100%',
  height: '100%',
}

const $pinWrap: ViewStyle = {
  position: 'absolute',
  top: '42%',
  left: '50%',
  marginLeft: -18,
  marginTop: -34,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.35,
  shadowRadius: 3,
  elevation: 4,
}

const $mapFooter: ViewStyle = {
  position: 'absolute',
  left: 12,
  right: 12,
  bottom: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  backgroundColor: 'rgba(15, 23, 42, 0.72)',
  borderRadius: tech.radiusSm,
  paddingVertical: 8,
  paddingHorizontal: 12,
}

const $mapFooterText: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  color: '#FFFFFF',
}

const $row: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  paddingVertical: 4,
}

const $divider: ViewStyle = {
  height: 1,
  backgroundColor: tech.border,
  marginVertical: 10,
}

const $label: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: tech.textSecondary,
}

const $value: TextStyle = {
  ...$techBody,
  fontFamily: typography.primary.semiBold,
}
