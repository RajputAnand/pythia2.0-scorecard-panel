import Header from '@/components/shared/Header/Header'
import ProgressChart from '@/components/ProgressChart/ProgressChart'
import headerStyles from '@/components/shared/Header/Header.module.css'

export default function ProgressPage() {
  return (
    <>
      <Header title="My Progress" subtitle="Week of Feb 23 – Mar 1, 2026">
        <button className={headerStyles.btnGhost}>View Last Week</button>
        <button className={headerStyles.btnAccent}>📣 Share My Score</button>
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
          <ProgressChart />
      </div>
    </>
  )
}
