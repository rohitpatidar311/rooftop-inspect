import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import type { MainDrawerParamList } from './navigatorTypes'
import { DashboardScreen } from '../screens/DashBoardScreens/DashboardScreen'
import { AppSettingsScreen } from '../screens/AppSettingsScreen'
import CustomDrawerContent from '../components/CustomDrawerContent'
import { HeaderLeft, HeaderTitleLogo } from '../components/HeaderComponents'
import { useAppTheme } from '../theme/context'

const Drawer = createDrawerNavigator<MainDrawerParamList>()

const DrawerNavigator = () => {
  const { theme } = useAppTheme()

  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerTitle: () => <HeaderTitleLogo />,
        headerLeft: () => <HeaderLeft />,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        drawerActiveTintColor: theme.colors.tint,
        drawerInactiveTintColor: theme.colors.text,
        drawerStyle: {
          backgroundColor: theme.colors.background,
          width: 300,
        },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color, size }) => {
            const Ionicons = require('react-native-vector-icons/Ionicons').default
            return <Ionicons name="grid-outline" size={size} color={color} />
          },
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={AppSettingsScreen}
        options={{
          title: 'Settings & Preferences',
          drawerIcon: ({ color, size }) => {
            const Ionicons = require('react-native-vector-icons/Ionicons').default
            return <Ionicons name="settings-outline" size={size} color={color} />
          },
        }}
      />
    </Drawer.Navigator>
  )
}

export default DrawerNavigator
