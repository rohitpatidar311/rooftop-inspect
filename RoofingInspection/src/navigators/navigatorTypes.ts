import type { NavigatorScreenParams } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { DrawerScreenProps } from '@react-navigation/drawer'
import type { CompositeScreenProps } from '@react-navigation/native'

export type AuthStackParamList = {
  Login: undefined
  ForgotPassword: undefined
  CreateAccount: undefined
}

export type JobStackParamList = {
  JobOverview: { jobId: string }
  SiteCapture: { jobId: string }
  RoofInspect: { jobId: string }
  HvacExceptions: { jobId: string }
  VisitReportPreview: { jobId: string }
  VisitFinalReport: { jobId: string }
}

export type MainDrawerParamList = {
  TodayJobs: undefined
  JobFlow: NavigatorScreenParams<JobStackParamList>
}

export type RootStackParamList = {
  Splash: undefined
  Auth: NavigatorScreenParams<AuthStackParamList>
  Main: NavigatorScreenParams<MainDrawerParamList>
}

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<AuthStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>

export type MainDrawerScreenProps<T extends keyof MainDrawerParamList> = CompositeScreenProps<
  DrawerScreenProps<MainDrawerParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>

export type JobStackScreenProps<T extends keyof JobStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<JobStackParamList, T>,
  MainDrawerScreenProps<'JobFlow'>
>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
