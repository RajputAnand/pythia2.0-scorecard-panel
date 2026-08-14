import type { AdminRole, KpiRegistryEntry, PageRegistryEntry } from '@/types/admin-config'

/**
 * Stable ids for every toggle-able KPI card / graph / panel in the app.
 * Consuming components import from here rather than hardcoding id strings,
 * so a rename only has to happen in one place.
 */
export const KPI_IDS = {
  // Employee · Overview
  employeeHeroMetrics: 'employeeOverview.heroMetrics',
  employeeProgressChart: 'employeeOverview.progressChart',
  employeeLeaderboard: 'employeeOverview.leaderboard',
  employeeCoachingMoments: 'employeeOverview.coachingMoments',
  employeeSwagStore: 'employeeOverview.swagStore',

  // Manager · Dashboard
  managerKpiGreeted: 'managerDashboard.kpi.greeted',
  managerKpiValueProposition: 'managerDashboard.kpi.valueProposition',
  managerKpiValidated: 'managerDashboard.kpi.validated',
  managerKpiThankYou: 'managerDashboard.kpi.thankYou',
  managerCoachingHealth: 'managerDashboard.coachingHealth',
  managerEmployeeSpotlight: 'managerDashboard.employeeSpotlight',
  managerLeaderboard: 'managerDashboard.leaderboard',
  managerTrendChart: 'managerDashboard.trendChart',
  managerUnknownIdentitiesAlert: 'managerDashboard.unknownIdentitiesAlert',

  // Manager · Coaching Tracker
  coachingWinRate: 'coachingTracker.winRate',
  coachingAvgTime: 'coachingTracker.avgTime',
  coachingAiStalled: 'coachingTracker.aiStalled',
  coachingInProgress: 'coachingTracker.inProgress',

  // Manager · Staffing Intelligence
  staffingCoverageGaps: 'staffing.coverageGaps',
  staffingFatigueFlags: 'staffing.fatigueFlags',
  staffingWeakPairings: 'staffing.weakPairings',
  staffingOptimizedShifts: 'staffing.optimizedShifts',

  // Owner · ROI Attribution
  roiHero: 'roi.hero',
  roiScoreVsTransactions: 'roi.scoreVsTransactions',
  roiHospitalityVsDwell: 'roi.hospitalityVsDwell',
  roiCheckoutSpeed: 'roi.checkoutSpeed',
  roiRevenueImpactTable: 'roi.revenueImpactTable',
  roiCostPerCoaching: 'roi.costPerCoaching',
  roiProjectionSummary: 'roi.projectionSummary',

  // Owner · Benchmarking
  benchmarkingRankHero: 'benchmarking.rankHero',
  benchmarkingRankMovement: 'benchmarking.rankMovement',
  benchmarkingNetworkLeaderboard: 'benchmarking.networkLeaderboard',
  benchmarkingStoreComparison: 'benchmarking.storeComparison',
  benchmarkingTopPractices: 'benchmarking.topPractices',

  // Owner · Marketing Loop
  marketingFootTraffic: 'marketing.insight.footTraffic',
  marketingBestChannel: 'marketing.insight.bestChannel',
  marketingFastestGrowingSegment: 'marketing.insight.fastestGrowingSegment',
  marketingActiveCampaigns: 'marketing.insight.activeCampaigns',
  marketingDemographicShifts: 'marketing.demographicShifts',
  marketingCustomerSegmentShifts: 'marketing.customerSegmentShifts',
  marketingSpendVsTraffic: 'marketing.spendVsTraffic',
  marketingCampaignCards: 'marketing.campaignCards',
} as const

/**
 * Stable ids for the sidebar-level "show this whole page" toggle — separate
 * from KPI_IDS, which controls individual cards/graphs within a page.
 */
export const PAGE_IDS = {
  employeeOverview: 'page.employeeOverview',
  managerDashboard: 'page.managerDashboard',
  managerCoachingTracker: 'page.managerCoachingTracker',
  managerStaffing: 'page.managerStaffing',
  ownerRoi: 'page.ownerRoi',
  ownerBenchmarking: 'page.ownerBenchmarking',
  ownerMarketing: 'page.ownerMarketing',
} as const

const EMPLOYEE_OVERVIEW = { role: 'employee' as const, page: 'Overview', pageHref: '/dashboard/overview' }
const MANAGER_DASHBOARD = { role: 'manager' as const, page: 'Dashboard', pageHref: '/manager/dashboard' }
const MANAGER_COACHING_TRACKER = { role: 'manager' as const, page: 'Coaching Tracker', pageHref: '/manager/coaching-tracker' }
const MANAGER_STAFFING = { role: 'manager' as const, page: 'Staffing Intelligence', pageHref: '/manager/staffing-intelligence' }
const OWNER_ROI = { role: 'owner' as const, page: 'ROI Attribution', pageHref: '/owner/roi-attribution' }
const OWNER_BENCHMARKING = { role: 'owner' as const, page: 'Benchmarking', pageHref: '/owner/benchmarking' }
const OWNER_MARKETING = { role: 'owner' as const, page: 'Marketing Loop', pageHref: '/owner/marketing-loop' }

export const KPI_REGISTRY: KpiRegistryEntry[] = [
  // Employee · Overview
  { id: KPI_IDS.employeeHeroMetrics, label: 'Hero Metrics Strip', description: 'Streak, score, and team-rank chips at the top of the overview page.', type: 'panel', ...EMPLOYEE_OVERVIEW },
  { id: KPI_IDS.employeeProgressChart, label: 'Progress Over Time Chart', description: "Line chart tracking the employee's score trend across recent weeks.", type: 'graph', ...EMPLOYEE_OVERVIEW },
  { id: KPI_IDS.employeeLeaderboard, label: 'Team Leaderboard', description: 'Team ranking panel shown on the employee overview and leaderboard pages.', type: 'panel', ...EMPLOYEE_OVERVIEW },
  { id: KPI_IDS.employeeCoachingMoments, label: 'Coaching Moments', description: "List of the employee's recent coaching moments and feedback.", type: 'panel', ...EMPLOYEE_OVERVIEW },
  { id: KPI_IDS.employeeSwagStore, label: 'Swag Store', description: 'Points balance and reward catalog employees can redeem points for.', type: 'panel', ...EMPLOYEE_OVERVIEW },

  // Manager · Dashboard
  { id: KPI_IDS.managerKpiGreeted, label: 'Greet Every Customer', description: 'Coaching checklist card tracking on-time greeting rate.', type: 'card', ...MANAGER_DASHBOARD },
  { id: KPI_IDS.managerKpiValueProposition, label: 'Add a Value Proposition', description: 'Coaching checklist card tracking value-proposition attach rate.', type: 'card', ...MANAGER_DASHBOARD },
  { id: KPI_IDS.managerKpiValidated, label: 'Validate the Purchase', description: 'Coaching checklist card tracking purchase-validation rate.', type: 'card', ...MANAGER_DASHBOARD },
  { id: KPI_IDS.managerKpiThankYou, label: 'Thank the Customer', description: 'Coaching checklist card tracking thank-you rate at close.', type: 'card', ...MANAGER_DASHBOARD },
  { id: KPI_IDS.managerCoachingHealth, label: 'Coaching Health Snapshot', description: 'Snapshot of overall coaching plan health for the team.', type: 'panel', ...MANAGER_DASHBOARD },
  { id: KPI_IDS.managerEmployeeSpotlight, label: 'Employee Spotlight', description: 'Highlight card for the top-performing employee this period.', type: 'panel', ...MANAGER_DASHBOARD },
  { id: KPI_IDS.managerLeaderboard, label: 'Manager Leaderboard', description: 'Team ranking panel shown on the manager dashboard.', type: 'panel', ...MANAGER_DASHBOARD },
  { id: KPI_IDS.managerTrendChart, label: 'Performance Trend Chart', description: 'Line chart tracking team performance trend over time.', type: 'graph', ...MANAGER_DASHBOARD },
  { id: KPI_IDS.managerUnknownIdentitiesAlert, label: 'Unknown Identities Alert', description: 'Alert card surfacing unresolved unknown-identity transactions.', type: 'panel', ...MANAGER_DASHBOARD },

  // Manager · Coaching Tracker
  { id: KPI_IDS.coachingWinRate, label: 'Team Win Rate', description: 'Share of coaching issues resolved this month.', type: 'card', ...MANAGER_COACHING_TRACKER },
  { id: KPI_IDS.coachingAvgTime, label: 'Avg. Time to Resolve', description: 'Average number of weeks to resolve a coaching issue.', type: 'card', ...MANAGER_COACHING_TRACKER },
  { id: KPI_IDS.coachingAiStalled, label: 'AI Stalled Issues', description: 'Count of issues flagged as stalled by the AI coach.', type: 'card', ...MANAGER_COACHING_TRACKER },
  { id: KPI_IDS.coachingInProgress, label: 'Issues In Progress', description: 'Count of coaching issues currently in progress.', type: 'card', ...MANAGER_COACHING_TRACKER },

  // Manager · Staffing Intelligence
  { id: KPI_IDS.staffingCoverageGaps, label: 'Coverage Gaps', description: 'Peak windows this week with no high-scorer scheduled.', type: 'card', ...MANAGER_STAFFING },
  { id: KPI_IDS.staffingFatigueFlags, label: 'Fatigue Flags', description: 'Employees showing score drops after long shifts.', type: 'card', ...MANAGER_STAFFING },
  { id: KPI_IDS.staffingWeakPairings, label: 'Weak Pairings', description: 'Shifts scheduled without a top performer present.', type: 'card', ...MANAGER_STAFFING },
  { id: KPI_IDS.staffingOptimizedShifts, label: 'Optimized Shifts', description: 'Days with strong coverage during peak hours.', type: 'card', ...MANAGER_STAFFING },

  // Owner · ROI Attribution
  { id: KPI_IDS.roiHero, label: 'ROI Summary Hero', description: 'Revenue impact, team score, platform cost, and net ROI shown together as one hero banner.', type: 'panel', ...OWNER_ROI },
  { id: KPI_IDS.roiScoreVsTransactions, label: 'Score vs Transactions Chart', description: 'Line chart comparing team score against transaction volume.', type: 'graph', ...OWNER_ROI },
  { id: KPI_IDS.roiHospitalityVsDwell, label: 'Hospitality vs Dwell Chart', description: 'Line chart comparing hospitality score against customer dwell time.', type: 'graph', ...OWNER_ROI },
  { id: KPI_IDS.roiCheckoutSpeed, label: 'Checkout Speed', description: 'Chart and stats tracking checkout speed over time.', type: 'graph', ...OWNER_ROI },
  { id: KPI_IDS.roiRevenueImpactTable, label: 'Revenue Impact Table', description: 'Detailed table breaking down revenue impact by driver.', type: 'panel', ...OWNER_ROI },
  { id: KPI_IDS.roiCostPerCoaching, label: 'Cost Per Coaching Moment', description: 'Per-employee table comparing coaching cost to performance gain.', type: 'panel', ...OWNER_ROI },
  { id: KPI_IDS.roiProjectionSummary, label: 'Revenue Projections Hero', description: 'Trajectory, target, breakeven, and annual ROI projections shown together as one hero banner.', type: 'panel', ...OWNER_ROI },

  // Owner · Benchmarking
  { id: KPI_IDS.benchmarkingRankHero, label: 'Rank Hero', description: "Store's overall rank badge, percentile, and metric chips.", type: 'panel', ...OWNER_BENCHMARKING },
  { id: KPI_IDS.benchmarkingRankMovement, label: 'Rank Movement', description: "Store's rank movement over recent periods.", type: 'panel', ...OWNER_BENCHMARKING },
  { id: KPI_IDS.benchmarkingNetworkLeaderboard, label: 'Network Leaderboard', description: 'Multi-column ranking table across the store network.', type: 'panel', ...OWNER_BENCHMARKING },
  { id: KPI_IDS.benchmarkingStoreComparison, label: 'Store Comparison', description: 'Metric-by-metric comparison against other stores.', type: 'panel', ...OWNER_BENCHMARKING },
  { id: KPI_IDS.benchmarkingTopPractices, label: 'Top Store Practices', description: 'Cards highlighting practices from top-performing stores.', type: 'panel', ...OWNER_BENCHMARKING },

  // Owner · Marketing Loop
  { id: KPI_IDS.marketingFootTraffic, label: 'Total Foot Traffic', description: 'Total foot traffic vs. the prior period.', type: 'card', ...OWNER_MARKETING },
  { id: KPI_IDS.marketingBestChannel, label: 'Best Channel', description: 'Highest traffic-per-dollar marketing channel.', type: 'card', ...OWNER_MARKETING },
  { id: KPI_IDS.marketingFastestGrowingSegment, label: 'Fastest Growing Segment', description: 'Customer segment with the fastest growth this period.', type: 'card', ...OWNER_MARKETING },
  { id: KPI_IDS.marketingActiveCampaigns, label: 'Active Campaigns', description: 'Count of currently active marketing campaigns.', type: 'card', ...OWNER_MARKETING },
  { id: KPI_IDS.marketingDemographicShifts, label: 'Demographic Shifts', description: 'Age and gender distribution shifts among customers.', type: 'panel', ...OWNER_MARKETING },
  { id: KPI_IDS.marketingCustomerSegmentShifts, label: 'Customer Segment Shifts', description: 'Shifts in customer segment composition over time.', type: 'panel', ...OWNER_MARKETING },
  { id: KPI_IDS.marketingSpendVsTraffic, label: 'Spend vs Traffic Chart', description: 'Chart comparing marketing spend against foot traffic.', type: 'graph', ...OWNER_MARKETING },
  { id: KPI_IDS.marketingCampaignCards, label: 'Campaign Cards', description: 'Cards summarizing each active marketing campaign.', type: 'panel', ...OWNER_MARKETING },
]

// One entry per sidebar-navigable page that has KPI/graph tracking — reuses
// the same role/page/pageHref groups as KPI_REGISTRY above so the two stay
// in sync. Sidebar nav items outside this system (Employees, Unknown
// Identities) aren't included — they're always shown.
export const PAGE_REGISTRY: PageRegistryEntry[] = [
  { id: PAGE_IDS.employeeOverview, ...EMPLOYEE_OVERVIEW },
  { id: PAGE_IDS.managerDashboard, ...MANAGER_DASHBOARD },
  { id: PAGE_IDS.managerCoachingTracker, ...MANAGER_COACHING_TRACKER },
  { id: PAGE_IDS.managerStaffing, ...MANAGER_STAFFING },
  { id: PAGE_IDS.ownerRoi, ...OWNER_ROI },
  { id: PAGE_IDS.ownerBenchmarking, ...OWNER_BENCHMARKING },
  { id: PAGE_IDS.ownerMarketing, ...OWNER_MARKETING },
]

/** Sidebar.tsx uses this to look up a nav item's page-level visibility id by its href. */
export const PAGE_ID_BY_HREF: Record<string, string> = Object.fromEntries(
  PAGE_REGISTRY.map((entry) => [entry.pageHref, entry.id])
)

/** adminConfigStore uses this to find which role's `ui_field_config` doc owns a given id. */
export const ROLE_BY_FIELD_ID: Record<string, AdminRole> = Object.fromEntries(
  [...KPI_REGISTRY, ...PAGE_REGISTRY].map((entry) => [entry.id, entry.role])
)
