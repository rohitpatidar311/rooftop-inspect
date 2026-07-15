import React, { ComponentType, forwardRef, Ref, useImperativeHandle, useRef, useState } from "react"
import {
  ImageStyle,
  NativeSyntheticEvent,
  StyleProp,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  I18nManager,
} from "react-native"

import { Text, TextProps } from "./Text"
import { useAppTheme } from "../theme/context"
import { Theme, ThemedStyle, ThemedStyleArray } from "../theme/types"
import { $styles } from "../theme/styles"

export interface TextFieldAccessoryProps {
  style: StyleProp<ViewStyle | TextStyle | ImageStyle>
  status: TextFieldProps["status"]
  multiline: boolean
  editable: boolean
}

export interface TextFieldProps extends Omit<TextInputProps, "ref"> {
  status?: "error" | "disabled"
  label?: string
  LabelTextProps?: TextProps
  helper?: string
  HelperTextProps?: TextProps
  style?: StyleProp<TextStyle>
  containerStyle?: StyleProp<ViewStyle>
  inputWrapperStyle?: StyleProp<ViewStyle>
  RightAccessory?: ComponentType<TextFieldAccessoryProps>
  LeftAccessory?: ComponentType<TextFieldAccessoryProps>
  required?: boolean
}

export const TextField = forwardRef(function TextField(props: TextFieldProps, ref: Ref<TextInput>) {
  const {
    label,
    placeholder,
    helper,
    status,
    RightAccessory,
    LeftAccessory,
    HelperTextProps,
    LabelTextProps,
    style: $inputStyleOverride,
    containerStyle: $containerStyleOverride,
    inputWrapperStyle: $inputWrapperStyleOverride,
    onFocus,
    onBlur,
    required,
    ...restProps // Renamed from TextInputProps to avoid confusion with the Type
  } = props

  const input = useRef<TextInput>(null)
  const [isFocused, setIsFocused] = useState(false)

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const disabled = restProps.editable === false || status === "disabled"

  /**
   * FIX: We type the handlers as the specific prop types from TextInput.
   * This solves the "No overload matches" error by aligning with RN's internal expectations.
   */
  const handleFocus: TextInputProps["onFocus"] = (e) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur: TextInputProps["onBlur"] = (e) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const $inputWrapperStyles: ThemedStyleArray<ViewStyle> = [
    $styles.row,
    $inputWrapperStyle,
    (t: Theme) => (isFocused ? { borderColor: t.colors.tint, borderWidth: 1 } : {}),
    (t: Theme) => (status === "error" ? { borderColor: t.colors.error } : {}),
    (t: Theme) => (disabled ? { backgroundColor: t.colors.palette.neutral200, borderColor: t.colors.border, opacity: 0.85 } : {}),
    restProps.multiline ? { minHeight: 112 } : {},
    LeftAccessory ? { paddingStart: 0 } : {},
    RightAccessory ? { paddingEnd: 0 } : {},
    $inputWrapperStyleOverride,
  ]

  const $inputStyles: ThemedStyleArray<TextStyle> = [
    $inputStyle,
    disabled ? { color: colors.textDim, opacity: 0.9 } : {},
    I18nManager.isRTL ? { textAlign: "right" as TextStyle["textAlign"] } : {},
    restProps.multiline ? { height: "auto" } : {},
    $inputStyleOverride,
  ]

  const $helperStyles: ThemedStyleArray<TextStyle> = [
    $helperStyle,
    (t: Theme) => (status === "error" ? { color: t.colors.error } : {}),
    HelperTextProps?.style,
  ]

  function focusInput() {
    if (disabled) return
    input.current?.focus()
  }

  useImperativeHandle(ref, () => input.current as TextInput)

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={$containerStyleOverride}
      onPress={focusInput}
      accessibilityState={{ disabled }}
    >
      {!!label && (
        <View style={$styles.row}>
          <Text
            preset="formLabel"
            text={label}
            {...LabelTextProps}
            weight="semiBold"
            style={themed([$labelStyle, LabelTextProps?.style])}
          />
          {required && (
            <Text
              text=" *"
              style={{ color: colors.error, fontSize: 14 }}
            />
          )}
        </View>
      )}

      <View style={themed($inputWrapperStyles)}>
        {!!LeftAccessory && (
          <LeftAccessory
            style={themed($leftAccessoryStyle)}
            status={status}
            editable={!disabled}
            multiline={restProps.multiline ?? false}
          />
        )}

        <TextInput
          ref={input}
          underlineColorAndroid="transparent"
          textAlignVertical={restProps.multiline ? "top" : "center"}
          placeholder={placeholder}
          placeholderTextColor={colors.textDim}
          {...restProps}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={themed($inputStyles)}
        />

        {!!RightAccessory && (
          <RightAccessory
            style={themed($rightAccessoryStyle)}
            status={status}
            editable={!disabled}
            multiline={restProps.multiline ?? false}
          />
        )}
      </View>

      {!!helper && (
        <Text
          preset="formHelper"
          text={helper}
          size="xxs"
          {...HelperTextProps}
          style={themed($helperStyles)}
        />
      )}
    </TouchableOpacity>
  )
})

const $labelStyle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $inputWrapperStyle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignItems: "flex-start",
  borderWidth: 1,
  borderRadius: spacing.xs,
  backgroundColor: colors.palette.inputColor,
  borderColor: colors.palette.neutral400,
  overflow: "hidden",
})

const $inputStyle: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  flex: 1,
  alignSelf: "stretch",
  fontFamily: typography.primary.normal,
  color: colors.text,
  fontSize: 14,
  height: 24,
  paddingVertical: 0,
  paddingHorizontal: 0,
  marginVertical: spacing.xs,
  marginHorizontal: spacing.sm,
})

const $helperStyle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.xxs,
})

const $rightAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginEnd: spacing.xs,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
})

const $leftAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginStart: spacing.xs,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
})