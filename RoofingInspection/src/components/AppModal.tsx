import React, { useCallback, useEffect, useState } from "react"
import {
    Modal,
    View,
    TouchableOpacity,
    ScrollView,
    Pressable,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    StyleProp,
    StyleSheet,
} from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

import { useAppTheme } from "../theme/context"
import { ThemedStyle } from "../theme/types"
import { Text } from "./Text"
import { Button } from "./Button"

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface AppModalProps {
    /** Controls visibility */
    isVisible: boolean
    /** Called when the modal should close (backdrop tap, cancel, X) */
    onClose: () => void

    // ── Header ──
    /** Optional title rendered at the top */
    title?: string
    /** Show an X close button in the top-right corner (default: false) */
    showCloseButton?: boolean

    // ── Footer buttons ──
    /**
     * Text for the primary / confirm button.
     * Omit (or set to undefined) to hide the button entirely.
     * @default "OK"
     */
    okButtonText?: string | null
    /**
     * Text for the secondary / cancel button.
     * Omit (or set to undefined) to hide the button entirely.
     */
    cancelButtonText?: string | null
    /**
     * Optional badge count displayed on the OK button (e.g. number of selected items).
     * When 0 or undefined, no badge is shown.
     */
    okBadgeCount?: number

    // ── Behaviour ──
    /**
     * Called when the primary button is pressed.
     * - Return `false` to keep the modal open (e.g. validation failed).
     * - Return `true` / `void` to close automatically.
     */
    onConfirm?: () => Promise<boolean | void> | boolean | void
    /** Called when the cancel button or X button is pressed. Falls back to onClose. */
    onCancelPress?: () => void
    /** Tap the backdrop to close (default: true). Disabled while loading. */
    closeOnBackdropPress?: boolean
    /** Show a spinner on the primary button and disable all interactions */
    isLoading?: boolean

    // ── Content ──
    children?: React.ReactNode
    /** Extra style for the modal card */
    containerStyle?: StyleProp<ViewStyle>
    /** Extra style for the scrollable content area */
    contentStyle?: StyleProp<ViewStyle>
    /** Native modal animation type. Default `none` to avoid header flicker. */
    animationType?: "none" | "slide" | "fade"
    /**
     * When true, show modal shell first and render heavy body content on next frame.
     * Helps perceived open speed for large datasets.
     * @default true
     */
    deferBodyRender?: boolean
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export const AppModal = ({
    isVisible,
    onClose,
    title,
    showCloseButton = false,
    okButtonText = "OK",
    cancelButtonText,
    okBadgeCount,
    onConfirm,
    onCancelPress,
    closeOnBackdropPress = true,
    isLoading = false,
    children,
    containerStyle,
    contentStyle,
    animationType = "none",
    deferBodyRender = true,
}: AppModalProps) => {
    const { theme, themed } = useAppTheme()
    const [isBodyReady, setIsBodyReady] = useState(!deferBodyRender)

    useEffect(() => {
        if (!isVisible) {
            setIsBodyReady(!deferBodyRender)
            return
        }
        if (!deferBodyRender) {
            setIsBodyReady(true)
            return
        }
        setIsBodyReady(false)
    }, [isVisible, deferBodyRender])

    const handleModalShow = useCallback(() => {
        if (!deferBodyRender) return
        requestAnimationFrame(() => setIsBodyReady(true))
    }, [deferBodyRender])

    const handleBackdropPress = () => {
        if (isLoading) return
        if (closeOnBackdropPress) onClose()
    }

    const handleCancel = () => {
        if (onCancelPress) onCancelPress()
        else onClose()
    }

    const handleConfirm = async () => {
        if (onConfirm) {
            const result = await onConfirm()
            // Only auto-close when confirmation succeeds (true or void)
            if (result !== false) onClose()
        } else {
            onClose()
        }
    }

    const hasFooter = okButtonText != null || cancelButtonText != null

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType={animationType}
            presentationStyle="overFullScreen"
            statusBarTranslucent
            hardwareAccelerated
            onShow={handleModalShow}
            onRequestClose={onClose}
        >
            {/*
              Full-screen backdrop + separate centered layer avoids a one-frame layout
              where the card flashes at the top-left (nested Pressable + flex center).
            */}
            <View style={themed($modalRoot)} collapsable={false}>
                <Pressable
                    style={themed($backdrop)}
                    onPress={handleBackdropPress}
                    accessibilityRole="button"
                    accessibilityLabel="Close dialog"
                />
                <View style={themed($centerLayer)} pointerEvents="box-none">
                    <View style={[themed($container), containerStyle]}>

                        {/* ── Header ─────────────────────────────────────────── */}
                        {(title || showCloseButton) && (
                            <View style={themed($header)}>
                                {/* Left spacer to keep title centred when close btn visible */}
                                {showCloseButton && <View style={$iconPlaceholder} />}

                                {title ? (
                                    <Text style={themed($title)} weight="bold" size="md" numberOfLines={1}>
                                        {title}
                                    </Text>
                                ) : (
                                    <View style={{ flex: 1 }} />
                                )}

                                {showCloseButton ? (
                                    <TouchableOpacity
                                        onPress={onClose}
                                        disabled={isLoading}
                                        style={$closeBtn}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Icon name="close" size={22} color={theme.colors.textDim} />
                                    </TouchableOpacity>
                                ) : (
                                    /* Balance the row if no close button */
                                    title && <View style={$iconPlaceholder} />
                                )}
                            </View>
                        )}

                        {/* ── Body ───────────────────────────────────────────── */}
                        {children && isBodyReady && (
                            <ScrollView
                                style={[themed($scrollArea), contentStyle]}
                                contentContainerStyle={themed($scrollContent)}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                {children}
                            </ScrollView>
                        )}
                        {children && !isBodyReady && (
                            <View style={themed($bodyLoadingWrap)}>
                                <ActivityIndicator color={theme.colors.tint} />
                            </View>
                        )}

                        {/* ── Footer ─────────────────────────────────────────── */}
                        {hasFooter && (
                            <View style={themed($footer)}>
                                {cancelButtonText != null && (
                                    <>
                                        <Button
                                            preset="default"
                                            style={themed($footerBtn)}
                                            textStyle={themed($cancelText)}
                                            pressedStyle={{ backgroundColor: theme.colors.palette.overlay20 }}
                                            onPress={handleCancel}
                                            disabled={isLoading}
                                            text={cancelButtonText.toUpperCase()}
                                        />
                                        <View style={themed($divider)} />
                                    </>
                                )}

                                {okButtonText != null && (
                                    <Button
                                        preset="default"
                                        style={themed($footerBtn)}
                                        textStyle={themed($okText)}
                                        pressedStyle={{ backgroundColor: theme.colors.palette.overlay20 }}
                                        onPress={handleConfirm}
                                        disabled={isLoading}
                                        RightAccessory={
                                            okBadgeCount && okBadgeCount > 0
                                                ? ({ style }) => (
                                                    <View style={[themed($okBadge), style]}>
                                                        <Text
                                                            text={String(okBadgeCount)}
                                                            size="xxs"
                                                            style={themed($okBadgeText)}
                                                        />
                                                    </View>
                                                )
                                                : undefined
                                        }
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color={theme.colors.tint} />
                                        ) : (
                                            okButtonText.toUpperCase()
                                        )}
                                    </Button>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    )
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const $modalRoot: ThemedStyle<ViewStyle> = () => ({
    flex: 1,
})

const $backdrop: ThemedStyle<ViewStyle> = ({ colors }) => ({
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.palette.overlay50,
})

const $centerLayer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
})

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
    backgroundColor: colors.palette.cardColor,
    borderRadius: 14,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
})

const $title: ThemedStyle<TextStyle> = () => ({
    flex: 1,
    textAlign: "center",
})

const $iconPlaceholder: ViewStyle = { width: 30 }

const $closeBtn: ViewStyle = {
    width: 30,
    alignItems: "flex-end",
}

const $scrollArea: ThemedStyle<ViewStyle> = () => ({
    flexGrow: 0,
    maxHeight: 400,
})

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
})

const $bodyLoadingWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
})

const $footer: ThemedStyle<ViewStyle> = ({ colors }) => ({
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.separator,
})

const $footerBtn: ThemedStyle<ViewStyle> = ({ spacing }) => ({
    flex: 1,
    minHeight: 48,
    borderWidth: 0,
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingVertical: spacing.sm,
})

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
    width: 1,
    backgroundColor: colors.separator,
    marginVertical: 10,
})

const $baseText: ThemedStyle<TextStyle> = ({ typography }) => ({
    fontSize: 15,
    fontFamily: typography.primary.bold,
    letterSpacing: 0.5,
})

const $cancelText: ThemedStyle<TextStyle> = (theme) => ({
    ...$baseText(theme),
    color: theme.colors.textDim,
})

const $okText: ThemedStyle<TextStyle> = (theme) => ({
    ...$baseText(theme),
    color: theme.colors.tint,
})

const $okBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
    minWidth: 18,
    paddingHorizontal: spacing.xxs,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: colors.palette.overlay20,
    borderWidth: 1,
    borderColor: colors.tint,
    alignItems: "center",
    justifyContent: "center",
})

const $okBadgeText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
    color: colors.tint,
    fontSize: 10,
    fontFamily: typography.primary.bold,
}) 
