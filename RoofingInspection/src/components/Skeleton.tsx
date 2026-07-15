import React, { useEffect, useRef, useState } from "react"
import {
  Animated,
  DimensionValue,
  Easing,
  LayoutChangeEvent,
  View,
  ViewStyle,
} from "react-native"
import { useAppTheme } from "../theme/context"

export interface SkeletonProps {
  width?: DimensionValue
  height?: DimensionValue
  radius?: number
  style?: ViewStyle
}

const SHIMMER_BAND_WIDTH_RATIO = 0.65
const SHIMMER_DURATION_MS = 1600
const SHIMMER_EASING = Easing.bezier(0.25, 0.1, 0.25, 1)

const $shimmerBandWrap: ViewStyle = {
  position: "absolute",
  top: 0,
  bottom: 0,
  flexDirection: "row",
}

const $shimmerSegment = (
  theme: { isDark?: boolean },
  opacity: number
): ViewStyle => ({
  flex: 1,
  height: "100%",
  backgroundColor: theme.isDark
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(255, 255, 255, 0.35)",
  opacity,
})

/**
 * Animated skeleton with soft gradient-like shimmer (React Native core only).
 */
export const Skeleton = ({
  width = "100%",
  height = 20,
  radius = 4,
  style,
}: SkeletonProps) => {
  const { theme } = useAppTheme()
  const translateX = useRef(new Animated.Value(-1)).current
  const [layoutWidth, setLayoutWidth] = useState(0)

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    if (w > 0) setLayoutWidth(w)
  }

  useEffect(() => {
    if (layoutWidth <= 0) return
    const bandWidth = layoutWidth * SHIMMER_BAND_WIDTH_RATIO
    const startX = -bandWidth
    const endX = layoutWidth

    translateX.setValue(startX)
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: endX,
        duration: SHIMMER_DURATION_MS,
        easing: SHIMMER_EASING,
        useNativeDriver: true,
      })
    )
    loop.start()
    return () => loop.stop()
  }, [layoutWidth, translateX])

  const baseStyle: ViewStyle = {
    width,
    height,
    borderRadius: radius,
    backgroundColor: theme.colors.palette.neutral300,
    overflow: "hidden",
  }

  const bandWidth = layoutWidth * SHIMMER_BAND_WIDTH_RATIO

  return (
    <Animated.View style={[baseStyle, style]} onLayout={onLayout}>
      {layoutWidth > 0 && (
        <Animated.View
          style={[
            $shimmerBandWrap,
            {
              width: bandWidth,
              transform: [{ translateX }],
            },
          ]}
        >
          <View style={[$shimmerSegment(theme, 0.25), { flex: 0.35 }]} />
          <View style={[$shimmerSegment(theme, 0.85), { flex: 0.3 }]} />
          <View style={[$shimmerSegment(theme, 0.25), { flex: 0.35 }]} />
        </Animated.View>
      )}
    </Animated.View>
  )
}
