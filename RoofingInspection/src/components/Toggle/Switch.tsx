import React, { FC, useEffect } from "react"
import { Pressable, StyleProp, ViewStyle } from "react-native"
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { useAppTheme } from "../../theme/context"
import { ThemedStyle } from "../../theme/types"

export interface SwitchProps {
  /**
   * Whether the switch is on or off.
   */
  value?: boolean
  /**
   * Callback when the value changes.
   */
  onValueChange?: (newValue: boolean) => void
  /**
   * Optional style override for the track container.
   */
  style?: StyleProp<ViewStyle>
  /**
   * Whether the switch is disabled.
   */
  disabled?: boolean
}

// Fixed dimensions for the switch
const TRACK_WIDTH = 40
const TRACK_HEIGHT = 14
const THUMB_SIZE = 20
const OFF_POSITION = 0
const ON_POSITION = TRACK_WIDTH - THUMB_SIZE - 0

export const Switch: FC<SwitchProps> = (props) => {
  const { value = false, onValueChange, style: $styleOverride, disabled = false } = props
  const { themed, theme } = useAppTheme()

  // Animation shared value (0 = off, 1 = on)
  const progress = useSharedValue(value ? 1 : 0)

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    })
  }, [value])

  const handleToggle = () => {
    if (disabled) return
    onValueChange?.(!value)
  }

  /**
   * Animated track background color (gray -> tint)
   */
  const animatedTrackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.tint, theme.colors.tint], // Inactive color vs Active tint
    )
    return { backgroundColor }
  })

  /**
   * Animated thumb position (left -> right)
   */
  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: progress.value * (ON_POSITION - OFF_POSITION) + OFF_POSITION,
        },
      ],
    }
  })

  return (
    <Pressable
      onPress={handleToggle}
    //   activeOpacity={1}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={[$styleOverride, disabled && { opacity: 0.5 }]}
    >
      <Animated.View style={[themed($trackStyle), animatedTrackStyle]}>
        <Animated.View style={[themed($thumbStyle), animatedThumbStyle]} />
      </Animated.View>
    </Pressable>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const $trackStyle: ThemedStyle<ViewStyle> = () => ({
  width: TRACK_WIDTH,
  height: TRACK_HEIGHT,
  borderRadius: TRACK_HEIGHT / 2,
  justifyContent: "center",
})

const $thumbStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: THUMB_SIZE,
  height: THUMB_SIZE,
  borderRadius: THUMB_SIZE / 2,
  backgroundColor: colors.whiteText, // Always white-ish thumb
  // Shadow for the thumb
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 2.5,
})