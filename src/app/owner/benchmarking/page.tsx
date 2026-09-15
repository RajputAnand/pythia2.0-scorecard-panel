import { Suspense } from 'react'
import BenchmarkingContent from '@/components/BenchmarkingContent/BenchmarkingContent'
import { auth } from '@/auth'
import { fetchStoresForTenant } from '@/queries/stores'

export default async function BenchmarkingPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token || session?.user?.token
  const tenantId = session?.user?.tenantId

  let hasStores: boolean | null = null
  if (token) {
    try {
      const storesRes = await fetchStoresForTenant({ token, tenantId, limit: 1 })
      hasStores = (storesRes.data?.length ?? 0) > 0
    } catch {
      hasStores = null
    }
  }

  return (
    <Suspense fallback={<div className="h-[500px]" />}>
      <BenchmarkingContent initialHasStores={hasStores} />
    </Suspense>
  )
}
