import React, { ReactNode, forwardRef, ForwardedRef } from "react"
import { 
  StyleProp, 
  Text as RNText, 
  TextProps as RNTextProps, 
  TextStyle,
  I18nManager, 
} from "react-native"
import { useAppTheme } from "../theme/context"
import { ThemedStyle, ThemedStyleArray } from "../theme/types"

// 1. Define Sizes and Presets
type Sizes = keyof typeof $sizeStyles
type Presets = "default" | "bold" | "heading" | "subheading" | "formLabel" | "formHelper"

export interface TextProps extends RNTextProps {
  /**
   * The text to display if not using nested components.
   */
  text?: string
  /**
   * One of the different types of text presets.
   */
  preset?: Presets
  /**
   * Flexible weight modifier (e.g., '700', 'bold', or custom font suffix)
   */
  weight?: TextStyle["fontWeight"] | string
  /**
   * Text size modifier.
   */
  size?: Sizes
  /**
   * Shows a red asterisk if true.
   */
  required?: boolean
  /**
   * Children components.
   */
  children?: ReactNode
  /**
   * Optional style override.
   */
  style?: StyleProp<TextStyle>
}

/**
 * Custom Text Component for RN CLI 0.83
 */
export const Text = forwardRef(function Text(props: TextProps, ref: ForwardedRef<RNText>) {
  const { 
    weight, 
    size, 
    text, 
    children, 
    style: $styleOverride, 
    required, 
    preset = "default", 
    ...rest 
  } = props
  
  const { themed, theme } = useAppTheme()

  // Logic: Content is either the text prop or children
  const content = text || children

  // Map weight to theme fontFamily so custom font applies (fontWeight alone often ignores fontFamily on RN)
  const weightStyle = weight
    ? themed((theme) => {
        const w = String(weight).toLowerCase()
        if (w === "bold" || w === "700") return { fontFamily: theme.typography.primary.bold }
        if (w === "semibold" || w === "semi_bold" || w === "600") return { fontFamily: theme.typography.primary.semiBold }
        return { fontWeight: weight as TextStyle["fontWeight"] }
      })
    : undefined

  const $styles: StyleProp<TextStyle> = [
    $rtlStyle,
    themed($presets[preset]),
    size && $sizeStyles[size],
    weightStyle,
    $styleOverride,
  ]

  return (
    <RNText {...rest} style={$styles} ref={ref}>
      {content}
      {required && (
        <RNText style={{ color: theme.colors.error }}> *</RNText>
      )}
    </RNText>
  )
})

// --- Styles ---

const $sizeStyles = {
  xxl: { fontSize: 36, lineHeight: 44 } satisfies TextStyle,
  xl: { fontSize: 24, lineHeight: 34 } satisfies TextStyle,
  lg: { fontSize: 20, lineHeight: 32 } satisfies TextStyle,
  md: { fontSize: 18, lineHeight: 26 } satisfies TextStyle,
  sm: { fontSize: 16, lineHeight: 24 } satisfies TextStyle,
  xs: { fontSize: 14, lineHeight: 21 } satisfies TextStyle,
  xxs: { fontSize: 12, lineHeight: 18 } satisfies TextStyle,
}

const $baseStyle: ThemedStyle<TextStyle> = (theme) => ({
  ...$sizeStyles.sm,
  color: theme.colors.text,
  fontFamily: theme.typography.primary.normal, 
})

const $presets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [$baseStyle],
  bold: [
    $baseStyle, 
    (theme) => ({ fontFamily: theme.typography.primary.bold })
  ],
  heading: [
    $baseStyle,
    (theme) => ({
      ...$sizeStyles.xxl,
      fontFamily: theme.typography.primary.bold,
    }),
  ],
  subheading: [
    $baseStyle, 
    (theme) => ({ 
        ...$sizeStyles.lg, 
        fontFamily: theme.typography.primary.semiBold 
    })
  ],
  formLabel: [
    $baseStyle, 
    (theme) => ({ fontFamily: theme.typography.primary.semiBold })
  ],
  formHelper: [
    $baseStyle, 
    { ...$sizeStyles.xs }
  ],
}

const $rtlStyle: TextStyle = I18nManager.isRTL ? { writingDirection: "rtl" } : {}