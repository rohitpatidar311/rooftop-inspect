import { Middleware } from '@reduxjs/toolkit'
import { api } from '../services/api'
import type { VisitProgress } from '../services/api/types'

const SKIP = new Set([
  'visit/ensureVisit',
  'visit/replaceVisitProgress',
])

type VisitAwareState = {
  visit: {
    byJobId: Record<string, VisitProgress>
  }
}

function extractJobId(action: { type?: string; payload?: unknown }): string | null {
  if (!action.type?.startsWith('visit/')) return null
  if (SKIP.has(action.type)) return null
  const payload = action.payload
  if (typeof payload === 'string') return payload
  if (payload && typeof payload === 'object' && 'jobId' in payload) {
    return (payload as { jobId: string }).jobId
  }
  return null
}

/** Persist visit progress after any mutating visit action. */
export const visitPersistMiddleware: Middleware =
  (storeApi) => (next) => (action) => {
    const result = next(action)
    const jobId = extractJobId(action as { type?: string; payload?: unknown })
    if (jobId) {
      const state = storeApi.getState() as VisitAwareState
      const progress = state.visit.byJobId[jobId]
      if (progress) {
        void api.saveVisitProgress(progress)
      }
    }
    return result
  }
