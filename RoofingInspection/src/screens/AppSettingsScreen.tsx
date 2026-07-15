import React, { FC, useRef } from 'react'
import { Alert, Linking, View, ViewStyle, TextStyle, TouchableOpacity } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Screen } from '../components/Screen'
import { Text } from '../components/Text'
import { Switch } from '../components/Toggle/Switch'
import { AppBottomSheet, AppBottomSheetRef } from '../components/AppBottomSheet'
import { Button } from '../components/Button'
import { useAppTheme } from '../theme/context'
import { ACCENT_COLORS, AccentColorName, ThemedStyle, ThemeContextModeT } from '../theme/types'
import { useAuth } from '../context/AuthContext'
import { getAppVersionDisplay } from '../utils/appVersion'
import { showToast } from '../utils/toast'
import { api } from '../services/api'

interface AppSettingsScreenProps {
  // Legacy settings screen — drawer entry removed; kept for optional reuse
}

const THEME_OPTIONS: { value: ThemeContextModeT; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'auto', label: 'Auto', icon: 'phone-portrait-outline' },
]

export const AppSettingsScreen: FC<AppSettingsScreenProps> = () => {
  const {
    themed,
    theme,
    themePreference,
    setThemeContextOverride,
    accentColor,
    setAccentColor,
  } = useAppTheme()
  const { userData, logout } = useAuth()
  const logoutSheetRef = useRef<AppBottomSheetRef>(null)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)

  const persistPreference = async (patch: Record<string, unknown>) => {
    if (!userData?.UserId) return
    await api.updateUserPreferences({ UserId: userData.UserId, ...patch })
  }

  const onThemeChange = (value: ThemeContextModeT) => {
    setThemeContextOverride(value)
    persistPreference({ ThemePreference: value })
  }

  const onAccentChange = (color: AccentColorName) => {
    setAccentColor(color)
    persistPreference({ ColorPreference: color })
  }

  const handleLogout = async () => {
    logoutSheetRef.current?.dismiss()
    await logout()
    showToast({ type: 'success', message: 'Logged out successfully.' })
  }

  return (
    <Screen preset="scroll" safeAreaEdges={['bottom']} contentContainerStyle={themed($content)}>
      <Text preset="heading" text="Settings" style={themed($title)} />

      <Text preset="formLabel" text="Appearance" style={themed($section)} />
      <View style={themed($card)}>
        <Text text="Theme" weight="semiBold" style={themed($rowLabel)} />
        <View style={themed($chipRow)}>
          {THEME_OPTIONS.map((opt) => {
            const active = themePreference === opt.value
            return (
              <TouchableOpacity
                key={opt.value}
                style={[themed($chip), active && themed($chipActive)]}
                onPress={() => onThemeChange(opt.value)}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={16}
                  color={active ? theme.colors.whiteText : theme.colors.text}
                />
                <Text
                  text={opt.label}
                  size="xs"
                  style={{ color: active ? theme.colors.whiteText : theme.colors.text }}
                />
              </TouchableOpacity>
            )
          })}
        </View>

        <Text text="Accent color" weight="semiBold" style={themed($rowLabel)} />
        <View style={themed($chipRow)}>
          {(Object.keys(ACCENT_COLORS) as AccentColorName[]).map((name) => {
            const active = accentColor === name
            return (
              <TouchableOpacity
                key={name}
                style={[
                  themed($colorDot),
                  { backgroundColor: ACCENT_COLORS[name] },
                  active && themed($colorDotActive),
                ]}
                onPress={() => onAccentChange(name)}
              />
            )
          })}
        </View>
      </View>

      <Text preset="formLabel" text="Notifications" style={themed($section)} />
      <View style={themed($card)}>
        <View style={themed($switchRow)}>
          <Text text="Enable notifications" />
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        </View>
        <TouchableOpacity onPress={() => Linking.openSettings()}>
          <Text text="Open system settings" style={{ color: theme.colors.tint }} size="xs" />
        </TouchableOpacity>
      </View>

      <Text preset="formLabel" text="Data" style={themed($section)} />
      <View style={themed($card)}>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Clear cache', 'Mock action — no cache to clear yet.', [
              { text: 'OK' },
            ])
          }
        >
          <Text text="Clear cache" />
        </TouchableOpacity>
      </View>

      <Text preset="formLabel" text="About" style={themed($section)} />
      <View style={themed($card)}>
        <Text text="Roofing Inspection" weight="semiBold" />
        <Text text={getAppVersionDisplay()} size="xs" style={{ color: theme.colors.textDim }} />
      </View>

      <Button
        text="Log out"
        preset="outline"
        style={themed($logoutBtn)}
        onPress={() => logoutSheetRef.current?.present()}
      />

      <AppBottomSheet ref={logoutSheetRef} title="Log out?">
        <Text
          text="Are you sure you want to log out?"
          style={{ marginBottom: theme.spacing.md, color: theme.colors.textDim }}
        />
        <View style={$actions}>
          <Button
            text="Cancel"
            style={$flex}
            onPress={() => logoutSheetRef.current?.dismiss()}
          />
          <Button text="Log out" preset="filled" style={$flex} onPress={handleLogout} />
        </View>
      </AppBottomSheet>
    </Screen>
  )
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.xl,
})

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  marginBottom: spacing.sm,
})

const $section: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  marginBottom: spacing.xs,
  color: colors.textDim,
})

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  padding: spacing.md,
  gap: spacing.sm,
})

const $rowLabel: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $chipRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: spacing.xs,
  marginBottom: spacing.sm,
})

const $chip: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.background,
})

const $chipActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderColor: colors.tint,
})

const $colorDot: ThemedStyle<ViewStyle> = () => ({
  width: 28,
  height: 28,
  borderRadius: 14,
})

const $colorDotActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderWidth: 3,
  borderColor: colors.text,
})

const $switchRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
})

const $logoutBtn: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
})

const $actions: ViewStyle = { flexDirection: 'row', gap: 12 }
const $flex: ViewStyle = { flex: 1 }
