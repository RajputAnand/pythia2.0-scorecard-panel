import { unstable_rethrow } from 'next/navigation'
import { cookies } from 'next/headers'
import Header from '@/components/shared/Header/Header'
import UserListPanel, { type RoleFilter } from '@/components/UserListPanel/UserListPanel'
import OwnerOnboardingBanner from '@/components/OwnerOnboardingBanner/OwnerOnboardingBanner'
import { fetchEmployees } from '@/queries/employees'
import { fetchManagers } from '@/queries/managers'
import { fetchOrganizationOwners } from '@/queries/organization-owners'
import { fetchStoresForTenant } from '@/queries/stores'
import { auth } from '@/auth'
import type { ApiEmployee } from '@/types/employee'
import type { ApiManager } from '@/types/manager'
import type { OrganizationOwner } from '@/types/organization-owner'
import type { TenantStore } from '@/types/tenant'
import type { User } from '@/types/user'

export const metadata = {
  title: 'Pythia — Users',
  description: 'Manage your organization’s employees, managers, and co-owners in one place.',
}

interface PageProps {
  searchParams: Promise<{ role?: string }>
}

export default async function OwnerUsersPage({ searchParams }: PageProps) {
  const session = await auth()
  const token = session?.user?.pythia2Token || session?.user?.token
  const tenantId = session?.user?.tenantId

  const resolvedSearchParams = await searchParams
  const rawRole = (resolvedSearchParams.role || '').toLowerCase()
  let initialRoleFilter: RoleFilter = 'ALL'
  if (rawRole === 'employee' || rawRole === 'employees') initialRoleFilter = 'employee'
  else if (rawRole === 'manager' || rawRole === 'managers') initialRoleFilter = 'manager'
  else if (rawRole === 'owner' || rawRole === 'owners' || rawRole === 'co-owner') initialRoleFilter = 'owner'

  const cookieStore = await cookies()
  let selectedStoreId = cookieStore.get('pythia_selected_store_id')?.value

  let initialEmployees: ApiEmployee[] = []
  let initialManagers: ApiManager[] = []
  let initialOwners: OrganizationOwner[] = []
  let initialStores: TenantStore[] = []

  if (token) {
    try {
      if (!selectedStoreId) {
        const storesRes = await fetchStoresForTenant({ token, tenantId, limit: 1 })
        selectedStoreId = storesRes.data?.[0]?.storeNo || storesRes.data?.[0]?.id || storesRes.data?.[0]?._id
      }

      const [employeesResult, managersResult, ownersResult, storesResult] = await Promise.allSettled([
        fetchEmployees({ token, skip: 0, limit: 100, storeId: selectedStoreId || undefined }),
        fetchManagers({ token, tenantId, skip: 0, limit: 100, storeId: selectedStoreId || undefined }),
        fetchOrganizationOwners({ token }),
        fetchStoresForTenant({ token, tenantId, limit: 100 }),
      ])

      if (employeesResult.status === 'fulfilled' && employeesResult.value.data) {
        initialEmployees = employeesResult.value.data
      }
      if (managersResult.status === 'fulfilled' && managersResult.value.data) {
        initialManagers = managersResult.value.data
      }
      if (ownersResult.status === 'fulfilled' && ownersResult.value.data) {
        initialOwners = ownersResult.value.data
      }
      if (storesResult.status === 'fulfilled' && storesResult.value.data) {
        initialStores = storesResult.value.data
      }
    } catch (err) {
      unstable_rethrow(err)
      console.warn('Failed to prefetch users data for OwnerUsersPage:', err)
    }
  }

  const user = session?.user as unknown as User

  return (
    <>
      <Header title="Users" subtitle="Team and credentials" />
      <OwnerOnboardingBanner user={user} />

      <div className="px-[30px] py-[26px]">
        <UserListPanel
          initialRoleFilter={initialRoleFilter}
          initialEmployees={initialEmployees}
          initialManagers={initialManagers}
          initialOwners={initialOwners}
          initialStores={initialStores}
        />
      </div>
    </>
  )
}

