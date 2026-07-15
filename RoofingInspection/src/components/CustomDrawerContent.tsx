import React, { useRef } from 'react'
import { View, ViewStyle, TextStyle, TouchableOpacity } from 'react-native'
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
import { AppBottomSheet, AppBottomSheetRef } from './AppBottomSheet'
import { Button } from './Button'
import { ThemedStyle } from '../theme/types'
import { showToast } from '../utils/toast'

const DRAWER_ITEMS: {
  name: 'Dashboard' | 'Settings'
  label: string
  icon: string
}[] = [
  { name: 'Dashboard', label: 'Dashboard', icon: 'grid-outline' },
  { name: 'Settings', label: 'Settings & Preferences', icon: 'settings-outline' },
]

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { themed, theme } = useAppTheme()
  const { userData, logout } = useAuth()
  const insets = useSafeAreaInsets()
  const logoutSheetRef = useRef<AppBottomSheetRef>(null)

  const initials =
    `${userData?.FirstName?.[0] ?? 'U'}${userData?.LastName?.[0] ?? ''}`.toUpperCase()

  const handleLogout = async () => {
    logoutSheetRef.current?.dismiss()
    await logout()
    showToast({ type: 'success', message: 'Logged out successfully.' })
  }

  return (
    <View style={[$container, { paddingBottom: insets.bottom }]}>
      <DrawerContentScrollView {...props} contentContainerStyle={themed($scroll)}>
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

        {DRAWER_ITEMS.map((item) => {
          const focused = props.state.index === props.state.routes.findIndex((r) => r.name === item.name)
          return (
            <DrawerItem
              key={item.name}
              label={item.label}
              focused={focused}
              activeTintColor={theme.colors.tint}
              inactiveTintColor={theme.colors.text}
              activeBackgroundColor={theme.colors.palette.neutral200}
              icon={({ color, size }) => (
                <Ionicons name={item.icon as any} size={size} color={color} />
              )}
              onPress={() => props.navigation.navigate(item.name)}
            />
          )
        })}
      </DrawerContentScrollView>

      <TouchableOpacity style={themed($logoutRow)} onPress={() => logoutSheetRef.current?.present()}>
        <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />
        <Text text="Log out" style={themed($logoutText)} />
      </TouchableOpacity>

      <AppBottomSheet ref={logoutSheetRef} title="Log out?">
        <Text
          text="Are you sure you want to log out?"
          style={{ marginBottom: theme.spacing.md, color: theme.colors.textDim }}
        />
        <View style={$logoutActions}>
          <Button
            text="Cancel"
            preset="default"
            style={$flex}
            onPress={() => logoutSheetRef.current?.dismiss()}
          />
          <Button text="Log out" preset="filled" style={$flex} onPress={handleLogout} />
        </View>
      </AppBottomSheet>
    </View>
  )
}

const $container: ViewStyle = { flex: 1 }

const $scroll: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.sm,
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

const $logoutRow: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderTopWidth: 1,
  borderTopColor: colors.border,
})

const $logoutText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
  fontWeight: '600',
})

const $logoutActions: ViewStyle = {
  flexDirection: 'row',
  gap: 12,
}

const $flex: ViewStyle = { flex: 1 }
