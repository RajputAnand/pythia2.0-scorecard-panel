import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import VideoRecognitionPanel from '@/components/VideoRecognitionPanel/VideoRecognitionPanel'
import { fetchVideoIdentities, fetchVideoIdentityStats } from '@/queries/video-identities'
import { auth } from '@/auth'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { VideoIdentityEntry, VideoIdentityStats } from '@/types/video-identity'

export const metadata = {
  title: 'Pythia — Video Identities (Super Admin)',
  description: 'Super Admin read-only mirror of the Video Identities page.',
}

const PAGE_SIZE = 50

// Read-only mirror of /manager/video-identities for the Super Admin panel —
// same queries/components as the manager page, called with the super admin's
// own session token so the admin can see the same real data managers see.
export default async function SuperAdminVideoIdentitiesPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  let initialData: ApiResponseV2Paginated<VideoIdentityEntry[]> | null = null
  let initialStats: VideoIdentityStats | null = null

  if (token) {
    const results = await Promise.allSettled([
      fetchVideoIdentities({ token, skip: 0, limit: PAGE_SIZE }),
      fetchVideoIdentityStats({ token }),
    ])
    for (const result of results) {
      if (result.status === 'rejected') unstable_rethrow(result.reason)
    }
    if (results[0].status === 'fulfilled') initialData = results[0].value
    if (results[1].status === 'fulfilled') initialStats = results[1].value
  }

  return (
    <>
      <Header title="Video Identities" subtitle="Super Admin · Facial recognition pipeline review" />

      <div className="px-[30px] py-[26px]">
        <VideoRecognitionPanel initialData={initialData} initialStats={initialStats} />
      </div>
    </>
  )
}
