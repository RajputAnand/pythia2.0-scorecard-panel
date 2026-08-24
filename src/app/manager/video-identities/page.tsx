import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import VideoRecognitionPanel from '@/components/VideoRecognitionPanel/VideoRecognitionPanel'
import { fetchVideoIdentities, fetchVideoIdentityStats } from '@/queries/video-identities'
import { auth } from '@/auth'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { VideoIdentityEntry, VideoIdentityStats } from '@/types/video-identity'

export const metadata = {
  title: 'Pythia — Video Identities',
  description: 'Review which employees the facial-recognition pipeline matched in each video.',
}

const PAGE_SIZE = 50

export default async function VideoIdentitiesPage() {
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
      <Header title="Video Identities" subtitle="Facial recognition pipeline review" />

      <div className="px-[30px] py-[26px]">
        <VideoRecognitionPanel initialData={initialData} initialStats={initialStats} />
      </div>
    </>
  )
}
