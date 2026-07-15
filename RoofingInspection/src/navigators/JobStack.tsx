import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { JobStackParamList } from './navigatorTypes'
import { JobOverviewScreen } from '../screens/TechScreens/JobOverviewScreen'
import { SiteCaptureScreen } from '../screens/TechScreens/SiteCaptureScreen'
import { RoofInspectScreen } from '../screens/TechScreens/RoofInspectScreen'
import { HvacExceptionsScreen } from '../screens/TechScreens/HvacExceptionsScreen'
import { VisitReportPreviewScreen } from '../screens/TechScreens/VisitReportPreviewScreen'
import { VisitFinalReportScreen } from '../screens/TechScreens/VisitFinalReportScreen'

const Stack = createNativeStackNavigator<JobStackParamList>()

export default function JobStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JobOverview" component={JobOverviewScreen} />
      <Stack.Screen name="SiteCapture" component={SiteCaptureScreen} />
      <Stack.Screen name="RoofInspect" component={RoofInspectScreen} />
      <Stack.Screen name="HvacExceptions" component={HvacExceptionsScreen} />
      <Stack.Screen name="VisitReportPreview" component={VisitReportPreviewScreen} />
      <Stack.Screen name="VisitFinalReport" component={VisitFinalReportScreen} />
    </Stack.Navigator>
  )
}
