import type { JobStepId } from '../../services/api/types'
import type { JobStackParamList } from '../../navigators/navigatorTypes'

export type JobStepDef = {
  id: JobStepId
  label: string
  route: keyof JobStackParamList
}

export const JOB_STEPS: JobStepDef[] = [
  { id: 'overview', label: 'Job', route: 'JobOverview' },
  { id: 'capture', label: 'Site Capture', route: 'SiteCapture' },
  { id: 'roof', label: 'Roof Inspect', route: 'RoofInspect' },
  { id: 'exceptions', label: 'Exceptions', route: 'HvacExceptions' },
  { id: 'complete', label: 'Preview', route: 'VisitReportPreview' },
  { id: 'final', label: 'Report', route: 'VisitFinalReport' },
]

export const STEP_ROUTE_MAP: Record<JobStepId, keyof JobStackParamList> = {
  overview: 'JobOverview',
  capture: 'SiteCapture',
  roof: 'RoofInspect',
  exceptions: 'HvacExceptions',
  complete: 'VisitReportPreview',
  final: 'VisitFinalReport',
}

export const INDIGO = '#4F46E5'
export const INDIGO_MUTED = '#EEF2FF'
