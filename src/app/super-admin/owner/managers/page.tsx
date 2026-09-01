import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import ManagerListPanel from '@/components/ManagerListPanel/ManagerListPanel'
import { fetchManagers } from '@/queries/managers'
import { auth } from '@/auth'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { ApiManager } from '@/types/manager'

export const metadata = {
  title: 'Pythia — Managers (Owner Mirror)',
  description: 'Manage store managers in Owner View mirror for Super Admin.',
}

export default async function SuperAdminOwnerManagersMirrorPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  let initialData: ApiResponseV2Paginated<ApiManager[]> | null = null
  if (token) {
    const [managersResult] = await Promise.allSettled([
      fetchManagers({ token, skip: 0, limit: 15 }),
    ])
    if (managersResult.status === 'rejected') unstable_rethrow(managersResult.reason)
    if (managersResult.status === 'fulfilled') initialData = managersResult.value
  }

  return (
    <>
      <Header title="Managers (Mirror)" subtitle="Owner View" />

      <div className="px-[30px] py-[26px]">
        <ManagerListPanel initialData={initialData} />
      </div>
    </>
  )
}

