import Header from '@/components/shared/Header/Header'
import HeroBanner from '@/components/HeroBanner/HeroBanner'
import CoachingMoments from '@/components/CoachingMoments/CoachingMoments'
import ProgressChart from '@/components/ProgressChart/ProgressChart'
import Leaderboard from '@/components/Leaderboard/Leaderboard'
import SwagStore from '@/components/SwagStore/SwagStore'
import KpiVisibilityGate from '@/components/shared/KpiVisibilityGate/KpiVisibilityGate'
import { KPI_IDS } from '@/lib/admin-config-data'
import {
  PREVIEW_HERO_BANNER_DATA,
  PREVIEW_WEEKLY_STATS,
  PREVIEW_COACHING_MOMENTS,
  PREVIEW_PROGRESS_DATA,
  PREVIEW_TEAM_RANKING,
} from '@/lib/kpi-preview-data'

export const metadata = {
  title: 'Pythia — Employee Overview (Super Admin)',
  description: 'Super Admin static preview of the Employee Overview page.',
}

// Static preview of /dashboard/overview for the Super Admin panel — renders
// the real employee-facing components with sample data, the same convention
// used by KpiVisibilityPanel's hover previews. Not wired to live
// per-employee data yet.
//
// Deliberately does NOT pass `previewMode` to CoachingMoments/Leaderboard/
// ProgressChart — that prop bypasses a component's own KPI-visibility check,
// which is right for the admin's "preview a hidden card" hover but wrong
// here: a KPI/page the Super Admin has toggled off for employees should stay
// hidden in this mirror too, so these render with their normal visibility
// check intact. SwagStore is the one exception — its `previewMode` also
// swaps in a static catalog (avoiding a real fetch), so it's kept on and
// gated separately via KpiVisibilityGate instead.
export default function SuperAdminEmployeeOverviewPage() {
  return (
    <>
      <Header title="My Dashboard" subtitle="Super Admin · Sample data preview" />

      <div className="grid px-[30px] py-[24px] gap-5">
        <HeroBanner data={PREVIEW_HERO_BANNER_DATA} weeklyStats={PREVIEW_WEEKLY_STATS} />

        <div className="grid grid-cols-2 items-start gap-[18px]">
          <CoachingMoments items={PREVIEW_COACHING_MOMENTS} />
          <Leaderboard data={PREVIEW_TEAM_RANKING} />
        </div>

        <ProgressChart data={PREVIEW_PROGRESS_DATA} />

        <KpiVisibilityGate id={KPI_IDS.employeeSwagStore}>
          <SwagStore previewMode />
        </KpiVisibilityGate>
      </div>
    </>
  )
}
