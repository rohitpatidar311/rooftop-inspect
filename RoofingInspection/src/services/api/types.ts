export type UserProfile = {
  UserId: number
  UserName: string
  Email: string
  FirstName: string
  LastName: string
  RoleId?: number
  RoleName?: string
  ChartTilePreference?: 'Chart' | 'Tile'
  NumPercentagePreferece?: 'Number' | 'Percentage'
  ColorPreference?: string
  ThemePreference?: 'light' | 'dark' | 'auto'
}

export type LoginRequest = {
  UserName: string
  plainTextPassword: string
}

export type LoginResult = {
  token: string
  user: UserProfile
}

export type SecretQuestion = {
  Value: number
  Text: string
}

export type ForgotPasswordRequest = {
  Username: string
  SecurityQuestionId: number
  SecurityAnswerPlain: string
}

export type DashboardStat = {
  id: string
  title: string
  value: number
  subtitle: string
  icon: string
}

export type DashboardData = {
  greetingName: string
  stats: DashboardStat[]
  recentItems: { id: string; title: string; status: string; date: string }[]
}
