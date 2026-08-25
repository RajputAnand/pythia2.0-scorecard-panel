import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import EmployeeListPanel from '@/components/EmployeeListPanel/EmployeeListPanel'
import { fetchEmployees } from '@/queries/employees'
import { auth } from '@/auth'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { ApiEmployee } from '@/types/employee'

export const metadata = {
  title: 'Pythia — Employees',
  description: 'Manage your store’s employees and share temporary credentials.',
}

export default async function ManagerEmployeesPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  let initialData: ApiResponseV2Paginated<ApiEmployee[]> | null = null
  if (token) {
    const [employeesResult] = await Promise.allSettled([
      fetchEmployees({ token, skip: 0, limit: 15 }),
    ])
    if (employeesResult.status === 'rejected') unstable_rethrow(employeesResult.reason)
    if (employeesResult.status === 'fulfilled') initialData = employeesResult.value
  }

  return (
    <>
      <Header title="Employees" subtitle="Manage your team and credentials" />

      <div className="px-[30px] py-[26px]">
        <EmployeeListPanel initialData={initialData} />
      </div>
    </>
  )
}
