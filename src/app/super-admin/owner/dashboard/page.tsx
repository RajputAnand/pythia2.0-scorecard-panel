import { Suspense } from 'react'
import OwnerDashboardContent from '@/components/OwnerDashboardContent/OwnerDashboardContent'
import { auth } from '@/auth'
import { fetchStoresForTenant } from '@/queries/stores'

export const metadata = {
  title: 'Pythia — Dashboard (Super Admin)',
  description: 'Super Admin read-only mirror of the Owner Dashboard page.',
}

export default async function SuperAdminOwnerDashboardPage() {
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
      <OwnerDashboardContent subtitlePrefix="Super Admin" initialHasStores={hasStores} />
    </Suspense>
  )
}
