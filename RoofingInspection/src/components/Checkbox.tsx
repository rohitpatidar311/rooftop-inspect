import React, { useCallback, useEffect, useMemo, useRef } from "react"
import {
    Animated,
    Pressable,
    PressableStateCallbackType,
    StyleProp,
    TextStyle,
    View,
    ViewStyle,
} from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

import { Text } from "./Text"
import { useAppTheme } from "../theme/context"
import { ThemedStyle } from "../theme/types"

export interface CheckboxProps {
    /**
     * Whether the checkbox is checked.
     */
    checked: boolean
    /**
     * Callback when the checkbox is pressed.
     */
    onPress: () => void
    /**
     * Label text to show beside the checkbox.
     */
    label?: string
    /**
     * If true, renders an indeterminate state (minus icon).
     * Useful for "Select all" patterns.
     */
    indeterminate?: boolean

    /**
     * Optional style override for the outer container (row wrapper).
     */
    containerStyle?: StyleProp<ViewStyle>
    /**
     * Optional style override for the checkbox square.
     */
    checkboxStyle?: StyleProp<ViewStyle>
    /**
     * Optional style override for the label text.
     */
    labelStyle?: StyleProp<TextStyle>
    /**
     * Disables interaction when true.
     */
    disabled?: boolean
    /**
     * Size of the checkbox square. Defaults to 22.
     */
    size?: number

    /**
     * If true, toggles on press-in (touch down) instead of press (touch up).
     * Feels faster for table/checklist UIs.
     */
    activateOnPressIn?: boolean
}

/**
 * A themed, reusable Checkbox component.
 *
 * @example
 * <Checkbox checked={value} onPress={() => setValue(!value)} label="Remember me" />
 */
export function Checkbox(props: CheckboxProps) {
    const {
        checked,
        onPress,
        label,
        indeterminate = false,
        containerStyle,
        checkboxStyle,
        labelStyle,
        disabled = false,
        size = 22,
        activateOnPressIn = false,
    } = props

    const { themed, theme } = useAppTheme()

    const scale = useRef(new Animated.Value(1)).current

    const animateIn = useCallback(() => {
        if (disabled) return
        Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 22,
            bounciness: 6,
        }).start()
    }, [disabled, scale])

    const animateOut = useCallback(() => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 18,
            bounciness: 8,
        }).start()
    }, [scale])

    const handlePress = useCallback(() => {
        if (!disabled) {
            onPress()
        }
    }, [disabled, onPress])

    const handlePressIn = useCallback(() => {
        animateIn()
        if (activateOnPressIn && !disabled) onPress()
    }, [activateOnPressIn, animateIn, disabled, onPress])

    useEffect(() => {
        return () => {
            scale.setValue(1)
        }
    }, [scale])

    const squareSize: ViewStyle = {
        width: size,
        height: size,
        borderRadius: Math.max(4, Math.round(size * 0.2)),
    }

    const hitSlop = useMemo(() => ({ top: 10, bottom: 10, left: 14, right: 14 }), [])

    const active = checked || indeterminate
    const backgroundColor = active ? theme.colors.tint : "transparent"
    const borderColor = active ? theme.colors.tint : theme.colors.tintInactive
    const iconName = indeterminate ? "remove" : "checkmark"
    const iconSize = Math.max(12, Math.round(size * 0.78))

    const pressableStyle = useCallback(
        ({ pressed }: PressableStateCallbackType) => [
            themed($container),
            containerStyle,
            pressed && !disabled ? themed($containerPressed) : {},
            disabled ? themed($containerDisabled) : {},
        ],
        [themed, containerStyle, disabled],
    )

    return (
        <Pressable
            onPress={activateOnPressIn ? undefined : handlePress}
            onPressIn={handlePressIn}
            onPressOut={animateOut}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: indeterminate ? "mixed" : checked, disabled }}
            style={pressableStyle}
            disabled={disabled}
            hitSlop={hitSlop}
        >
            <Animated.View style={{ transform: [{ scale }] }}>
                <View
                    style={[
                        themed($box),
                        squareSize,
                        { backgroundColor, borderColor },
                        checkboxStyle,
                    ]}
                >
                    {active && (
                        <Icon
                            name={iconName}
                            size={iconSize}
                            color={theme.colors.whiteText}
                        />
                    )}
                </View>
            </Animated.View>

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
    paddingHorizontal: spacing.xxs,
})

const $containerPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
    opacity: 0.9,
    backgroundColor: colors.tint + "12",
    borderRadius: 10,
})

const $containerDisabled: ThemedStyle<ViewStyle> = () => ({
    opacity: 0.4,
})

const $box: ThemedStyle<ViewStyle> = () => ({
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
})

const $label: ThemedStyle<TextStyle> = ({ colors }) => ({
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
})

const $labelDisabled: ThemedStyle<TextStyle> = ({ colors }) => ({
    color: colors.textDim,
})

