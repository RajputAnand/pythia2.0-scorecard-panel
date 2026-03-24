import Header from '@/components/shared/Header/Header'
import HeroBanner from '@/components/HeroBanner/HeroBanner'
import ShiftSummary from '@/components/ShiftSummary/ShiftSummary'
import CoachingMoments from '@/components/CoachingMoments/CoachingMoments'
import ProgressChart from '@/components/ProgressChart/ProgressChart'
import Leaderboard from '@/components/Leaderboard/Leaderboard'
import SwagStore from '@/components/SwagStore/SwagStore'
import headerStyles from '@/components/shared/Header/Header.module.css'
import { fakeGetOverview } from '@/mock/overviewAPIs'

export default async function OverviewPage() {
  const data = await fakeGetOverview()

  return (
    <>
      <Header title="My Dashboard" subtitle="Week of Feb 23 – Mar 1, 2026">
        <button className={headerStyles.btnGhost}>View Last Week</button>
        <button className={headerStyles.btnAccent}>📣 Share My Score</button>
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
        <HeroBanner data={data.heroBanner} />

        <div className="grid grid-cols-2 items-start gap-[18px]">
          <ShiftSummary data={data.shiftSummary} />
          <CoachingMoments items={data.coachingItems} />
        </div>

        <div className="grid grid-cols-2 items-start gap-[18px]">
          <ProgressChart data={data.progressChart} />
          <Leaderboard data={data.leaderboard} />
        </div>

        <SwagStore />
      </div>
    </>
  )
}
