import { Suspense } from 'react'
import BenchmarkingContent from '@/components/BenchmarkingContent/BenchmarkingContent'

export const metadata = {
  title: 'Pythia — Benchmarking (Super Admin)',
  description: 'Super Admin read-only mirror of the Owner Benchmarking page.',
}

// Read-only mirror of /owner/benchmarking for the Super Admin panel.
// BenchmarkingContent is self-contained (fetches with the caller's own
// session token via useSession, same as the owner page), so the mirror just
// renders it directly rather than reassembling its cards from scratch.
export default function SuperAdminBenchmarkingPage() {
  return (
    <Suspense fallback={<div className="h-[500px]" />}>
      <BenchmarkingContent subtitlePrefix="Super Admin" />
    </Suspense>
  )
}
