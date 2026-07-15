import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import type { MainDrawerParamList } from './navigatorTypes'
import { TodayJobsScreen } from '../screens/TechScreens/TodayJobsScreen'
import JobStack from './JobStack'
import CustomDrawerContent from '../components/CustomDrawerContent'
import { HeaderLeft, HeaderTitleLogo } from '../components/HeaderComponents'
import { useAppTheme } from '../theme/context'

const Drawer = createDrawerNavigator<MainDrawerParamList>()

const DrawerNavigator = () => {
  const { theme } = useAppTheme()

  return (
    <Drawer.Navigator
      initialRouteName="TodayJobs"
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
        name="TodayJobs"
        component={TodayJobsScreen}
        options={{
          title: 'My Jobs',
          drawerIcon: ({ color, size }) => {
            const Ionicons = require('react-native-vector-icons/Ionicons').default
            return <Ionicons name="clipboard-outline" size={size} color={color} />
          },
        }}
      />
      <Drawer.Screen
        name="JobFlow"
        component={JobStack}
        options={{
          headerShown: false,
          drawerItemStyle: { display: 'none' },
          title: 'Job',
        }}
      />
    </Drawer.Navigator>
  )
}

export default DrawerNavigator
