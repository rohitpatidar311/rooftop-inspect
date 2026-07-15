import type { TechJob, VisitProgress } from '../../services/api/types'

export function buildVisitReportText(
  job: TechJob,
  progress: VisitProgress,
): string {
  const photos = progress.photos ?? []
  const flaggedExceptions = job.exceptions.filter(
    (e) => progress.exceptionFlags[e.id],
  )
  const roofEntries = job.roofChecks.map((check) => ({
    check,
    result: progress.roofResults[check.id],
  }))

  const lines = [
    `VISIT REPORT`,
    `============`,
    `Site: ${job.siteName}`,
    `Address: ${job.address}`,
    `Status: ${job.status}`,
    '',
    '1. SITE PHOTOS',
    ...(photos.length
      ? photos.map((p, i) => `  ${i + 1}. ${p.caption}`)
      : ['  None']),
    '',
    '2. ROOF INSPECT',
    ...roofEntries.map(
      ({ check, result }) =>
        `  [${(result ?? '—').toUpperCase()}] ${check.group}: ${check.label}`,
    ),
    '',
    '3. EXCEPTIONS',
    ...(flaggedExceptions.length
      ? flaggedExceptions.map((e) => `  - ${e.category}: ${e.label}`)
      : ['  None flagged']),
    '',
    `4. SIGNATURE: ${progress.signed ? 'Signed' : 'Not signed'}`,
    '',
    `Generated: ${new Date().toLocaleString()}`,
  ]
  return lines.join('\n')
}
