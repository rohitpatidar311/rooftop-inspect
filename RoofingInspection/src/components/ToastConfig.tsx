import React from "react"
import { StyleSheet, View } from "react-native"
import { BaseToast } from "react-native-toast-message"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useAppTheme } from "../theme/context"

type ToastColorSet = {
  success: { bg: string; text: string; icon: "checkmark-circle" }
  error: { bg: string; text: string; icon: "close-circle" }
  info: { bg: string; text: string; icon: "information-circle" }
}

const TOAST_COLORS_LIGHT: Omit<ToastColorSet, "success"> = {
  error: { bg: "#fee2e2", text: "#b91c1c", icon: "close-circle" },
  info: { bg: "#fef2f2", text: "#991b1b", icon: "information-circle" },
}

const TOAST_COLORS_DARK: Omit<ToastColorSet, "success"> = {
  error: { bg: "#7f1d1d", text: "#fecaca", icon: "close-circle" },
  info: { bg: "#1e3a5f", text: "#bfdbfe", icon: "information-circle" },
}

const BORDER_RADIUS = 14
const ICON_SIZE = 22

type ToastProps = Parameters<typeof BaseToast>[0]

function makeToast(type: "success" | "error" | "info") {
  return function AstuteToast(props: ToastProps) {
    const { theme, themeContext } = useAppTheme()
    const colors: { bg: string; text: string; icon: "checkmark-circle" | "close-circle" | "information-circle" } =
      type === "success"
        ? { bg: theme.colors.tint, text: "#ffffff", icon: "checkmark-circle" }
        : themeContext === "dark"
          ? TOAST_COLORS_DARK[type]
          : TOAST_COLORS_LIGHT[type]
    return (
      <BaseToast
        {...props}
        text2NumberOfLines={4}
        style={[
          styles.base,
          { backgroundColor: colors.bg, borderLeftWidth: 0 },
          props.style,
        ]}
        contentContainerStyle={[styles.content, props.contentContainerStyle]}
        text1Style={[styles.text1, { color: colors.text }, props.text1Style]}
        text2Style={[styles.text2, { color: colors.text, opacity: 0.95 }, props.text2Style]}
        renderLeadingIcon={() => (
          <View style={styles.iconWrap}>
            <Ionicons name={colors.icon} size={ICON_SIZE} color={colors.text} />
          </View>
        )}
      />
    )
  }
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: BORDER_RADIUS,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 9999,
    zIndex: 9999,
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    flex: 1,
    justifyContent: "center",
  },
  iconWrap: {
    paddingLeft: 12,
    paddingRight: 6,
    justifyContent: "center",
  },
  text1: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 0,
  },
  text2: {
    fontSize: 14,
    lineHeight: 18,
  },
})

export const toastConfig = {
  success: makeToast("success"),
  error: makeToast("error"),
  info: makeToast("info"),
}
