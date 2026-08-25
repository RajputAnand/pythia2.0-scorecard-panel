import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import UnknownIdentitiesPanel from '@/components/UnknownIdentitiesPanel/UnknownIdentitiesPanel'
import { fetchUnknownIdentities } from '@/queries/unknown-identities'
import { auth } from '@/auth'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { UnknownIdentity } from '@/types/unknown-identity'

export const metadata = {
  title: 'Pythia — Unknown Identities',
  description: 'Review unresolved in-store detections and assign them to a known employee.',
}

export default async function UnknownIdentitiesPage() {
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
      <Header title="Unknown Identity" subtitle="Resolve unmatched in-store detections" />

      <div className="px-[30px] py-[26px]">
        <UnknownIdentitiesPanel initialData={initialData} />
      </div>
    </>
  )
}
