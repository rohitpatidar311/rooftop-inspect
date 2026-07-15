import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { JobStatus, JobStepId, VisitProgress } from '../../services/api/types'

export const JOB_STEP_ORDER: JobStepId[] = [
  'overview',
  'capture',
  'roof',
  'exceptions',
  'complete',
  'final',
]

export function createEmptyProgress(jobId: string): VisitProgress {
  return {
    jobId,
    unlockedSteps: ['overview'],
    photoCount: 0,
    photos: [],
    torchOn: false,
    confirmedUnitIds: [],
    serviceDone: {},
    roofResults: {},
    exceptionFlags: {},
    aiConfirmed: {},
    signed: false,
    signaturePaths: [],
    signatureSize: null,
    submitted: false,
  }
}

type VisitState = {
  byJobId: Record<string, VisitProgress>
  statusOverrides: Record<string, JobStatus>
}

const initialState: VisitState = {
  byJobId: {},
  statusOverrides: {},
}

const visitSlice = createSlice({
  name: 'visit',
  initialState,
  reducers: {
    ensureVisit(state, action: PayloadAction<string>) {
      const jobId = action.payload
      if (!state.byJobId[jobId]) {
        state.byJobId[jobId] = createEmptyProgress(jobId)
      } else if (!state.byJobId[jobId].photos) {
        state.byJobId[jobId].photos = []
      }
      if (!state.byJobId[jobId].signaturePaths) {
        state.byJobId[jobId].signaturePaths = []
      }
    },
    unlockStep(
      state,
      action: PayloadAction<{ jobId: string; step: JobStepId }>,
    ) {
      const progress = state.byJobId[action.payload.jobId]
      if (!progress) return
      if (!progress.unlockedSteps.includes(action.payload.step)) {
        progress.unlockedSteps.push(action.payload.step)
      }
      if (
        state.statusOverrides[action.payload.jobId] !== 'completed' &&
        action.payload.step !== 'overview'
      ) {
        state.statusOverrides[action.payload.jobId] = 'in_progress'
      }
    },
    capturePhoto(
      state,
      action: PayloadAction<{ jobId: string; uri: string; caption: string }>,
    ) {
      const progress = state.byJobId[action.payload.jobId]
      if (!progress) return
      if (!progress.photos) progress.photos = []
      const caption = action.payload.caption.trim() || 'Untitled photo'
      progress.photos.unshift({
        id: `photo-${Date.now()}-${progress.photos.length}`,
        uri: action.payload.uri,
        caption,
        capturedAt: new Date().toISOString(),
      })
      progress.photoCount = progress.photos.length
    },
    updatePhotoCaption(
      state,
      action: PayloadAction<{ jobId: string; photoId: string; caption: string }>,
    ) {
      const progress = state.byJobId[action.payload.jobId]
      if (!progress?.photos) return
      const photo = progress.photos.find((p) => p.id === action.payload.photoId)
      if (!photo) return
      photo.caption = action.payload.caption.trim() || 'Untitled photo'
    },
    removePhoto(
      state,
      action: PayloadAction<{ jobId: string; photoId: string }>,
    ) {
      const progress = state.byJobId[action.payload.jobId]
      if (!progress?.photos) return
      progress.photos = progress.photos.filter(
        (p) => p.id !== action.payload.photoId,
      )
      progress.photoCount = progress.photos.length
    },
    toggleTorch(state, action: PayloadAction<string>) {
      const progress = state.byJobId[action.payload]
      if (!progress) return
      progress.torchOn = !progress.torchOn
    },
    confirmUnit(
      state,
      action: PayloadAction<{ jobId: string; unitId: string }>,
    ) {
      const progress = state.byJobId[action.payload.jobId]
      if (!progress) return
      if (!progress.confirmedUnitIds.includes(action.payload.unitId)) {
        progress.confirmedUnitIds.push(action.payload.unitId)
      }
    },
    setServiceDone(
      state,
      action: PayloadAction<{ jobId: string; serviceId: string; done: boolean }>,
    ) {
      const progress = state.byJobId[action.payload.jobId]
      if (!progress) return
      progress.serviceDone[action.payload.serviceId] = action.payload.done
    },
    setRoofResult(
      state,
      action: PayloadAction<{
        jobId: string
        checkId: string
        result: 'pass' | 'fail' | 'na'
      }>,
    ) {
      const progress = state.byJobId[action.payload.jobId]
      if (!progress) return
      progress.roofResults[action.payload.checkId] = action.payload.result
    },
    toggleException(
      state,
      action: PayloadAction<{ jobId: string; exceptionId: string }>,
    ) {
      const progress = state.byJobId[action.payload.jobId]
      if (!progress) return
      const id = action.payload.exceptionId
      progress.exceptionFlags[id] = !progress.exceptionFlags[id]
    },
    confirmAi(
      state,
      action: PayloadAction<{ jobId: string; suggestionId: string }>,
    ) {
      const progress = state.byJobId[action.payload.jobId]
      if (!progress) return
      progress.aiConfirmed[action.payload.suggestionId] = true
    },
    setSigned(state, action: PayloadAction<{ jobId: string; signed: boolean }>) {
      const progress = state.byJobId[action.payload.jobId]
      if (!progress) return
      progress.signed = action.payload.signed
      if (!action.payload.signed) {
        progress.signaturePaths = []
        progress.signatureSize = null
      }
    },
    setSignature(
      state,
      action: PayloadAction<{
        jobId: string
        paths: string[]
        size: { width: number; height: number }
      }>,
    ) {
      const progress = state.byJobId[action.payload.jobId]
      if (!progress) return
      progress.signaturePaths = action.payload.paths
      progress.signatureSize = action.payload.size
      progress.signed = action.payload.paths.length > 0
    },
    submitVisit(state, action: PayloadAction<string>) {
      const jobId = action.payload
      const progress = state.byJobId[jobId]
      if (!progress) return
      progress.submitted = true
      state.statusOverrides[jobId] = 'completed'
    },
    replaceVisitProgress(state, action: PayloadAction<VisitProgress>) {
      const next = action.payload
      const validSteps = new Set(JOB_STEP_ORDER)
      state.byJobId[next.jobId] = {
        ...createEmptyProgress(next.jobId),
        ...next,
        unlockedSteps: (next.unlockedSteps ?? ['overview']).filter((s) =>
          validSteps.has(s),
        ),
        photos: next.photos ?? [],
        photoCount: next.photos?.length ?? next.photoCount ?? 0,
        signaturePaths: next.signaturePaths ?? [],
        signatureSize: next.signatureSize ?? null,
      }
    },
  },
})

export const {
  ensureVisit,
  unlockStep,
  capturePhoto,
  updatePhotoCaption,
  removePhoto,
  toggleTorch,
  confirmUnit,
  setServiceDone,
  setRoofResult,
  toggleException,
  confirmAi,
  setSigned,
  setSignature,
  submitVisit,
  replaceVisitProgress,
} = visitSlice.actions

export default visitSlice.reducer
