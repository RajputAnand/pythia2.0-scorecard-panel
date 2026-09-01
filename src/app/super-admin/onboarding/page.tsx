import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import OnboardingWizard from '@/components/OnboardingWizard/OnboardingWizard'
import { auth } from '@/auth'
import { fetchTenants } from '@/queries/tenants'
import { fetchStoresForTenant } from '@/queries/stores'
import { fetchOwners } from '@/queries/owners'
import type { Tenant, TenantStore } from '@/types/tenant'
import type { TenantOwner } from '@/types/owner'

export const metadata = {
  title: 'Pythia 2.0 — Customer Onboarding',
  description: 'Guided wizard for Super Admin to stand up new customer tenants.',
}

export default async function SuperAdminOnboardingPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  let allTenants: Tenant[] = []
  let activeTenant: Tenant | null = null
  let stores: TenantStore[] = []
  let owners: TenantOwner[] = []

  if (token) {
    const results = await Promise.allSettled([
      fetchTenants({ token, limit: 50 }),
    ])

    for (const res of results) {
      if (res.status === 'rejected') {
        unstable_rethrow(res.reason)
      }
    }

    if (results[0].status === 'fulfilled' && results[0].value.data) {
      allTenants = results[0].value.data
      activeTenant = allTenants.find((t) => t.status === 'onboarding') || allTenants[0] || null

      if (activeTenant) {
        const [storesRes, ownersRes] = await Promise.allSettled([
          fetchStoresForTenant({ token, tenantId: activeTenant.id, limit: 100 }),
          fetchOwners({ token, tenantId: activeTenant.id, limit: 100 }),
        ])
        if (storesRes.status === 'fulfilled' && storesRes.value.data) {
          stores = storesRes.value.data
        }
        if (ownersRes.status === 'fulfilled' && ownersRes.value.data) {
          owners = ownersRes.value.data
        }
      }
    }
  }

  return (
    <>
      <Header title="Customer Onboarding" subtitle="Super Admin Tools" />
      <div className="px-[30px] py-[26px]">
        <OnboardingWizard
          initialTenant={activeTenant}
          initialStores={stores}
          initialOwners={owners}
          allTenants={allTenants}
        />
      </div>
    </>
  )
}

