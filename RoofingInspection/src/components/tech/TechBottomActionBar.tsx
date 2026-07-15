import React, { useRef } from 'react'
import {
  Pressable,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppBottomSheet, AppBottomSheetRef } from '../AppBottomSheet'
import { Button } from '../Button'
import { Text as AppText } from '../Text'
import { useAppTheme } from '../../theme/context'
import { useAuth } from '../../context/AuthContext'
import { showToast } from '../../utils/toast'
import type { ThemeContextModeT } from '../../theme/types'
import { tech } from '../../screens/TechScreens/techTheme'
import { typography } from '../../theme/typography'

type Action = {
  key: string
  icon: string
  label: string
  onPress: () => void
}

/**
 * Circular action strip — profile, theme, appearance, logout.
 */
export function TechBottomActionBar() {
  const insets = useSafeAreaInsets()
  const { theme, themeContext, themePreference, setThemeContextOverride } =
    useAppTheme()
  const { userData, logout } = useAuth()
  const profileRef = useRef<AppBottomSheetRef>(null)
  const appearanceRef = useRef<AppBottomSheetRef>(null)
  const logoutRef = useRef<AppBottomSheetRef>(null)

  const toggleTheme = () => {
    const next: ThemeContextModeT =
      themeContext === 'dark' ? 'light' : 'dark'
    setThemeContextOverride(next)
    showToast({
      type: 'success',
      message: next === 'dark' ? 'Dark mode on' : 'Light mode on',
    })
  }

  const handleLogout = async () => {
    logoutRef.current?.dismiss()
    await logout()
    showToast({ type: 'success', message: 'Logged out successfully.' })
  }

  const actions: Action[] = [
    {
      key: 'profile',
      icon: 'person-outline',
      label: 'Profile',
      onPress: () => profileRef.current?.present(),
    },
    {
      key: 'theme',
      icon: themeContext === 'dark' ? 'sunny-outline' : 'moon-outline',
      label: 'Theme',
      onPress: toggleTheme,
    },
    {
      key: 'appearance',
      icon: 'settings-outline',
      label: 'Appearance',
      onPress: () => appearanceRef.current?.present(),
    },
    {
      key: 'logout',
      icon: 'log-out-outline',
      label: 'Log out',
      onPress: () => logoutRef.current?.present(),
    },
  ]

  const techName =
    `${userData?.FirstName ?? ''} ${userData?.LastName ?? ''}`.trim() ||
    'Technician'

  return (
    <>
      <View
        style={[
          $bar,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: theme.colors.palette.cardColor ?? '#FFFFFF',
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <View style={$row}>
          {actions.map((action) => (
            <Pressable
              key={action.key}
              onPress={action.onPress}
              style={({ pressed }) => [
                $circle,
                {
                  backgroundColor:
                    themeContext === 'dark' ? '#2D2D2D' : '#F1F5F9',
                },
                pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] },
              ]}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <Ionicons
                name={action.icon as never}
                size={22}
                color={theme.colors.text}
              />
            </Pressable>
          ))}
        </View>
      </View>

      <AppBottomSheet ref={profileRef} title="Profile" snapPoints={['32%']}>
        <AppText
          text={techName}
          weight="semiBold"
          size="md"
          style={{ marginBottom: 4 }}
        />
        <AppText
          text={userData?.Email ?? ''}
          size="sm"
          style={{ color: theme.colors.textDim, marginBottom: 8 }}
        />
        <AppText
          text={userData?.RoleName ?? 'Field Technician'}
          size="xs"
          style={{ color: theme.colors.textDim }}
        />
      </AppBottomSheet>

      <AppBottomSheet
        ref={appearanceRef}
        title="Appearance"
        snapPoints={['40%']}
      >
        <AppText
          text="Theme"
          weight="semiBold"
          size="sm"
          style={{ marginBottom: 10 }}
        />
        <View style={$themeRow}>
          {(
            [
              { value: 'light', label: 'Light', icon: 'sunny-outline' },
              { value: 'dark', label: 'Dark', icon: 'moon-outline' },
              { value: 'auto', label: 'Auto', icon: 'phone-portrait-outline' },
            ] as const
          ).map((opt) => {
            const active = themePreference === opt.value
            return (
              <Pressable
                key={opt.value}
                onPress={() => setThemeContextOverride(opt.value)}
                style={[
                  $themeChip,
                  {
                    backgroundColor: active
                      ? tech.primary
                      : themeContext === 'dark'
                        ? '#2D2D2D'
                        : '#F1F5F9',
                  },
                ]}
              >
                <Ionicons
                  name={opt.icon as never}
                  size={16}
                  color={active ? '#FFF' : theme.colors.text}
                />
                <Text
                  style={[
                    $themeChipText,
                    { color: active ? '#FFF' : theme.colors.text },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </AppBottomSheet>

      <AppBottomSheet ref={logoutRef} title="Log out?">
        <AppText
          text="Are you sure you want to log out?"
          style={{ marginBottom: theme.spacing.md, color: theme.colors.textDim }}
        />
        <View style={$logoutActions}>
          <Button
            text="Cancel"
            preset="default"
            style={$flex}
            onPress={() => logoutRef.current?.dismiss()}
          />
          <Button
            text="Log out"
            preset="filled"
            style={$flex}
            onPress={handleLogout}
          />
        </View>
      </AppBottomSheet>
    </>
  )
}

const $bar: ViewStyle = {
  borderTopWidth: 1,
  paddingTop: 14,
  paddingHorizontal: 16,
}

const $row: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-evenly',
}

const $circle: ViewStyle = {
  width: 52,
  height: 52,
  borderRadius: 26,
  alignItems: 'center',
  justifyContent: 'center',
}

const $themeRow: ViewStyle = {
  flexDirection: 'row',
  gap: 8,
}

const $themeChip: ViewStyle = {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  paddingVertical: 12,
  borderRadius: 10,
}

const $themeChipText: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
}

const $logoutActions: ViewStyle = {
  flexDirection: 'row',
  gap: 12,
}

const $flex: ViewStyle = { flex: 1 }
