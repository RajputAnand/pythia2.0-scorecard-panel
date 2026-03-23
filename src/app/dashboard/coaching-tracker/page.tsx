import Header from '@/components/Header/Header'
import headerStyles from '@/components/Header/Header.module.css'
import CoachingWinStrip from '@/components/CoachingWinStrip/CoachingWinStrip'
import CoachingTrackerPanel from '@/components/CoachingTrackerPanel/CoachingTrackerPanel'

export const metadata = {
  title: 'Pythia — Coaching Effectiveness Tracker',
  description: 'Track coaching effectiveness, issue resolution rates, and employee progress.',
}

export default function CoachingTrackerPage() {
  return (
    <>
      <Header title="Coaching Effectiveness Tracker" subtitle="Week of Feb 17–23, 2026">
        <button className={headerStyles.btnGhost}>Export</button>
        <button className={headerStyles.btnPrimary}>All Time View</button>
      </Header>

      <div className="px-[30px] py-[26px] flex flex-col gap-5">
        <CoachingWinStrip />
        <CoachingTrackerPanel />
      </div>
    </>
  )
}
