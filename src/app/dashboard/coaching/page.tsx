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
    try {
      const coaching = await fetchCoachingMoments(session.user.pythia2Token)
      coachingMoments = coaching.items
      coachingGenerationInProgress = coaching.generationInProgress
    } catch (err) {
      unstable_rethrow(err) // let a session-expiry redirect from the client propagate
      console.log(err)
      // non-fatal — CoachingMoments renders an empty list when empty
    }
  }

  return (
    <>
      <Header title="Coaching" subtitle={getWeekSubtitle(currentDate)}>
        <button className={headerStyles.btnGhost}>View Last Week</button>
        <button className={headerStyles.btnAccent}>📣 Share My Score</button>
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
          <CoachingMoments items={coachingMoments} generationInProgress={coachingGenerationInProgress} />
      </div>
    </>
  )
}
