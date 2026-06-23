import Header from '@/components/shared/Header/Header'
import ProgressChart from '@/components/ProgressChart/ProgressChart'
import headerStyles from '@/components/shared/Header/Header.module.css'
import { PROGRESS_CHART_DATA } from '@/lib/progress-chart-data'
import { getWeekSubtitle } from '@/utils/common'

export default function ProgressPage() {
  const currentDate = new Date(2026, 5, 14) // replace with new Date() in production
  return (
    <>
      <Header title="My Progress" subtitle={getWeekSubtitle(currentDate)}>
        <button className={headerStyles.btnGhost}>View Last Week</button>
        <button className={headerStyles.btnAccent}>📣 Share My Score</button>
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
          <ProgressChart data={PROGRESS_CHART_DATA} />
      </div>
    </>
  )
}
