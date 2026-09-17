import { unstable_rethrow } from 'next/navigation'
import { cookies } from 'next/headers'
import Header from '@/components/shared/Header/Header'
import UserListPanel, { type RoleFilter } from '@/components/UserListPanel/UserListPanel'
import { fetchEmployees } from '@/queries/employees'
import { fetchManagers } from '@/queries/managers'
import { fetchOrganizationOwners } from '@/queries/organization-owners'
import { fetchStoresForTenant } from '@/queries/stores'
import { auth } from '@/auth'
import type { ApiEmployee } from '@/types/employee'
import type { ApiManager } from '@/types/manager'
import type { OrganizationOwner } from '@/types/organization-owner'
import type { TenantStore } from '@/types/tenant'

export const metadata = {
  title: 'Pythia — Users (Owner Mirror)',
  description: 'Manage users in Owner View mirror for Super Admin.',
}

interface PageProps {
  searchParams: Promise<{ role?: string }>
}

export default async function SuperAdminOwnerUsersMirrorPage({ searchParams }: PageProps) {
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
      console.warn('Failed to prefetch users data for SuperAdminOwnerUsersMirrorPage:', err)
    }
  }

  return (
    <>
      <Header title="Users (Mirror)" subtitle="Owner View" />

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

