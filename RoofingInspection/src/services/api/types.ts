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

export type JobStatus = 'scheduled' | 'in_progress' | 'completed'

export type JobStepId =
  | 'overview'
  | 'capture'
  | 'roof'
  | 'exceptions'
  | 'complete'
  | 'final'

export type HvacUnit = {
  id: string
  model: string
  consensusPercent: number
  confirmed: boolean
}

export type ServiceItem = {
  id: string
  label: string
  doneLabel: 'Done' | 'OK'
}

export type RoofCheckItem = {
  id: string
  group: string
  label: string
}

export type ExceptionItem = {
  id: string
  category: string
  label: string
}

export type AiSuggestion = {
  id: string
  title: string
  detail: string
}

export type TechJob = {
  id: string
  siteName: string
  address: string
  status: JobStatus
  serviceTags: string[]
  /** Site coordinates for map / navigation */
  latitude: number
  longitude: number
  units: HvacUnit[]
  services: ServiceItem[]
  roofChecks: RoofCheckItem[]
  exceptions: ExceptionItem[]
  aiSuggestions: AiSuggestion[]
}

export type SitePhoto = {
  id: string
  uri: string
  caption: string
  capturedAt: string
}

export type VisitProgress = {
  jobId: string
  unlockedSteps: JobStepId[]
  photoCount: number
  photos: SitePhoto[]
  torchOn: boolean
  confirmedUnitIds: string[]
  serviceDone: Record<string, boolean>
  roofResults: Record<string, 'pass' | 'fail' | 'na'>
  exceptionFlags: Record<string, boolean>
  aiConfirmed: Record<string, boolean>
  signed: boolean
  /** SVG path `d` strings for the technician signature */
  signaturePaths: string[]
  /** Canvas size used when the signature was drawn (for preview scaling) */
  signatureSize: { width: number; height: number } | null
  submitted: boolean
}
