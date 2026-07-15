import React from 'react'
import { View, ViewStyle, TextStyle } from 'react-native'
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppTheme } from '../theme/context'
import { Text } from './Text'
import { useAuth } from '../context/AuthContext'
import { ThemedStyle } from '../theme/types'
import { TechBottomActionBar } from './tech/TechBottomActionBar'

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { themed, theme } = useAppTheme()
  const { userData } = useAuth()
  const insets = useSafeAreaInsets()

  const initials =
    `${userData?.FirstName?.[0] ?? 'U'}${userData?.LastName?.[0] ?? ''}`.toUpperCase()

  const focused =
    props.state.index ===
    props.state.routes.findIndex((r) => r.name === 'TodayJobs')

  return (
    <View style={[$container, { paddingTop: insets.top }]}>
      <DrawerContentScrollView
        {...props}
        style={$scrollView}
        contentContainerStyle={themed($scroll)}
      >
        <View style={themed($profile)}>
          <View style={themed($avatar)}>
            <Text text={initials} style={themed($avatarText)} />
          </View>
          <View style={$profileText}>
            <Text
              text={`${userData?.FirstName ?? 'User'} ${userData?.LastName ?? ''}`.trim()}
              weight="semiBold"
              size="sm"
            />
            <Text
              text={userData?.Email ?? ''}
              size="xxs"
              style={{ color: theme.colors.textDim }}
            />
          </View>
        </View>

        <DrawerItem
          label="My Jobs"
          focused={focused}
          activeTintColor={theme.colors.tint}
          inactiveTintColor={theme.colors.text}
          activeBackgroundColor={theme.colors.palette.neutral200}
          icon={({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
          )}
          onPress={() => props.navigation.navigate('TodayJobs')}
        />
      </DrawerContentScrollView>

      <TechBottomActionBar />
    </View>
  )
}

const $container: ViewStyle = { flex: 1 }

const $scrollView: ViewStyle = { flex: 1 }

const $scroll: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.xs,
  paddingBottom: spacing.md,
})

const $profile: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  marginBottom: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $avatar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: colors.tint,
  alignItems: 'center',
  justifyContent: 'center',
})

const $avatarText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.whiteText,
  fontSize: 16,
  fontWeight: '700',
})

const $profileText: ViewStyle = { flex: 1 }
