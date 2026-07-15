import React, { FC, useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  RefreshControl,
  Text,
  Pressable,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Screen } from '../../components/Screen'
import { StatusBadge } from '../../components/tech/StatusBadge'
import { Skeleton } from '../../components/Skeleton'
import { useAppTheme } from '../../theme/context'
import { ThemedStyle } from '../../theme/types'
import { api } from '../../services/api'
import type { TechJob } from '../../services/api/types'
import type { MainDrawerScreenProps } from '../../navigators/navigatorTypes'
import { useAuth } from '../../context/AuthContext'
import { useAppSelector } from '../../redux/hooks'
import { typography } from '../../theme/typography'
import { tech, $techCard } from './techTheme'

interface Props extends MainDrawerScreenProps<'TodayJobs'> {}

export const TodayJobsScreen: FC<Props> = ({ navigation }) => {
  const { themed, theme } = useAppTheme()
  const { userData } = useAuth()
  const statusOverrides = useAppSelector((s) => s.visit.statusOverrides)
  const [jobs, setJobs] = useState<TechJob[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    const result = await api.getTodayJobs()
    if (result.kind === 'ok') {
      setJobs(
        result.data.map((job) => ({
          ...job,
          status: statusOverrides[job.id] ?? job.status,
        })),
      )
    }
    setLoading(false)
    setRefreshing(false)
  }, [statusOverrides])

  useEffect(() => {
    load()
  }, [load])

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const techName =
    `${userData?.FirstName ?? 'Mike'} ${userData?.LastName ?? 'Torres'}`.trim()
  const initials =
    `${userData?.FirstName?.[0] ?? 'M'}${userData?.LastName?.[0] ?? 'T'}`.toUpperCase()

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['bottom']}
      contentContainerStyle={themed($container)}
      backgroundColor={tech.bg}
      systemBarStyle="dark"
    >
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={$list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={tech.primary}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={[$techCard, $techProfile]}>
              <View style={$avatar}>
                <Text style={$avatarText}>{initials}</Text>
              </View>
              <View style={$techLeft}>
                <Text style={$techLabel}>Field technician</Text>
                <Text style={$techName}>{techName}</Text>
              </View>
              <View style={$onlinePill}>
                <View style={$onlineDot} />
                <Text style={$onlineText}>Online</Text>
              </View>
            </View>

            <View style={$dateRow}>
              <Ionicons name="calendar-outline" size={16} color={tech.textMuted} />
              <Text style={$date}>{dateLabel}</Text>
            </View>
            <Text style={$section}>Today's jobs</Text>
            {loading && jobs.length === 0 ? (
              <View style={{ gap: 12 }}>
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} height={118} radius={tech.radius} />
                ))}
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [$jobCard, pressed && { opacity: 0.92 }]}
            onPress={() =>
              navigation.navigate('JobFlow', {
                screen: 'JobOverview',
                params: { jobId: item.id },
              })
            }
            accessibilityRole="button"
            accessibilityLabel={`Open job ${item.siteName}`}
          >
            <View style={$jobTop}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={$siteName}>{item.siteName}</Text>
                <View style={$addressRow}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={tech.textMuted}
                  />
                  <Text style={$address}>{item.address}</Text>
                </View>
              </View>
              <StatusBadge status={item.status} />
            </View>
            <View style={$tags}>
              {item.serviceTags.map((tag) => (
                <View key={tag} style={$tag}>
                  <Text style={$tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <View style={$cardFooter}>
              <Text style={$openLabel}>Open Visit</Text>
              <Ionicons name="chevron-forward" size={16} color={tech.primary} />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={$empty}>
              <Ionicons name="clipboard-outline" size={40} color={tech.textMuted} />
              <Text style={{ color: theme.colors.textDim, marginTop: 12, textAlign: 'center' }}>
                No jobs scheduled today.
              </Text>
            </View>
          ) : null
        }
      />
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: tech.bg,
})

const $list: ViewStyle = {
  padding: 16,
  paddingBottom: 40,
}

const $techProfile: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  marginBottom: 18,
}

const $avatar: ViewStyle = {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: tech.primary,
  alignItems: 'center',
  justifyContent: 'center',
}

const $avatarText: TextStyle = {
  fontFamily: typography.primary.bold,
  color: '#FFFFFF',
  fontSize: 16,
}

const $techLeft: ViewStyle = { flex: 1 }

const $techLabel: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: tech.textMuted,
  marginBottom: 2,
}

const $techName: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 17,
  color: tech.text,
}

const $onlinePill: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  backgroundColor: tech.successMuted,
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: tech.radiusPill,
}

const $onlineDot: ViewStyle = {
  width: 7,
  height: 7,
  borderRadius: 4,
  backgroundColor: tech.online,
}

const $onlineText: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 12,
  color: tech.online,
}

const $dateRow: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  marginBottom: 10,
}

const $date: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: tech.textSecondary,
}

const $section: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  color: tech.text,
  marginBottom: 12,
}

const $jobCard: ViewStyle = {
  ...$techCard,
  marginBottom: 12,
  paddingBottom: 12,
}

const $jobTop: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'flex-start',
}

const $siteName: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  color: tech.text,
}

const $addressRow: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  marginTop: 4,
}

const $address: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: tech.textSecondary,
}

const $tags: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 12,
}

const $tag: ViewStyle = {
  backgroundColor: tech.primaryMuted,
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 4,
}

const $tagText: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 11,
  color: tech.primaryDark,
  textTransform: 'uppercase',
}

const $cardFooter: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 2,
  marginTop: 12,
  paddingTop: 10,
  borderTopWidth: 1,
  borderTopColor: tech.border,
}

const $openLabel: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  color: tech.primary,
}

const $empty: ViewStyle = {
  alignItems: 'center',
  marginTop: 48,
  paddingHorizontal: 24,
}
