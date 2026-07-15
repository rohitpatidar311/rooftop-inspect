import React, { FC, useCallback, useEffect, useState } from 'react'
import {
  RefreshControl,
  View,
  ViewStyle,
  TextStyle,
  FlatList,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Screen } from '../../components/Screen'
import { Text } from '../../components/Text'
import { Card } from '../../components/Card'
import { Skeleton } from '../../components/Skeleton'
import { useAppTheme } from '../../theme/context'
import { ThemedStyle } from '../../theme/types'
import { api } from '../../services/api'
import type { DashboardData } from '../../services/api/types'
import type { MainDrawerScreenProps } from '../../navigators/navigatorTypes'
import { useAuth } from '../../context/AuthContext'

interface DashboardScreenProps extends MainDrawerScreenProps<'Dashboard'> {}

export const DashboardScreen: FC<DashboardScreenProps> = () => {
  const { themed, theme } = useAppTheme()
  const { userData } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    const result = await api.getDashboard()
    if (result.kind === 'ok') {
      setData({
        ...result.data,
        greetingName: userData?.FirstName || result.data.greetingName,
      })
    }
    setLoading(false)
    setRefreshing(false)
  }, [userData?.FirstName])

  useEffect(() => {
    load()
  }, [load])

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['bottom']}
      contentContainerStyle={themed($container)}
    >
      <FlatList
        data={data?.recentItems ?? []}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={theme.colors.tint}
          />
        }
        ListHeaderComponent={
          <View>
            <Text
              preset="heading"
              text={`Hello, ${data?.greetingName ?? userData?.FirstName ?? 'Inspector'}`}
              style={themed($greeting)}
            />
            <Text
              text="Here's your roofing inspection overview (mock data)."
              style={themed($subtitle)}
            />

            {loading && !data ? (
              <View style={themed($statsGrid)}>
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} width="47%" height={100} radius={12} style={$skeletonCard} />
                ))}
              </View>
            ) : (
              <View style={themed($statsGrid)}>
                {data?.stats.map((stat) => (
                  <View key={stat.id} style={themed($statCard)}>
                    <Ionicons
                      name={stat.icon as any}
                      size={22}
                      color={theme.colors.tint}
                    />
                    <Text text={String(stat.value)} weight="bold" size="xl" />
                    <Text text={stat.title} weight="semiBold" size="xs" />
                    <Text text={stat.subtitle} size="xxs" style={{ color: theme.colors.textDim }} />
                  </View>
                ))}
              </View>
            )}

            <Text preset="subheading" text="Recent inspections" style={themed($sectionTitle)} />
          </View>
        }
        renderItem={({ item }) => (
          <Card
            heading={item.title}
            content={`${item.status} · ${item.date}`}
            style={themed($listCard)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <Text text="No recent inspections." style={{ color: theme.colors.textDim }} />
          ) : null
        }
        contentContainerStyle={themed($listContent)}
      />
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.xl,
})

const $greeting: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  marginBottom: spacing.xxs,
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginBottom: spacing.md,
})

const $statsGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: spacing.sm,
  marginBottom: spacing.lg,
})

const $statCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: '47%',
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  padding: spacing.md,
  gap: 4,
})

const $skeletonCard: ViewStyle = {
  marginBottom: 0,
}

const $sectionTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $listCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})
