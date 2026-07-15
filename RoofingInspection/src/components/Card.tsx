import React, { ComponentType, Fragment, ReactElement, useCallback } from "react"
import {
  StyleProp,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
  ViewStyle,
} from "react-native"

import { Text, TextProps } from "./Text"
import { useAppTheme } from "../theme/context"
import { triggerHaptic } from "../utils/haptics"
import { ThemedStyle, ThemedStyleArray } from "../theme/types"
import { $styles } from "../theme/styles"

type Presets = "default" | "reversed"

interface CardProps extends TouchableOpacityProps {
  /**
   * One of the different types of text presets.
   */
  preset?: Presets
  /**
   * How the content should be aligned vertically.
   */
  verticalAlignment?: "top" | "center" | "space-between" | "force-footer-bottom"
  /**
   * Custom component added to the left of the card body.
   */
  LeftComponent?: ReactElement
  /**
   * Custom component added to the right of the card body.
   */
  RightComponent?: ReactElement
  /**
   * The heading text to display.
   */
  heading?: string
  /**
   * Style overrides for heading text.
   */
  headingStyle?: StyleProp<TextStyle>
  /**
   * Pass any additional props directly to the heading Text component.
   */
  HeadingTextProps?: TextProps
  /**
   * Custom heading component. Overrides heading prop.
   */
  HeadingComponent?: ReactElement
  /**
   * The content text to display.
   */
  content?: string
  /**
   * Style overrides for content text.
   */
  contentStyle?: StyleProp<TextStyle>
  /**
   * Pass any additional props directly to the content Text component.
   */
  ContentTextProps?: TextProps
  /**
   * Custom content component. Overrides content prop.
   */
  ContentComponent?: ReactElement
  /**
   * The footer text to display.
   */
  footer?: string
  /**
   * Style overrides for footer text.
   */
  footerStyle?: StyleProp<TextStyle>
  /**
   * Pass any additional props directly to the footer Text component.
   */
  FooterTextProps?: TextProps
  /**
   * Custom footer component. Overrides footer prop.
   */
  FooterComponent?: ReactElement
}

export function Card(props: CardProps) {
  const {
    content,
    footer,
    heading,
    ContentComponent,
    HeadingComponent,
    FooterComponent,
    LeftComponent,
    RightComponent,
    verticalAlignment = "top",
    style: $containerStyleOverride,
    contentStyle: $contentStyleOverride,
    headingStyle: $headingStyleOverride,
    footerStyle: $footerStyleOverride,
    ContentTextProps,
    HeadingTextProps,
    FooterTextProps,
    onPress,
    ...WrapperProps
  } = props

  const {
    themed,
    theme: { spacing },
  } = useAppTheme()

  const handlePress = useCallback(
    (e: any) => {
      triggerHaptic()
      onPress?.(e)
    },
    [onPress],
  )

  const preset: Presets = props.preset ?? "default"
  const isPressable = !!onPress
  const isHeadingPresent = !!(HeadingComponent || heading)
  const isContentPresent = !!(ContentComponent || content)
  const isFooterPresent = !!(FooterComponent || footer)

  const Wrapper = (isPressable ? TouchableOpacity : View) as ComponentType<
    TouchableOpacityProps | ViewProps
  >
  const HeaderContentWrapper = verticalAlignment === "force-footer-bottom" ? View : Fragment

  const $containerStyle = [
    themed($containerPresets[preset]),
    $containerStyleOverride,
  ]

  const $headingStyle = [
    themed($headingPresets[preset]),
    (isFooterPresent || isContentPresent) ? { marginBottom: spacing.xxxs } : {},
    $headingStyleOverride,
    HeadingTextProps?.style,
  ]

  const $contentStyle = [
    themed($contentPresets[preset]),
    isHeadingPresent ? { marginTop: spacing.xxxs } : {},
    isFooterPresent ? { marginBottom: spacing.xxxs } : {},
    $contentStyleOverride,
    ContentTextProps?.style,
  ]

  const $footerStyle = [
    themed($footerPresets[preset]),
    (isHeadingPresent || isContentPresent) ? { marginTop: spacing.xxxs } : {},
    $footerStyleOverride,
    FooterTextProps?.style,
  ]

  const $alignmentWrapperStyle = [
    $alignmentWrapper,
    { justifyContent: $alignmentWrapperFlexOptions[verticalAlignment] },
    LeftComponent ? { marginStart: spacing.md } : {},
    RightComponent ? { marginEnd: spacing.md } : {},
  ]

  return (
    <Wrapper
      style={$containerStyle}
      activeOpacity={0.8}
      accessibilityRole={isPressable ? "button" : undefined}
      {...WrapperProps}
      onPress={isPressable ? handlePress : undefined}
    >
      {LeftComponent}

      <View style={$alignmentWrapperStyle}>
        <HeaderContentWrapper>
          {HeadingComponent ||
            (isHeadingPresent && (
              <Text
                weight="bold"
                text={heading}
                {...HeadingTextProps}
                style={$headingStyle}
              />
            ))}

          {ContentComponent ||
            (isContentPresent && (
              <Text
                weight="normal"
                text={content}
                {...ContentTextProps}
                style={$contentStyle}
              />
            ))}
        </HeaderContentWrapper>

        {FooterComponent ||
          (isFooterPresent && (
            <Text
              weight="normal"
              size="xs"
              text={footer}
              {...FooterTextProps}
              style={$footerStyle}
            />
          ))}
      </View>

      {RightComponent}
    </Wrapper>
  )
}

const $containerBase: ThemedStyle<ViewStyle> = (theme) => ({
  borderRadius: theme.spacing.md,
  padding: theme.spacing.xs,
  borderColor: "#ffffff26",
  borderWidth: 0.5,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 8,
  elevation: 6,
})

const $alignmentWrapper: ViewStyle = {
  flex: 1,
  alignSelf: "stretch",
}

const $alignmentWrapperFlexOptions = {
  top: "flex-start",
  center: "center",
  "space-between": "space-between",
  "force-footer-bottom": "space-between",
} as const

const $containerPresets: Record<Presets, ThemedStyleArray<ViewStyle>> = {
  default: [
    $styles.row,
    $containerBase,
    (theme) => ({
      backgroundColor: theme.colors.palette.cardColor,
      borderColor: theme.colors.palette.neutral300,
    }),
  ],
  reversed: [
    $styles.row,
    $containerBase,
    (theme) => ({
      backgroundColor: theme.colors.palette.cardColor,
      borderColor: theme.colors.palette.neutral300,
    }),
  ],
}

const $headingPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [],
  reversed: [(theme) => ({ color: theme.colors.palette.neutral100 })],
}

const $contentPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [],
  reversed: [(theme) => ({ color: theme.colors.palette.neutral100 })],
}

const $footerPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [],
  reversed: [(theme) => ({ color: theme.colors.palette.neutral100 })],
}