import { Platform, Vibration } from 'react-native'

/**
 * Trigger light haptic feedback on press.
 * Uses react-native-haptic-feedback when available; falls back to Vibration on iOS only
 * unless Android VIBRATE permission is granted via the manifest.
 */
export function triggerHaptic(): void {
  try {
    // Optional dependency — ignore if not installed.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const HapticFeedback = require('react-native-haptic-feedback').default
    HapticFeedback.trigger('impactLight', {
      enableVibrateFallback: false,
      ignoreAndroidSystemSettings: false,
    })
    return
  } catch {
    // fall through
  }

  try {
    // Android requires android.permission.VIBRATE in the manifest.
    Vibration.vibrate(Platform.OS === 'android' ? 15 : 10)
  } catch {
    // ignore — permission missing or haptics unsupported
  }
}
