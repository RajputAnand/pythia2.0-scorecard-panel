import Header from '@/components/shared/Header/Header'
import headerStyles from '@/components/shared/Header/Header.module.css'
import StaffingInsightStrip from '@/components/StaffingInsightStrip/StaffingInsightStrip'
import StaffingPageContent from '@/components/StaffingPageContent/StaffingPageContent'

export const metadata = {
  title: 'Pythia — Staffing Intelligence',
  description: 'AI-powered staffing schedule with coverage gap detection, fatigue flags, and smart recommendations.',
}

export default function StaffingIntelligencePage() {
  return (
    <>
      <Header title="Staffing Intelligence" subtitle="Week of Feb 23 – Mar 1, 2026">
        <button className={headerStyles.btnGhost}>← Prev Week</button>
        <button className={headerStyles.btnGhost}>Next Week →</button>
        <button className={headerStyles.btnAccent}>Publish Schedule</button>
      </Header>

      <div className="px-[30px] py-6 flex flex-col gap-[18px]">
        <StaffingInsightStrip />
        <StaffingPageContent />
      </div>
    </>
  )
}
