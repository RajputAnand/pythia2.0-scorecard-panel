import { unstable_rethrow } from 'next/navigation'
import { cookies } from 'next/headers'
import Header from '@/components/shared/Header/Header'
import EmployeeListPanel from '@/components/EmployeeListPanel/EmployeeListPanel'
import { fetchEmployees } from '@/queries/employees'
import { fetchStoresForTenant } from '@/queries/stores'
import { auth } from '@/auth'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { ApiEmployee } from '@/types/employee'

export const metadata = {
  title: 'Pythia — Employees (Owner Mirror)',
  description: 'Super Admin read-only mirror of the Owner Employees page.',
}

export default async function SuperAdminOwnerEmployeesMirrorPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  const cookieStore = await cookies()
  let selectedStoreId = cookieStore.get('pythia_selected_store_id')?.value

  if (!selectedStoreId && token) {
    try {
      const storesRes = await fetchStoresForTenant({ token, limit: 1 })
      selectedStoreId = storesRes.data?.[0]?.storeNo || storesRes.data?.[0]?.id || storesRes.data?.[0]?._id
    } catch {
      // fallback
    }
  }

  let initialData: ApiResponseV2Paginated<ApiEmployee[]> | null = null
  if (token) {
    const [employeesResult] = await Promise.allSettled([
      fetchEmployees({ token, skip: 0, limit: 15, storeId: selectedStoreId }),
    ])
    if (employeesResult.status === 'rejected') unstable_rethrow(employeesResult.reason)
    if (employeesResult.status === 'fulfilled') initialData = employeesResult.value
  }

  return (
    <>
      <Header title="Employees (Mirror)" subtitle="Owner View · Manage your team and credentials" />

      <div className="px-[30px] py-[26px]">
        <EmployeeListPanel initialData={initialData} readOnly={true} />
      </div>
    </>
  )
}

