import React, { useCallback } from "react"
import {
    Pressable,
    StyleProp,
    TextStyle,
    View,
    ViewStyle,
} from "react-native"

import { Text } from "./Text"
import { useAppTheme } from "../theme/context"
import { ThemedStyle } from "../theme/types"
import { triggerHaptic } from "../utils/haptics"

export interface RadioButtonProps {
    /**
     * Whether the radio button is selected.
     */
    selected: boolean
    /**
     * Callback when the radio button is pressed.
     */
    onPress: () => void
    /**
     * Label text to show beside the radio button.
     */
    label?: string

    /**
     * Optional style override for the outer container (row wrapper).
     */
    containerStyle?: StyleProp<ViewStyle>
    /**
     * Optional style override for the radio circle.
     */
    radioStyle?: StyleProp<ViewStyle>
    /**
     * Optional style override for the label text.
     */
    labelStyle?: StyleProp<TextStyle>
    /**
     * Disables interaction when true.
     */
    disabled?: boolean
    /**
     * Size of the radio button circle. Defaults to 22.
     */
    size?: number
}

/**
 * A themed, reusable RadioButton component.
 *
 * Uses the app tint color (`colors.tint`) for the selected state and
 * `colors.tintInactive` for the unselected ring — consistent with Button,
 * Toggle, and other primitives in the design system.
 *
 * @example
 * <RadioButton
 *   selected={value === "option1"}
 *   onPress={() => setValue("option1")}
 *   label="Option 1"
 * />
 */
export function RadioButton(props: RadioButtonProps) {
    const {
        selected,
        onPress,
        label,

        containerStyle,
        radioStyle,
        labelStyle,
        disabled = false,
        size = 22,
    } = props

    const { themed, theme } = useAppTheme()

    const handlePress = useCallback(() => {
        if (!disabled) {
            triggerHaptic()
            onPress()
        }
    }, [disabled, onPress])

    const outerSize: ViewStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
    }

    const innerSize: ViewStyle = {
        width: size * 0.48,
        height: size * 0.48,
        borderRadius: (size * 0.48) / 2,
    }

    return (
        <Pressable
            onPress={handlePress}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled }}
            style={({ pressed }) => [
                themed($container),
                containerStyle,
                pressed && !disabled ? themed($containerPressed) : {},
                disabled ? themed($containerDisabled) : {},
            ]}
            disabled={disabled}
        >
            {/* Radio Circle */}
            <View
                style={[
                    themed($outerCircle),
                    outerSize,
                    selected
                        ? { borderColor: theme.colors.tint }
                        : { borderColor: theme.colors.tintInactive },
                    radioStyle,
                ]}
            >
                {selected && (
                    <View
                        style={[
                            themed($innerCircle),
                            innerSize,
                            { backgroundColor: theme.colors.tint },
                        ]}
                    />
                )}
            </View>

            {/* Label */}
            {!!label && (
                <Text
                    text={label}
                    style={[
                        themed($label),
                        disabled ? themed($labelDisabled) : {},
                        labelStyle,
                    ]}
                />
            )}
        </Pressable>
    )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xxs,
})

const $containerPressed: ThemedStyle<ViewStyle> = () => ({
    opacity: 0.7,
})

const $containerDisabled: ThemedStyle<ViewStyle> = () => ({
    opacity: 0.4,
})

const $outerCircle: ThemedStyle<ViewStyle> = () => ({
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
})

const $innerCircle: ThemedStyle<ViewStyle> = () => ({
    // background applied inline from theme.colors.tint
})

const $label: ThemedStyle<TextStyle> = ({ colors }) => ({
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
})

const $labelDisabled: ThemedStyle<TextStyle> = ({ colors }) => ({
    color: colors.textDim,
})
