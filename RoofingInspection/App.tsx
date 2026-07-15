/**
 * Roofing Inspection — app entry
 * @format
 */

import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { Provider } from 'react-redux'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { ErrorBoundary } from './src/screens/ErrorBoundary'
import { store } from './src/redux/store'
import { AuthProvider } from './src/context/AuthContext'
import { ThemeProvider } from './src/theme/context'
import RootNavigator from './src/navigators/RootNavigator'
import { toastConfig } from './src/components/ToastConfig'
import { ThemedAlertHost } from './src/components/ThemedAlertHost'
import { NetworkBanner } from './src/components/NetworkBanner'

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ErrorBoundary>
          <Provider store={store}>
            <AuthProvider>
              <ThemeProvider>
                <KeyboardProvider>
                  <BottomSheetModalProvider>
                    <RootNavigator />
                    <ThemedAlertHost />
                    <NetworkBanner />
                  </BottomSheetModalProvider>
                  <Toast config={toastConfig} />
                </KeyboardProvider>
              </ThemeProvider>
            </AuthProvider>
          </Provider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

export default App
