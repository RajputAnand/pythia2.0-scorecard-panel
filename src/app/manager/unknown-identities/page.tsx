import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import Header from '@/components/shared/Header/Header'
import UnknownIdentitiesPanel from '@/components/UnknownIdentitiesPanel/UnknownIdentitiesPanel'
import { fetchUnknownIdentities } from '@/queries/unknown-identities'
import { queryKeys } from '@/queries/keys'
import { auth } from '@/auth'

export const metadata = {
  title: 'Pythia — Unknown Identities',
  description: 'Review unresolved in-store detections and assign them to a known employee.',
}

export default async function UnknownIdentitiesPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token
  const queryClient = new QueryClient()

  if (token) {
    try {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.unknownIdentities.list(),
        queryFn: () => fetchUnknownIdentities({ token }),
      })
    } catch {
      // non-fatal — UnknownIdentitiesPanel renders an error state with retry
    }
  }

  return (
    <>
      <Header title="Unknown Identity" subtitle="Resolve unmatched in-store detections" />

      <div className="px-[30px] py-[26px]">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <UnknownIdentitiesPanel />
        </HydrationBoundary>
      </div>
    </>
  )
}
