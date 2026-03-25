import Header from '@/components/shared/Header/Header'
import CoachingMoments from '@/components/CoachingMoments/CoachingMoments'
import headerStyles from '@/components/shared/Header/Header.module.css'
import { COACHING_ITEMS } from '@/lib/coaching-item-data'

export default function CoachingPage() {
  return (
    <>
      <Header title="Coaching" subtitle="Week of Feb 23 – Mar 1, 2026">
        <button className={headerStyles.btnGhost}>View Last Week</button>
        <button className={headerStyles.btnAccent}>📣 Share My Score</button>
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
          <CoachingMoments items={COACHING_ITEMS} />
      </div>
    </>
  )
}
