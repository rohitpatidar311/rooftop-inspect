import { useEffect, useState } from "react"
import { AppState } from "react-native"

/**
 * True while the app is in the foreground (`AppState === "active"`).
 *
 * Every VisionCamera `isActive` must AND this in (alongside `useIsFocused()`).
 * Without it the capture session is held while the app is backgrounded:
 * Android kills it with `system/camera-is-restricted` on return, and iOS
 * re-opens with a black or colour-corrupted preview because the interrupted
 * AVCaptureSession is never re-acquired (isActive never toggles off→on).
 */
export function useIsForeground(): boolean {
  const [isForeground, setIsForeground] = useState(
    () => AppState.currentState === "active",
  )

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      setIsForeground(state === "active")
    })
    return () => sub.remove()
  }, [])

  return isForeground
}