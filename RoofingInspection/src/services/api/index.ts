import type { GeneralApiProblem } from './apiProblem'
import type {
  DashboardData,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResult,
  SecretQuestion,
  UserProfile,
} from './types'
import {
  mockDashboard,
  mockDelay,
  mockSecretQuestions,
  mockUser,
} from '../mockData'

type Ok<T> = { kind: 'ok' } & T
type Result<T> = Ok<T> | GeneralApiProblem

/**
 * Mock API layer — same call shapes as a real apisauce client,
 * returning delayed fixture data until backends exist.
 */
export class Api {
  async login(payload: LoginRequest): Promise<Result<{ token: string; user: UserProfile }>> {
    await mockDelay()
    if (!payload.UserName?.trim() || !payload.plainTextPassword?.trim()) {
      return { kind: 'rejected', message: 'Username and password are required.' }
    }
    const user: UserProfile = {
      ...mockUser,
      UserName: payload.UserName.trim(),
      Email: `${payload.UserName.trim().toLowerCase()}@roofinginspection.com`,
      FirstName: payload.UserName.trim(),
    }
    return {
      kind: 'ok',
      token: `mock-token-${Date.now()}`,
      user,
    }
  }

  async register(payload: {
    fullName: string
    username: string
    email: string
    password: string
  }): Promise<Result<{ message: string }>> {
    await mockDelay(800)
    if (!payload.username || !payload.email || !payload.password) {
      return { kind: 'rejected', message: 'All fields are required.' }
    }
    return { kind: 'ok', message: 'Account created successfully.' }
  }

  async getSecretQuestionList(): Promise<Result<{ data: SecretQuestion[] }>> {
    await mockDelay(400)
    return { kind: 'ok', data: mockSecretQuestions }
  }

  async forgotPassword(
    _payload: ForgotPasswordRequest,
  ): Promise<Result<{ message: string }>> {
    await mockDelay(700)
    return {
      kind: 'ok',
      message: 'Password reset instructions have been sent (mock).',
    }
  }

  async getDashboard(): Promise<Result<{ data: DashboardData }>> {
    await mockDelay(500)
    return { kind: 'ok', data: mockDashboard }
  }

  async updateUserPreferences(_payload: Record<string, unknown>): Promise<Result<{ message: string }>> {
    await mockDelay(300)
    return { kind: 'ok', message: 'Preferences saved.' }
  }
}

export const api = new Api()

export type { LoginResult, LoginRequest, UserProfile, DashboardData }
