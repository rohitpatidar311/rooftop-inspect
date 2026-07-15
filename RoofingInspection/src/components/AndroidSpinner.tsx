import React, { useEffect } from "react"
import { View, ViewStyle } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"

const ROTATION_DURATION = 1000

const SIZE_SMALL = 32
const SIZE_LARGE = 48

export interface AndroidSpinnerProps {
  color: string
  size?: "small" | "large"
  style?: ViewStyle
}

/**
 * Android-style (Material Design) circular indeterminate spinner.
 * Same look on both iOS and Android.
 */
export function AndroidSpinner({
  color,
  size = "large",
  style,
}: AndroidSpinnerProps) {
  const rotation = useSharedValue(0)
  const sizePx = size === "large" ? SIZE_LARGE : SIZE_SMALL
  const strokeWidth = Math.max(2, Math.floor(sizePx / 16))

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(360, { duration: ROTATION_DURATION }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
    )
  }, [rotation])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <View style={[{ width: sizePx, height: sizePx }, style]}>
      <Animated.View
        style={[
          {
            width: sizePx,
            height: sizePx,
            borderRadius: sizePx / 2,
            borderWidth: strokeWidth,
            borderTopColor: color,
            borderRightColor: color,
            borderBottomColor: color,
            borderLeftColor: "transparent",
          },
          animatedStyle,
        ]}
      />
    </View>
  )
}
