import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { AuthStackParamList } from './navigatorTypes'
import { LoginScreen } from '../screens/AuthScreens/LoginScreen'
import { ForgotPasswordScreen } from '../screens/AuthScreens/ForgotPasswordScreen'
import { CreateAccountScreen } from '../screens/AuthScreens/CreateAccountScreen'

const Stack = createNativeStackNavigator<AuthStackParamList>()

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
    </Stack.Navigator>
  )
}

export default AuthStack
