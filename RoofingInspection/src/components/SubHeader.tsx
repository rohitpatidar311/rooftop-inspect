import React from "react"
import {
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
  Pressable,
  PressableStateCallbackType,
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Text } from "./Text"
import { useAppTheme } from "../theme/context"
import { triggerHaptic } from "../utils/haptics"
import { ThemedStyle } from "../theme/types"
import { $styles } from "../theme/styles"

export interface SubHeaderProps {
  /**
   * The text to display in the center.
   */
  title: string
  /**
   * Optional subtitle in small font (e.g. selected filter in brackets).
   */
  subtitle?: string
  /**
   * Optional style override for the container.
   */
  style?: StyleProp<ViewStyle>
  /**
   * Optional style override for the title text.
   */
  titleStyle?: StyleProp<TextStyle>
  /**
   * Action when back icon is pressed. If provided, back icon shows.
   */
  onBackPress?: () => void
  /**
   * Action when search icon is pressed. If provided, search icon shows.
   */
  onSearchPress?: () => void
  /**
   * Action when filter icon is pressed. If provided, filter icon shows.
   */
  onFilterPress?: () => void
  /**
   * When true, shows a dot badge on the filter icon (e.g. when a filter is active).
   */
  filterActive?: boolean
  /**
   * Custom right component if search/filter isn't enough.
   */
  RightActionComponent?: React.ReactNode
  /**
   * When true, adds top safe area padding so the header does not overlap the status bar.
   */
  safeAreaTop?: boolean
}

export function SubHeader(props: SubHeaderProps) {
  const {
    title,
    subtitle,
    style: $containerStyleOverride,
    titleStyle: $titleStyleOverride,
    onBackPress,
    onSearchPress,
    onFilterPress,
    filterActive,
    RightActionComponent,
    safeAreaTop,
  } = props

  const { themed, theme } = useAppTheme()
  const insets = useSafeAreaInsets()

  /**
   * Helper to render action icons with consistent pressing effect
   */
  const renderIcon = (
    name: string,
    onPress?: () => void,
    style?: StyleProp<ViewStyle>,
    withBadge?: boolean
  ) => {
    if (!onPress) return null

    return (
      <Pressable
        hitSlop={10}
        onPress={() => {
          triggerHaptic()
          onPress()
        }}
        style={({ pressed }: PressableStateCallbackType) => [
          themed($iconContainerStyle),
          style,
          pressed && { opacity: 0.7 },
        ]}
      >
        <Ionicons name={name} size={23} color={theme.colors.whiteText} />
        {withBadge ? <View style={themed($badgeDot)} /> : null}
      </Pressable>
    )
  }

  const containerSafeAreaStyle: ViewStyle = safeAreaTop
    ? {
        paddingTop: theme.spacing.sm + insets.top,
        paddingBottom: theme.spacing.sm,
        minHeight: 56 + insets.top,
      }
    : {}

  return (
    <View style={[themed($containerStyle), containerSafeAreaStyle, $containerStyleOverride]}>
      {/* Left Section: Back Button */}
      {onBackPress ? (
        <View style={themed($leftContainerStyle)}>
          {renderIcon("arrow-back-outline", onBackPress)}
        </View>
      ) : (
        <View style={{ width: 12 }} />
      )}

      {/* Center Section: Title (+ optional subtitle in small font) */}
      <View style={themed($centerContainerStyle)}>
        <View style={themed($titleRowStyle)}>
          <Text
            preset="subheading"
            text={title}
            style={[themed($titleTextStyle), $titleStyleOverride]}
            // numberOfLines={1}
          />
          {subtitle ? (
            <Text
              text={` ${subtitle}`}
              size="xxs"
              style={themed($subtitleTextStyle)}
              numberOfLines={1}
            />
          ) : null}
        </View>
      </View>

      {/* Right Section: Actions */}
      <View style={themed($rightContainerStyle)}>
        {RightActionComponent ? (
          RightActionComponent
        ) : (
          <>
            {renderIcon("search-outline", onSearchPress)}
            {renderIcon("filter-circle-outline", onFilterPress, { marginStart: 8 }, filterActive)}
          </>
        )}
      </View>
    </View>
  )
}

/**
 * Styles
 */
const $containerStyle: ThemedStyle<ViewStyle> = ({ spacing,colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.sm,
  minHeight: 56,
  backgroundColor:colors.tint
})

const $leftContainerStyle: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  alignItems: "flex-start",
})

const $centerContainerStyle: ThemedStyle<ViewStyle> = () => ({
  flex: 8,
})

const $titleRowStyle: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "baseline",
  flexWrap: "nowrap",
})

const $rightContainerStyle: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
})

const $iconContainerStyle: ThemedStyle<ViewStyle> = () => ({
  padding: 4,
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
})

const $badgeDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 2,
  right: 2,
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: colors.error,
})

const $titleTextStyle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontWeight: "600",
  fontSize: 16,
  color: colors.whiteText,
})

const $subtitleTextStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.whiteText,
  opacity: 0.9,
})