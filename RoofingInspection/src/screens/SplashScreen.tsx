import React, { FC, useEffect } from "react"
import { Image, ImageStyle, View, ViewStyle } from "react-native"
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"
import { RootStackScreenProps } from "../navigators/navigatorTypes"
import { useAppTheme } from "../theme/context"
import { Screen } from "../components/Screen"
import { ThemedStyle } from "../theme/types"

const SPLASH_ANIM_DURATION = 500
const SPLASH_LOGO_DELAY = 100
const BOUNCE_DURATION = 800
const PROGRESS_DURATION_MS = 2800
const PROGRESS_BAR_WIDTH = 200
const PROGRESS_BAR_HEIGHT = 4
const SPLASH_BG = "#000000"
const SPLASH_ACCENT = "#0096FF"

interface SplashScreenProps extends RootStackScreenProps<"Splash"> {}

export const SplashScreen: FC<SplashScreenProps> = () => {
  const { themed, theme } = useAppTheme()
  const logoScale = useSharedValue(1)
  const progress = useSharedValue(0)

  useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: BOUNCE_DURATION / 2 }),
        withTiming(1, { duration: BOUNCE_DURATION / 2 }),
      ),
      -1,
      true,
    )
  }, [logoScale])

  useEffect(() => {
    progress.value = withTiming(1, { duration: PROGRESS_DURATION_MS })
  }, [progress])

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }))

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }))

  return (
    <Screen
      preset="fixed"
      style={themed($centerContainer)}
      safeAreaEdges={["top", "bottom"]}
      backgroundColor={SPLASH_BG}
      systemBarStyle="light"
    >
      <Animated.View
        entering={FadeIn.duration(SPLASH_ANIM_DURATION)}
        style={themed($logoWrapper)}
      >
        <Animated.View
          entering={FadeInDown.duration(SPLASH_ANIM_DURATION)
            .delay(SPLASH_LOGO_DELAY)
            .springify()}
          style={[themed($logoContainer), logoAnimatedStyle]}
        >
          <Image
            source={theme.assets.splashLogo}
            resizeMode="contain"
            style={themed($logo)}
          />
        </Animated.View>
      </Animated.View>
      <Animated.View
        entering={FadeIn.duration(SPLASH_ANIM_DURATION).delay(300)}
        style={themed($progressBarWrapper)}
      >
        <View style={themed($progressBarTrack)}>
          <Animated.View
            style={[themed($progressBarFill), progressBarStyle]}
          />
        </View>
      </Animated.View>
    </Screen>
  )
}

const $centerContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: SPLASH_BG,
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: 40,
})

const $logoWrapper: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
})

const $logoContainer: ThemedStyle<ViewStyle> = () => ({
  width: 280,
  height: 120,
  alignItems: "center",
  justifyContent: "center",
})

const $logo: ThemedStyle<ImageStyle> = () => ({
  width: 280,
  height: 120,
})

const $progressBarWrapper: ThemedStyle<ViewStyle> = () => ({
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: 24,
})

const $progressBarTrack: ThemedStyle<ViewStyle> = () => ({
  width: PROGRESS_BAR_WIDTH,
  height: PROGRESS_BAR_HEIGHT,
  borderRadius: PROGRESS_BAR_HEIGHT / 2,
  backgroundColor: "rgba(255,255,255,0.2)",
  overflow: "hidden",
})

const $progressBarFill: ThemedStyle<ViewStyle> = () => ({
  height: "100%",
  borderRadius: PROGRESS_BAR_HEIGHT / 2,
  backgroundColor: SPLASH_ACCENT,
})
