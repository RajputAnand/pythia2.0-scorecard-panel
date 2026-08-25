import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import UnknownIdentitiesPanel from '@/components/UnknownIdentitiesPanel/UnknownIdentitiesPanel'
import { fetchUnknownIdentities } from '@/queries/unknown-identities'
import { auth } from '@/auth'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { UnknownIdentity } from '@/types/unknown-identity'

export const metadata = {
  title: 'Pythia — Unknown Identities (Super Admin)',
  description: 'Super Admin read-only mirror of the Unknown Identities page.',
}

// Read-only mirror of /manager/unknown-identities for the Super Admin panel —
// same query/component as the manager page, called with the super admin's
// own session token so the admin can see the same real data managers see.
export default async function SuperAdminUnknownIdentitiesPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  let initialData: ApiResponseV2Paginated<UnknownIdentity[]> | null = null
  if (token) {
    const [unknownIdentitiesResult] = await Promise.allSettled([
      fetchUnknownIdentities({ token, skip: 0, limit: 50 }),
    ])
    if (unknownIdentitiesResult.status === 'rejected') unstable_rethrow(unknownIdentitiesResult.reason)
    if (unknownIdentitiesResult.status === 'fulfilled') initialData = unknownIdentitiesResult.value
  }

  return (
    <>
      <Header title="Unknown Identity" subtitle="Super Admin · Resolve unmatched in-store detections" />

      <div className="px-[30px] py-[26px]">
        <UnknownIdentitiesPanel initialData={initialData} />
      </div>
    </>
  )
}
