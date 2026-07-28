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
    try {
      initialData = await fetchUnknownIdentities({ token, skip: 0, limit: 50 })
    } catch {
      // non-fatal — UnknownIdentitiesPanel renders an error state with retry
    }
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
