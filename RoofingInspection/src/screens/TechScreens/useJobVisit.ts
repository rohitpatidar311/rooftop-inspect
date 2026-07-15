import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  ensureVisit,
  replaceVisitProgress,
} from '../../redux/slices/visitSlice'
import { api } from '../../services/api'
import type { TechJob, VisitProgress } from '../../services/api/types'

export function useJobVisit(jobId: string) {
  const dispatch = useAppDispatch()
  const progress = useAppSelector((s) => s.visit.byJobId[jobId])
  const statusOverride = useAppSelector((s) => s.visit.statusOverrides[jobId])
  const [job, setJob] = useState<TechJob | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      dispatch(ensureVisit(jobId))
      const jobResult = await api.getJob(jobId)
      if (cancelled) return
      if (jobResult.kind === 'ok') setJob(jobResult.data)

      const progressResult = await api.getVisitProgress(jobId)
      if (cancelled) return
      if (progressResult.kind === 'ok') {
        const localUnlocked = progress?.unlockedSteps?.length ?? 0
        const remoteUnlocked = progressResult.data.unlockedSteps.length
        // Prefer richer remote only when local is still at the default single step
        if (localUnlocked <= 1 && remoteUnlocked > localUnlocked) {
          dispatch(replaceVisitProgress(progressResult.data))
        }
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
    // Intentionally only re-run when jobId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, jobId])

  const mergedJob = useMemo(() => {
    if (!job) return null
    return {
      ...job,
      status: statusOverride ?? job.status,
    }
  }, [job, statusOverride])

  return {
    job: mergedJob,
    progress: progress as VisitProgress | undefined,
    loading,
  }
}
