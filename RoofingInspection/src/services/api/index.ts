import type { GeneralApiProblem } from './apiProblem'
import type {
  DashboardData,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResult,
  SecretQuestion,
  TechJob,
  UserProfile,
  VisitProgress,
} from './types'
import {
  mockDashboard,
  mockDelay,
  mockSecretQuestions,
  mockTechJobs,
  mockUser,
} from '../mockData'
import { createEmptyProgress } from '../../redux/slices/visitSlice'

type Ok<T> = { kind: 'ok' } & T
type Result<T> = Ok<T> | GeneralApiProblem

/** In-memory mutable job status for mock submit */
const jobStatusMap: Record<string, TechJob['status']> = Object.fromEntries(
  mockTechJobs.map((j) => [j.id, j.status]),
)

const progressMap: Record<string, VisitProgress> = {}

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

  async getTodayJobs(): Promise<Result<{ data: TechJob[] }>> {
    await mockDelay(400)
    const data = mockTechJobs.map((job) => ({
      ...job,
      status: jobStatusMap[job.id] ?? job.status,
    }))
    return { kind: 'ok', data }
  }

  async getJob(jobId: string): Promise<Result<{ data: TechJob }>> {
    await mockDelay(300)
    const job = mockTechJobs.find((j) => j.id === jobId)
    if (!job) {
      return { kind: 'rejected', message: 'Job not found.' }
    }
    return {
      kind: 'ok',
      data: { ...job, status: jobStatusMap[job.id] ?? job.status },
    }
  }

  async saveVisitProgress(
    progress: VisitProgress,
  ): Promise<Result<{ data: VisitProgress }>> {
    await mockDelay(200)
    progressMap[progress.jobId] = progress
    return { kind: 'ok', data: progress }
  }

  async getVisitProgress(
    jobId: string,
  ): Promise<Result<{ data: VisitProgress }>> {
    await mockDelay(150)
    const data = progressMap[jobId] ?? createEmptyProgress(jobId)
    return { kind: 'ok', data }
  }

  async submitVisit(jobId: string): Promise<Result<{ message: string }>> {
    await mockDelay(500)
    const job = mockTechJobs.find((j) => j.id === jobId)
    if (!job) {
      return { kind: 'rejected', message: 'Job not found.' }
    }
    jobStatusMap[jobId] = 'completed'
    const progress = progressMap[jobId] ?? createEmptyProgress(jobId)
    progress.submitted = true
    progressMap[jobId] = progress
    return { kind: 'ok', message: 'Visit submitted successfully.' }
  }
}

export const api = new Api()

export type { LoginResult, LoginRequest, UserProfile, DashboardData, TechJob }
