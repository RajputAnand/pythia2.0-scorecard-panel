import { unstable_rethrow } from 'next/navigation'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import SuperAdminEmployeeSwagContent from '@/components/SuperAdminEmployeeSwagContent/SuperAdminEmployeeSwagContent'
import { fetchEmployees } from '@/queries/employees'
import { fetchStoresForTenant } from '@/queries/stores'
import type { ApiEmployee } from '@/types/employee'

export const metadata = {
  title: 'Pythia — Swag Store (Super Admin Employee View)',
  description: 'Super Admin Employee View mirror of the Swag Store.',
}

export default async function SuperAdminEmployeeSwagPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token ?? ''

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

  let initialEmployees: ApiEmployee[] = []
  let initialSelectedEmployee: ApiEmployee | null = null

  if (token) {
    const [employeesResult] = await Promise.allSettled([
      fetchEmployees({ token, skip: 0, limit: 100, storeId: selectedStoreId }),
    ])
    if (employeesResult.status === 'rejected') {
      unstable_rethrow(employeesResult.reason)
    }
    if (employeesResult.status === 'fulfilled') {
      initialEmployees = employeesResult.value.data ?? []
      initialSelectedEmployee = initialEmployees[0] ?? null
    }
  }

  return (
    <SuperAdminEmployeeSwagContent
      initialEmployees={initialEmployees}
      initialSelectedEmployee={initialSelectedEmployee}
      token={token}
    />
  )
}
