import { Suspense } from 'react'
import BenchmarkingContent from '@/components/BenchmarkingContent/BenchmarkingContent'
import { auth } from '@/auth'
import { fetchStoresForTenant } from '@/queries/stores'

export const metadata = {
  title: 'Pythia — Benchmarking (Super Admin)',
  description: 'Super Admin read-only mirror of the Owner Benchmarking page.',
}

// Read-only mirror of /owner/benchmarking for the Super Admin panel.
// BenchmarkingContent is self-contained (fetches with the caller's own
// session token via useSession, same as the owner page), so the mirror just
// renders it directly rather than reassembling its cards from scratch.
export default async function SuperAdminBenchmarkingPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token || session?.user?.token

  let hasStores: boolean | null = null
  if (token) {
    try {
      const storesRes = await fetchStoresForTenant({ token, limit: 1 })
      hasStores = (storesRes.data?.length ?? 0) > 0
    } catch {
      hasStores = null
    }
  }

  return (
    <Suspense fallback={<div className="h-[500px]" />}>
      <BenchmarkingContent subtitlePrefix="Super Admin" initialHasStores={hasStores} />
    </Suspense>
  )
}
