import { StatusBar, Platform } from "react-native"
import type { Theme } from "./types"

/**
 * Updates the native StatusBar to match the theme.
 * This is the standard React Native CLI way to handle imperative theming.
 */
export const setImperativeTheming = (theme: Theme) => {
  // Set the text color of the status bar (battery, clock, etc.)
  StatusBar.setBarStyle(theme.isDark ? "light-content" : "dark-content", true)

  // On Android, we can also set the background color of the bar
  if (Platform.OS === "android") {
    StatusBar.setBackgroundColor(theme.colors.palette.neutral100, true)
  }
}