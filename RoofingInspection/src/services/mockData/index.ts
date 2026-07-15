import type { DashboardData, SecretQuestion, UserProfile } from '../api/types'

export { mockTechJobs } from './techJobs'

export const mockUser: UserProfile = {
  UserId: 1,
  UserName: 'tech',
  Email: 'tech@bfc.com',
  FirstName: 'Mike',
  LastName: 'Torres',
  RoleId: 1,
  RoleName: 'Field Technician',
  ChartTilePreference: 'Tile',
  NumPercentagePreferece: 'Number',
  ColorPreference: 'Blue',
  ThemePreference: 'auto',
}

export const mockSecretQuestions: SecretQuestion[] = [
  { Value: 1, Text: 'What was the name of your first pet?' },
  { Value: 2, Text: 'What city were you born in?' },
  { Value: 3, Text: 'What is your favorite roofing material?' },
]

export const mockDashboard: DashboardData = {
  greetingName: 'Demo',
  stats: [
    {
      id: 'inspections',
      title: 'Inspections',
      value: 12,
      subtitle: 'This week',
      icon: 'clipboard-outline',
    },
    {
      id: 'pending',
      title: 'Pending',
      value: 5,
      subtitle: 'Awaiting review',
      icon: 'time-outline',
    },
    {
      id: 'completed',
      title: 'Completed',
      value: 28,
      subtitle: 'This month',
      icon: 'checkmark-circle-outline',
    },
    {
      id: 'issues',
      title: 'Issues Found',
      value: 7,
      subtitle: 'Open findings',
      icon: 'warning-outline',
    },
  ],
  recentItems: [
    {
      id: '1',
      title: '123 Oak Street — Full Roof',
      status: 'Completed',
      date: '2026-07-14',
    },
    {
      id: '2',
      title: '45 Maple Ave — Gutter Check',
      status: 'In Progress',
      date: '2026-07-13',
    },
    {
      id: '3',
      title: '9 Pine Court — Storm Damage',
      status: 'Pending',
      date: '2026-07-12',
    },
  ],
}

/** Delay to simulate network latency */
export function mockDelay(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
