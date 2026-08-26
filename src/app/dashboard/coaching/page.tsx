import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import CoachingMoments from '@/components/CoachingMoments/CoachingMoments'
import headerStyles from '@/components/shared/Header/Header.module.css'
import { fetchCoachingMoments } from '@/queries/scorecard'
import { auth } from '@/auth'
import type { CoachingMoment } from '@/types/overview'
import { getWeekSubtitle } from '@/utils/common'

export default async function CoachingPage() {
  const currentDate = new Date(2026, 5, 14) // replace with new Date() in production

  const session = await auth()
  let coachingMoments: CoachingMoment[] = []
  let coachingGenerationInProgress = false
  if (session?.user?.pythia2Token) {
    const [coachingResult] = await Promise.allSettled([
      fetchCoachingMoments(session.user.pythia2Token)
    ])
    if (coachingResult.status === 'rejected') {
      unstable_rethrow(coachingResult.reason)
      console.log(coachingResult.reason)
    } else {
      coachingMoments = coachingResult.value.items
      coachingGenerationInProgress = coachingResult.value.generationInProgress
    }
  }

  return (
    <>
      <Header title="Coaching" subtitle={getWeekSubtitle(currentDate)}>
        <button className={headerStyles.btnGhost}>View Last Week</button>
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
          <CoachingMoments items={coachingMoments} generationInProgress={coachingGenerationInProgress} />
      </div>
    </>
  )
}
