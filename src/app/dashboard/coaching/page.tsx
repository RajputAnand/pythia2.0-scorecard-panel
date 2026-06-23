import Header from '@/components/shared/Header/Header'
import CoachingMoments from '@/components/CoachingMoments/CoachingMoments'
import headerStyles from '@/components/shared/Header/Header.module.css'
import { COACHING_ITEMS } from '@/lib/coaching-item-data'
import { getWeekSubtitle } from '@/utils/common'

export default function CoachingPage() {
  const currentDate = new Date(2026, 5, 14) // replace with new Date() in production
  return (
    <>
      <Header title="Coaching" subtitle={getWeekSubtitle(currentDate)}>
        <button className={headerStyles.btnGhost}>View Last Week</button>
        <button className={headerStyles.btnAccent}>📣 Share My Score</button>
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
          <CoachingMoments items={COACHING_ITEMS} />
      </div>
    </>
  )
}
