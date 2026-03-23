import Header from '@/components/Header/Header'
import HeroBanner from '@/components/HeroBanner/HeroBanner'
import ShiftSummary from '@/components/ShiftSummary/ShiftSummary'
import CoachingMoments from '@/components/CoachingMoments/CoachingMoments'
import ProgressChart from '@/components/ProgressChart/ProgressChart'
import Leaderboard from '@/components/Leaderboard/Leaderboard'
import SwagStore from '@/components/SwagStore/SwagStore'
import headerStyles from '@/components/Header/Header.module.css'
import styles from './page.module.css'

export default function OverviewPage() {
  return (
    <>
      <Header title="My Dashboard" subtitle="Week of Feb 23 – Mar 1, 2026">
        <button className={headerStyles.btnGhost}>View Last Week</button>
        <button className={headerStyles.btnAccent}>📣 Share My Score</button>
      </Header>

      <div className={styles.content}>
        <HeroBanner />

        <div className={styles.twoCol}>
          <ShiftSummary />
          <CoachingMoments />
        </div>

        <div className={styles.twoCol}>
          <ProgressChart />
          <Leaderboard />
        </div>

        <SwagStore />
      </div>
    </>
  )
}
