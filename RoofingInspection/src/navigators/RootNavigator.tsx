import React, { useEffect, useRef, useState } from 'react'
import { BackHandler, View, ViewStyle, TextStyle } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { RootStackParamList } from './navigatorTypes'
import { useAppTheme } from '../theme/context'
import AuthStack from './AuthStack'
import DrawerNavigator from './DrawerNavigator'
import { useAuth } from '../context/AuthContext'
import { SplashScreen } from '../screens/SplashScreen'
import { navigationRef, useBackButtonHandler } from './navigationUtilities'
import Config from '../config'
import { AppBottomSheet, type AppBottomSheetRef } from '../components/AppBottomSheet'
import { Button } from '../components/Button'
import { Text } from '../components/Text'
import { ThemedStyle } from '../theme/types'

const Stack = createNativeStackNavigator<RootStackParamList>()

const RootNavigator = () => {
  const { isAuthenticated } = useAuth()
  const { navigationTheme, themed, theme } = useAppTheme()
  const [isSplashScreenVisible, setIsSplashScreenVisible] = useState(true)
  const exitSheetRef = useRef<AppBottomSheetRef>(null)

  useBackButtonHandler(Config.exitRoutes, () => {
    exitSheetRef.current?.present()
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashScreenVisible(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isSplashScreenVisible ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : isAuthenticated ? (
          <Stack.Screen name="Main" component={DrawerNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>

      <AppBottomSheet ref={exitSheetRef} title="Exit app?">
        <Text
          text="Do you want to exit Roofing Inspection?"
          style={{ marginBottom: theme.spacing.md, color: theme.colors.textDim }}
        />
        <View style={themed($exitActions)}>
          <Button
            text="Cancel"
            style={themed($exitActionButton)}
            textStyle={themed($exitCancelText)}
            onPress={() => exitSheetRef.current?.dismiss()}
          />
          <Button
            text="Exit"
            preset="filled"
            style={themed($exitActionButtonPrimary)}
            textStyle={themed($exitConfirmText)}
            onPress={() => {
              exitSheetRef.current?.dismiss()
              BackHandler.exitApp()
            }}
          />
        </View>
      </AppBottomSheet>
    </NavigationContainer>
  )
}

export default RootNavigator

const $exitActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  gap: spacing.sm,
  alignItems: 'stretch',
})

const $exitActionButton: ThemedStyle<ViewStyle> = ({ isDark }) => ({
  flex: 1,
  minHeight: 40,
  borderRadius: 8,
  backgroundColor: isDark ? '#374151' : '#E5E7EB',
  borderColor: isDark ? '#374151' : '#E5E7EB',
})

const $exitActionButtonPrimary: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  minHeight: 40,
  borderRadius: 8,
  backgroundColor: colors.tint,
  borderColor: colors.tint,
})

const $exitCancelText: ThemedStyle<TextStyle> = ({ isDark }) => ({
  color: isDark ? '#F3F4F6' : '#1F2937',
  fontSize: 14,
  fontWeight: '600',
})

const $exitConfirmText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.whiteText,
  fontSize: 14,
  fontWeight: '600',
})
