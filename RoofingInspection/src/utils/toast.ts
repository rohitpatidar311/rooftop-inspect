import Toast from "react-native-toast-message"

export type ToastType = "success" | "error" | "info"

interface ShowToastOptions {
  type?: ToastType
  title?: string
  message: string
  position?: "top" | "bottom"
  autoHide?: boolean
  visibilityTime?: number
}

/**
 * Shows a toast message anywhere in the app.
 * @param options Toast options
 */
export function showToast({
  type = "info",
  // title,
  message,
  position = "bottom",
  autoHide = true,
  visibilityTime = 3000,
}: ShowToastOptions) {
  Toast.show({
    type,
    // text1: title,
    text2: message,
    position,
    autoHide,
    visibilityTime,
  })
}
