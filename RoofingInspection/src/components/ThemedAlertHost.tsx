import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Alert,
  AlertButton,
  AlertOptions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAppTheme } from "../theme/context"

type PendingAlert = {
  title: string
  message?: string
  buttons: AlertButton[]
  options?: AlertOptions
}

const defaultButton: AlertButton = { text: "OK" }

function normalizeButtons(buttons?: readonly AlertButton[]): AlertButton[] {
  if (!buttons || buttons.length === 0) return [defaultButton]
  return [...buttons]
}

/** Rightmost non-cancel, non-destructive action is treated as the primary affirmative (Android-style). */
function resolveAccentButtonIndex(buttons: AlertButton[]): number | null {
  const preferred = buttons.findIndex((b) => b.isPreferred && b.style !== "cancel")
  if (preferred >= 0) return preferred

  const neutral: number[] = []
  for (let i = 0; i < buttons.length; i++) {
    const s = buttons[i].style
    if (s !== "cancel" && s !== "destructive") neutral.push(i)
  }
  if (neutral.length === 0) return null
  if (neutral.length === 1) return neutral[0]
  return neutral[neutral.length - 1]
}

export function ThemedAlertHost() {
  const {
    theme: { colors, spacing, typography, isDark },
  } = useAppTheme()
  const insets = useSafeAreaInsets()
  const queueRef = useRef<PendingAlert[]>([])

  const [pendingAlert, setPendingAlert] = useState<PendingAlert | null>(null)

  const advance = useCallback(() => {
    setPendingAlert(() => {
      const next = queueRef.current.shift()
      return next ?? null
    })
  }, [])

  const styles = useMemo(() => {
    const fontTitle = typography.primary.bold
    const fontBody = typography.primary.normal
    const fontAction = typography.primary.semiBold

    return StyleSheet.create({
      overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        backgroundColor: isDark ? "rgba(0,0,0,0.62)" : colors.palette.overlay50,
      },
      card: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: colors.palette.cardColor,
        borderRadius: 16,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        ...Platform.select({
          ios: {
            shadowColor: colors.palette.neutral900,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: isDark ? 0.45 : 0.18,
            shadowRadius: 24,
          },
          android: { elevation: 6 },
          default: {},
        }),
      },
      title: {
        color: colors.text,
        fontSize: 18,
        lineHeight: 24,
        fontFamily: fontTitle,
        marginBottom: spacing.xs,
      },
      message: {
        color: colors.textDim,
        fontSize: 15,
        lineHeight: 22,
        fontFamily: fontBody,
        marginBottom: spacing.lg,
      },
      actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginHorizontal: -spacing.xxs,
      },
      actionBase: {
        minHeight: 44,
        minWidth: 88,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: spacing.xxs,
      },
      actionLabel: {
        fontSize: 15,
        fontFamily: fontAction,
        textAlign: "center",
      },
      secondaryFill: {
        backgroundColor: isDark ? colors.palette.neutral300 + "33" : colors.palette.neutral200,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
      },
      primaryFill: {
        backgroundColor: colors.tint,
        borderWidth: 0,
      },
      cancelGhost: {
        backgroundColor: "transparent",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
      },
      destructiveFill: {
        backgroundColor: colors.errorBackground,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.error + "55",
      },
      labelDefault: { color: colors.text },
      labelOnTint: { color: colors.whiteText },
      labelMuted: { color: colors.textDim },
      labelDanger: { color: colors.error },
    })
  }, [colors, spacing, typography, isDark])

  useEffect(() => {
    const originalAlert = Alert.alert

    Alert.alert = (title, message, buttons, options) => {
      const item: PendingAlert = {
        title: title ?? "",
        message,
        buttons: normalizeButtons(buttons),
        options,
      }
      setPendingAlert((current) => {
        if (current == null) return item
        queueRef.current.push(item)
        return current
      })
    }

    return () => {
      Alert.alert = originalAlert
      queueRef.current = []
    }
  }, [])

  const handleBackdropDismiss = () => {
    if (pendingAlert?.options?.cancelable === false) return
    pendingAlert?.options?.onDismiss?.()
    advance()
  }

  const handlePressButton = (button?: AlertButton) => {
    button?.onPress?.()
    advance()
  }

  const accentIndex = pendingAlert ? resolveAccentButtonIndex(pendingAlert.buttons) : null
  const titleText = pendingAlert?.title?.trim() ?? ""
  const showTitle = titleText.length > 0
  const messageText = pendingAlert?.message ? String(pendingAlert.message).trim() : ""
  const alertA11yLabel = [titleText, messageText].filter(Boolean).join(". ") || "Alert"

  return (
    <Modal
      visible={!!pendingAlert}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={handleBackdropDismiss}
    >
      <Pressable
        accessibilityViewIsModal
        importantForAccessibility="yes"
        style={[
          styles.overlay,
          {
            paddingTop: Math.max(insets.top, spacing.md),
            paddingBottom: Math.max(insets.bottom, spacing.md),
          },
        ]}
        onPress={handleBackdropDismiss}
      >
        <Pressable
          accessibilityRole="alert"
          accessibilityLabel={alertA11yLabel}
          accessibilityLiveRegion="polite"
          style={styles.card}
          onPress={(e) => e.stopPropagation()}
        >
          {showTitle ? <Text style={styles.title}>{titleText}</Text> : null}
          {!!messageText && <Text style={styles.message}>{String(pendingAlert?.message)}</Text>}
          <View style={styles.actions}>
            {(pendingAlert?.buttons ?? [defaultButton]).map((button, index) => {
              const isDestructive = button.style === "destructive"
              const isCancel = button.style === "cancel"
              const isAccent = accentIndex === index && !isDestructive && !isCancel

              const containerStyle = [
                styles.actionBase,
                isDestructive
                  ? styles.destructiveFill
                  : isCancel
                    ? styles.cancelGhost
                    : isAccent
                      ? styles.primaryFill
                      : styles.secondaryFill,
              ]

              const labelStyle = [
                styles.actionLabel,
                isDestructive
                  ? styles.labelDanger
                  : isCancel
                    ? styles.labelMuted
                    : isAccent
                      ? styles.labelOnTint
                      : styles.labelDefault,
              ]

              return (
                <Pressable
                  key={`${button.text ?? "action"}-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={button.text ?? "OK"}
                  android_ripple={
                    Platform.OS === "android"
                      ? { color: isAccent ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.12)" }
                      : undefined
                  }
                  style={({ pressed }) => [containerStyle, pressed && { opacity: 0.88 }]}
                  onPress={() => handlePressButton(button)}
                >
                  <Text style={labelStyle}>{button.text ?? "OK"}</Text>
                </Pressable>
              )
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
