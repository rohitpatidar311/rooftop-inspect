import React, { useEffect, useState } from "react"
import {
  StyleProp,
  TextInput,
  View,
  ViewStyle,
  Pressable,
  PressableStateCallbackType,
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useAppTheme } from "../theme/context"
import { ThemedStyle } from "../theme/types"
import { useDebouncedValue } from "../hooks/useDebouncedValue"

export interface SearchBarProps {
  /** Placeholder when input is empty */
  placeholder?: string
  /** Called with the debounced search query (after user stops typing for debounceMs) */
  onSearchChange?: (query: string) => void
  /** Called when the user presses the close button */
  onClose?: () => void
  /** Debounce delay in ms before onSearchChange is fired */
  debounceMs?: number
  /** Optional container style (e.g. for sticky positioning) */
  style?: StyleProp<ViewStyle>
  /** Optional style for the input wrapper */
  containerStyle?: StyleProp<ViewStyle>
}

/**
 * Reusable search bar with debounced onSearchChange and optional close button.
 * Renders a full-width bar suitable for placing below a subheader.
 */
export function SearchBar(props: SearchBarProps) {
  const {
    placeholder = "Search…",
    onSearchChange,
    onClose,
    debounceMs = 300,
    style: $styleOverride,
    containerStyle: $containerStyleOverride,
  } = props

  const { themed, theme } = useAppTheme()
  const [localValue, setLocalValue] = useState("")
  const debouncedQuery = useDebouncedValue(localValue, debounceMs)

  useEffect(() => {
    onSearchChange?.(debouncedQuery)
  }, [debouncedQuery, onSearchChange])

  return (
    <View style={[themed($containerStyle), $styleOverride]}>
      <View style={themed($inputRow)}>
        <Ionicons
          name="search-outline"
          size={20}
          color={theme.colors.textDim}
          style={themed($searchIcon)}
        />
        <TextInput
          value={localValue}
          onChangeText={setLocalValue}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textDim}
          style={themed($input)}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          autoFocus
        />
        {onClose ? (
          <Pressable
            hitSlop={10}
            onPress={onClose}
            style={({ pressed }: PressableStateCallbackType) => [
              themed($closeButton),
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="close-circle" size={20} color={theme.colors.textDim} />
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

const $containerStyle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $inputRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette?.inputColor,
  borderRadius: spacing.xs,
  borderWidth: 1,
  borderColor: colors.palette?.neutral400 ?? colors.border,
  paddingHorizontal: spacing.sm,
  minHeight: 44,
})

const $searchIcon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginEnd: spacing.xs,
})

const $input: ThemedStyle<ViewStyle> = ({ colors, typography }) => ({
  flex: 1,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  color: colors.text,
  paddingVertical: 10,
  paddingHorizontal: 0,
})

const $closeButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
  justifyContent: "center",
  alignItems: "center",
})
