import Header from '@/components/shared/Header/Header'
import EmployeeListPanel from '@/components/EmployeeListPanel/EmployeeListPanel'
import { fetchEmployees } from '@/queries/employees'
import { auth } from '@/auth'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { ApiEmployee } from '@/types/employee'

export const metadata = {
  title: 'Pythia — Employees (Super Admin)',
  description: 'Super Admin read-only mirror of the Manager Employees page.',
}

// Read-only mirror of /manager/employees for the Super Admin panel — same
// query/component as the manager page, called with the super admin's own
// session token so the admin can see the same real data managers see.
export default async function SuperAdminManagerEmployeesPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  let initialData: ApiResponseV2Paginated<ApiEmployee[]> | null = null
  if (token) {
    try {
      initialData = await fetchEmployees({ token, skip: 0, limit: 15 })
    } catch {
      // non-fatal — EmployeeListPanel renders an error state with retry
    }
  }

  return (
    <>
      <Header title="Employees" subtitle="Super Admin · Manage your team and credentials" />

      <div className="px-[30px] py-[26px]">
        <EmployeeListPanel initialData={initialData} />
      </div>
    </>
  )
}
