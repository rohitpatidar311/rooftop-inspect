import { useEffect, useRef } from "react"
import { BackHandler, Platform } from "react-native"
import {
  createNavigationContainerRef,
  type NavigationState,
  type PartialState,
} from "@react-navigation/native"
import type { RootStackParamList } from "./navigatorTypes"

/**
 * Reference to the root navigation container.
 * Attach to NavigationContainer via ref={navigationRef}.
 * Use for navigating or reading state without the navigation prop.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>()

/**
 * Gets the current (leaf) screen name from any navigation state.
 */
export function getActiveRouteName(
  state: NavigationState | PartialState<NavigationState> | undefined,
): string {
  if (!state) return ""
  const route = state.routes[state.index ?? 0]
  if (!route.state) return route.name
  return getActiveRouteName(route.state as NavigationState)
}

/**
 * Handles Android back button:
 * - On exit routes: calls onRequestExit (e.g. show "Are you sure?" bottom sheet).
 * - Otherwise: goBack() if possible.
 * Call once at the root (e.g. RootNavigator). Pass exitRoutes and when back is pressed
 * on one of those routes, onRequestExit is called instead of exiting immediately.
 */
export function useBackButtonHandler(
  exitRoutes: string[],
  onRequestExit: () => void,
) {
  const exitRoutesRef = useRef(exitRoutes)
  const onRequestExitRef = useRef(onRequestExit)

  useEffect(() => {
    exitRoutesRef.current = exitRoutes
    onRequestExitRef.current = onRequestExit
  }, [exitRoutes, onRequestExit])

  useEffect(() => {
    if (Platform.OS !== "android") return undefined

    const onBackPress = () => {
      const ref = navigationRef.current
      if (!ref?.isReady()) return false

      const rootState = ref.getRootState()
      const routeName = getActiveRouteName(rootState)
      const isExitRoute = exitRoutesRef.current.includes(routeName)

      if (isExitRoute) {
        onRequestExitRef.current()
        return true
      }

      if (ref.canGoBack()) {
        ref.goBack()
        return true
      }

      return false
    }

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress)
    return () => subscription.remove()
  }, [])
}
