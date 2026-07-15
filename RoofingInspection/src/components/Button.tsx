import React, { ComponentType, useCallback } from "react"
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native"
import { Keyboard } from "react-native"

import { Text, TextProps } from "./Text"
import { triggerHaptic } from "../utils/haptics"
import { useAppTheme } from "../theme/context"
import { ThemedStyle, ThemedStyleArray } from "../theme/types"
import { $styles } from "../theme/styles"

type Presets = "default" | "filled" | "outline"

export interface ButtonAccessoryProps {
  style: StyleProp<any>
  pressableState: PressableStateCallbackType
  disabled?: boolean
}

export interface ButtonProps extends PressableProps {
  /**
   * The text to display.
   */
  text?: string
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  /**
   * An optional style override for the "pressed" state.
   */
  pressedStyle?: StyleProp<ViewStyle>
  /**
   * An optional style override for the button text.
   */
  textStyle?: StyleProp<TextStyle>
  /**
   * An optional style override for the button text when in the "pressed" state.
   */
  pressedTextStyle?: StyleProp<TextStyle>
  /**
   * An optional style override for the button text when in the "disabled" state.
   */
  disabledTextStyle?: StyleProp<TextStyle>
  /**
   * One of the different types of button presets.
   */
  preset?: Presets
  /**
   * An optional component to render on the right side of the text.
   */
  RightAccessory?: ComponentType<ButtonAccessoryProps>
  /**
   * An optional component to render on the left side of the text.
   */
  LeftAccessory?: ComponentType<ButtonAccessoryProps>
  /**
   * Children components.
   */
  children?: React.ReactNode
  /**
   * disabled prop, accessed directly for declarative styling reasons.
   */
  disabled?: boolean
  /**
   * An optional style override for the disabled state
   */
  disabledStyle?: StyleProp<ViewStyle>
  /**
   * When true, shows a spinner instead of the text.
   */
  loading?: boolean
  /**
   * Optional loading spinner color override.
   * If not provided, defaults to tint for outline and whiteText for others.
   */
  loadingIndicatorColor?: string
}

export function Button(props: ButtonProps) {
  const {
    text,
    style: $viewStyleOverride,
    pressedStyle: $pressedViewStyleOverride,
    textStyle: $textStyleOverride,
    pressedTextStyle: $pressedTextStyleOverride,
    disabledTextStyle: $disabledTextStyleOverride,
    children,
    RightAccessory,
    LeftAccessory,
    disabled,
    disabledStyle: $disabledViewStyleOverride,
    loading,
    loadingIndicatorColor,
    onPress,
    ...rest
  } = props

  const { themed, theme } = useAppTheme()

  const handlePress = useCallback(
    (e: any) => {
      Keyboard.dismiss()
      if (!disabled) triggerHaptic()
      onPress?.(e)
    },
    [disabled, onPress],
  )

  const preset: Presets = props.preset ?? "default"
  const resolvedSpinnerColor =
    loadingIndicatorColor ??
    (preset === "outline" ? theme.colors.tint : theme.colors.whiteText)

  /**
   * Logic: Returns combined view styles based on interaction state.
   * Fixed for 0.83: Returns {} instead of false to avoid type errors.
   */
  function $viewStyle({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> {
    return [
      themed($viewPresets[preset]),
      $viewStyleOverride,
      pressed ? themed([$pressedViewPresets[preset], $pressedViewStyleOverride]) : {},
      disabled ? $disabledViewStyleOverride : {},
    ]
  }

  /**
   * Logic: Returns combined text styles based on interaction state.
   */
  function $textStyle({ pressed }: PressableStateCallbackType): StyleProp<TextStyle> {
    return [
      themed($textPresets[preset]),
      $textStyleOverride,
      pressed ? themed([$pressedTextPresets[preset], $pressedTextStyleOverride]) : {},
      disabled ? $disabledTextStyleOverride : {},
    ]
  }

  return (
    <Pressable
      style={$viewStyle}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      {...rest}
      onPress={handlePress}
      disabled={disabled}
    >
      {(state) => (
        <>
          {!!LeftAccessory && !loading && (
            <LeftAccessory style={themed($leftAccessoryStyle)} pressableState={state} disabled={disabled} />
          )}

          {loading ? (
            <ActivityIndicator size="small" color={resolvedSpinnerColor} />
          ) : (
            <Text text={text} style={$textStyle(state)}>
              {children}
            </Text>
          )}

          {!!RightAccessory && !loading && (
            <RightAccessory
              style={themed($rightAccessoryStyle)}
              pressableState={state}
              disabled={disabled}
            />
          )}
        </>
      )}
    </Pressable>
  )
}

const $baseViewStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 40,
  borderRadius: spacing.sm,
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
})

const $baseTextStyle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontSize: 14,
  lineHeight: 18,
  textAlign: "center",
  flexShrink: 1,
  flexGrow: 0,
  zIndex: 2,
  color: colors.whiteText,
})

const $rightAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginStart: spacing.xs,
  zIndex: 1,
})

const $leftAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginEnd: spacing.xs,
  zIndex: 1,
})

const $viewPresets: Record<Presets, ThemedStyleArray<ViewStyle>> = {
  default: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      borderWidth: 1,
      borderColor: colors.tint,
      backgroundColor: colors.tint,
    }),
  ],
  filled: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      backgroundColor: colors.tint,
      borderWidth: 1,
      borderColor: colors.tint,
    }),
  ],
  outline: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.tint,
    }),
  ],
}

const $textPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [$baseTextStyle],
  filled: [$baseTextStyle],
  outline: [$baseTextStyle, ({ colors }) => ({ color: colors.tint })],
}

const $pressedViewPresets: Record<Presets, ThemedStyle<ViewStyle>> = {
  default: ({ colors }) => ({
    backgroundColor: colors.tint,
    opacity: 0.8,
  }),
  filled: ({ colors }) => ({
    backgroundColor: colors.tint,
    opacity: 0.8,
  }),
  outline: ({ colors }) => ({
    backgroundColor: colors.tint,
    opacity: 0.1,
  }),
}

const $pressedTextPresets: Record<Presets, ThemedStyle<TextStyle>> = {
  default: () => ({ opacity: 1 }),
  filled: () => ({ opacity: 1 }),
  outline: () => ({ opacity: 0.7 }),
}