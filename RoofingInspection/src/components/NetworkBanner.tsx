import React, { useEffect, useRef, useState } from "react"
import { Animated, View, ViewStyle, TextStyle, TouchableOpacity } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Ionicons from "react-native-vector-icons/Ionicons"
import { Text } from "./Text"
import { useNetworkStatus } from "../hooks/useNetworkStatus"
import { useAppTheme } from "../theme/context"
import { ThemedStyle } from "../theme/types"

const BANNER_HIDE_HEIGHT = 150 // Distance to hide below screen

export const NetworkBanner = () => {
  const { themed, theme } = useAppTheme()
  const isConnected = useNetworkStatus()
  const insets = useSafeAreaInsets()

  const [shouldRender, setShouldRender] = useState(false)
  const [dismissedOffline, setDismissedOffline] = useState(false)

  const translateY = useRef(new Animated.Value(BANNER_HIDE_HEIGHT)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!isConnected) {
      if (dismissedOffline) return

      setShouldRender(true)
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
          speed: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      if (!shouldRender) return

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: BANNER_HIDE_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false)
        setDismissedOffline(false)
        opacity.setValue(0)
      })
    }
  }, [isConnected, dismissedOffline, opacity, translateY, shouldRender])

  if (!shouldRender) return null

  // No-internet: dark mode = near-black bg + red border; light mode = light bg + red border.
  const offlineBackgroundColor = theme.isDark ? theme.colors.palette.neutral100 : theme.colors.palette.neutral100
  const backgroundColor = offlineBackgroundColor
  const borderColor = theme.colors.error
  const borderTopWidth = 2
  // Text/icon: dark on light no-internet, white on dark no-internet and on "back online".
  const isOfflineLight = !theme.isDark
  const contentColor = isOfflineLight ? theme.colors.text : (theme.colors.whiteText ?? "#FFF")
  const subtitleColor = isOfflineLight ? theme.colors.textDim : "rgba(255,255,255,0.9)"

  const iconName = "cloud-offline-outline"
  const title = "No internet connection"
  const subtitle = "Check your Wi‑Fi or mobile data."

  return (
    <Animated.View
      style={[
        themed($container),
        {
          backgroundColor,
          borderTopWidth,
          borderColor,
          transform: [{ translateY }],
          opacity,
          paddingBottom: Math.max(insets.bottom, theme.spacing.md),
        },
      ]}
    >
      <View style={themed($content)}>
        <View style={themed($messageWrap)}>
          <View style={[themed($iconWrap), isOfflineLight && { backgroundColor: "rgba(0,0,0,0.08)" }]}>
            <Ionicons
              name={iconName}
              size={24}
              color={contentColor}
            />
          </View>
          <View style={themed($textWrap)}>
            <Text preset="default" weight="semiBold" style={[themed($title), { color: contentColor }]}>
              {title}
            </Text>
            <Text preset="default" style={[themed($subtitle), { color: subtitleColor }]}>
              {subtitle}
            </Text>
          </View>
        </View>

        {!isConnected && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Dismiss no internet message"
            onPress={() => {
              Animated.parallel([
                Animated.timing(translateY, {
                  toValue: BANNER_HIDE_HEIGHT,
                  duration: 250,
                  useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                setShouldRender(false)
                setDismissedOffline(true)
              })
            }}
            style={[themed($dismissButton), { borderColor: contentColor }]}
          >
            <Ionicons
              name="close"
              size={20}
              color={contentColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  )
}

/**
 * Styles
 */
const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 99999,
  paddingTop: spacing.md,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 24,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.lg,
  gap: spacing.md,
})

const $messageWrap: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
})

const $iconWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "rgba(255,255,255,0.2)",
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.md,
})

const $textWrap: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $title: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.whiteText ?? "#FFF",
  fontSize: 16,
  marginBottom: 2,
})

const $subtitle: ThemedStyle<TextStyle> = () => ({
  color: "rgba(255,255,255,0.9)",
  fontSize: 13,
})

const $dismissButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.6)",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: spacing.md,
})