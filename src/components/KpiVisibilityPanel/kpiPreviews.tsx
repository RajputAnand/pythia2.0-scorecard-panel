import type { ReactNode } from 'react'
import { KPI_IDS } from '@/lib/admin-config-data'
import {
  PREVIEW_MANAGER_DASHBOARD_SUMMARY,
  PREVIEW_COACHING_SUMMARY,
  PREVIEW_PROGRESS_DATA,
  PREVIEW_TEAM_RANKING,
  PREVIEW_COACHING_MOMENTS,
  PREVIEW_EMPLOYEE_ROWS,
  PREVIEW_TREND_WEEKS,
  PREVIEW_UNKNOWN_IDENTITIES_COUNT,
} from '@/lib/kpi-preview-data'

import { Metric } from '@/components/HeroBanner/HeroBanner'
import SwagStore from '@/components/SwagStore/SwagStore'
import ManagerDashboardKpiStrip from '@/components/ManagerDashboardKpiStrip/ManagerDashboardKpiStrip'
import CoachingWinStrip from '@/components/CoachingWinStrip/CoachingWinStrip'
import RoiHero from '@/components/RoiHero/RoiHero'
import ProjectionSummary from '@/components/ProjectionSummary/ProjectionSummary'
import MarketingInsightStrip from '@/components/MarketingInsightStrip/MarketingInsightStrip'
import StaffingInsightStrip from '@/components/StaffingInsightStrip/StaffingInsightStrip'
import ProgressChart from '@/components/ProgressChart/ProgressChart'
import Leaderboard from '@/components/Leaderboard/Leaderboard'
import CoachingMoments from '@/components/CoachingMoments/CoachingMoments'
import CoachingHealthSnapshot from '@/components/CoachingHealthSnapshot/CoachingHealthSnapshot'
import EmployeeSpotlightCard from '@/components/EmployeeSpotlightCard/EmployeeSpotlightCard'
import ManagerDashboardLeaderboard from '@/components/ManagerDashboardLeaderboard/ManagerDashboardLeaderboard'
import ManagerDashboardTrendChart from '@/components/ManagerDashboardTrendChart/ManagerDashboardTrendChart'
import UnknownIdentitiesAlertCard from '@/components/UnknownIdentitiesAlertCard/UnknownIdentitiesAlertCard'
import ScoreVsTransactions from '@/components/ScoreVsTransactions/ScoreVsTransactions'
import HospitalityVsDwell from '@/components/HospitalityVsDwell/HospitalityVsDwell'
import CheckoutSpeed from '@/components/CheckoutSpeed/CheckoutSpeed'
import RevenueImpactTable from '@/components/RevenueImpactTable/RevenueImpactTable'
import CostPerCoaching from '@/components/CostPerCoaching/CostPerCoaching'
import RankHero from '@/components/RankHero/RankHero'
import RankMovement from '@/components/RankMovement/RankMovement'
import NetworkLeaderboard from '@/components/NetworkLeaderboard/NetworkLeaderboard'
import StoreComparison from '@/components/StoreComparison/StoreComparison'
import TopStorePractices from '@/components/TopStorePractices/TopStorePractices'
import DemographicShifts from '@/components/DemographicShifts/DemographicShifts'
import CustomerSegmentShifts from '@/components/CustomerSegmentShifts/CustomerSegmentShifts'
import SpendVsTraffic from '@/components/SpendVsTraffic/SpendVsTraffic'
import CampaignCards from '@/components/CampaignCards/CampaignCards'

// Each preview renders the *real* component with realistic sample data (or,
// for self-contained components that already pull their own lib data, the
// component as-is) — so hovering a row shows exactly how it looks on the
// real page, not a mockup. Multiple registry ids that belong to the same
// visual unit (e.g. the 4 manager KPI cards) intentionally point at the
// same preview, since that's how they actually render together.

const heroMetricsPreview = (
  <div
    className="flex flex-wrap gap-[10px] rounded-2xl p-5"
    style={{ background: 'linear-gradient(135deg, #1A1714 0%, #1D3828 60%, #2D5A3A 100%)' }}
  >
    <Metric label="Hospitality" value="83" change="↑ +3 this week" valueColor="#78C99A" />
    <Metric label="Checkout Spd" value="85" change="This week" valueColor="#FFFFFF" />
    <Metric label="Time to Svc" value="79" change="↑ +2 this week" valueColor="#78C99A" />
    <Metric label="Shift Hours" value="32h" change="This week" />
  </div>
)

// previewMode bypasses each component's own admin-visibility check, so
// hovering an item that's currently toggled OFF still shows what it looks
// like when on — that's the whole point of a preview.
//
// For the "strip" components where several registry ids share one rendered
// instance (e.g. the 4 manager KPI cards), the preview is a function of the
// hovered id: it renders the full strip but passes highlightId so the
// specific card being previewed is spotlighted and its siblings are dimmed —
// otherwise hovering "Greet Every Customer" would show all 4 cards at equal
// weight with no indication of which one that row actually controls.
const managerKpiStripPreview = (id: string) => <ManagerDashboardKpiStrip summary={PREVIEW_MANAGER_DASHBOARD_SUMMARY} previewMode highlightId={id} />
const coachingWinStripPreview = (id: string) => <CoachingWinStrip summary={PREVIEW_COACHING_SUMMARY} previewMode highlightId={id} />
const marketingInsightStripPreview = (id: string) => <MarketingInsightStrip previewMode highlightId={id} />
const staffingInsightStripPreview = (id: string) => <StaffingInsightStrip previewMode highlightId={id} />

const coachingHealthPreview = <CoachingHealthSnapshot summary={PREVIEW_COACHING_SUMMARY} previewMode />
const employeeSpotlightPreview = <EmployeeSpotlightCard topEmployee={PREVIEW_EMPLOYEE_ROWS[0]} view="week" previewMode />
const managerLeaderboardPreview = <ManagerDashboardLeaderboard initialEmployees={PREVIEW_EMPLOYEE_ROWS.slice(0, 2)} initialView="week" previewMode />
const trendChartPreview = <ManagerDashboardTrendChart weeks={PREVIEW_TREND_WEEKS} previewMode />
const unknownIdentitiesPreview = <UnknownIdentitiesAlertCard count={PREVIEW_UNKNOWN_IDENTITIES_COUNT} previewMode />
const progressChartPreview = <ProgressChart data={PREVIEW_PROGRESS_DATA} previewMode />
const leaderboardPreview = <Leaderboard data={{ ...PREVIEW_TEAM_RANKING, members: PREVIEW_TEAM_RANKING.members.slice(0, 2) }} previewMode />
const coachingMomentsPreview = <CoachingMoments items={PREVIEW_COACHING_MOMENTS} previewMode />

const KPI_PREVIEW_RENDERERS: Record<string, (id: string) => ReactNode> = {
  [KPI_IDS.employeeHeroMetrics]: () => heroMetricsPreview,
  [KPI_IDS.employeeProgressChart]: () => progressChartPreview,
  [KPI_IDS.employeeLeaderboard]: () => leaderboardPreview,
  [KPI_IDS.employeeCoachingMoments]: () => coachingMomentsPreview,
  [KPI_IDS.employeeSwagStore]: () => <SwagStore previewMode />,

  [KPI_IDS.managerKpiGreeted]: managerKpiStripPreview,
  [KPI_IDS.managerKpiValueProposition]: managerKpiStripPreview,
  [KPI_IDS.managerKpiValidated]: managerKpiStripPreview,
  [KPI_IDS.managerKpiThankYou]: managerKpiStripPreview,
  [KPI_IDS.managerCoachingHealth]: () => coachingHealthPreview,
  [KPI_IDS.managerEmployeeSpotlight]: () => employeeSpotlightPreview,
  [KPI_IDS.managerLeaderboard]: () => managerLeaderboardPreview,
  [KPI_IDS.managerTrendChart]: () => trendChartPreview,
  [KPI_IDS.managerUnknownIdentitiesAlert]: () => unknownIdentitiesPreview,
  [KPI_IDS.managerDemographicShifts]: () => <DemographicShifts previewMode />,
  [KPI_IDS.managerCustomerSegmentShifts]: () => <CustomerSegmentShifts previewMode />,

  [KPI_IDS.coachingWinRate]: coachingWinStripPreview,
  [KPI_IDS.coachingAvgTime]: coachingWinStripPreview,
  [KPI_IDS.coachingAiStalled]: coachingWinStripPreview,
  [KPI_IDS.coachingInProgress]: coachingWinStripPreview,

  [KPI_IDS.staffingCoverageGaps]: staffingInsightStripPreview,
  [KPI_IDS.staffingFatigueFlags]: staffingInsightStripPreview,
  [KPI_IDS.staffingWeakPairings]: staffingInsightStripPreview,
  [KPI_IDS.staffingOptimizedShifts]: staffingInsightStripPreview,

  [KPI_IDS.roiHero]: () => <RoiHero previewMode />,
  [KPI_IDS.roiScoreVsTransactions]: () => <ScoreVsTransactions previewMode />,
  [KPI_IDS.roiHospitalityVsDwell]: () => <HospitalityVsDwell previewMode />,
  [KPI_IDS.roiCheckoutSpeed]: () => <CheckoutSpeed previewMode />,
  [KPI_IDS.roiRevenueImpactTable]: () => <RevenueImpactTable previewMode />,
  [KPI_IDS.roiCostPerCoaching]: () => <CostPerCoaching previewMode />,
  [KPI_IDS.roiProjectionSummary]: () => <ProjectionSummary previewMode />,

  [KPI_IDS.benchmarkingRankHero]: () => <RankHero previewMode />,
  [KPI_IDS.benchmarkingRankMovement]: () => <RankMovement previewMode />,
  [KPI_IDS.benchmarkingNetworkLeaderboard]: () => <NetworkLeaderboard previewMode />,
  [KPI_IDS.benchmarkingStoreComparison]: () => <StoreComparison previewMode />,
  [KPI_IDS.benchmarkingTopPractices]: () => <TopStorePractices previewMode />,

  [KPI_IDS.marketingFootTraffic]: marketingInsightStripPreview,
  [KPI_IDS.marketingBestChannel]: marketingInsightStripPreview,
  [KPI_IDS.marketingFastestGrowingSegment]: marketingInsightStripPreview,
  [KPI_IDS.marketingActiveCampaigns]: marketingInsightStripPreview,
  [KPI_IDS.marketingSpendVsTraffic]: () => <SpendVsTraffic previewMode />,
  [KPI_IDS.marketingCampaignCards]: () => <CampaignCards previewMode />,
}

export function getKpiPreview(id: string): ReactNode {
  const render = KPI_PREVIEW_RENDERERS[id]
  return render ? render(id) : null
}
