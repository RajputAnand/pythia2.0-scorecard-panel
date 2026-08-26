import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import ExportPdfButton from '@/components/shared/ExportPdfButton/ExportPdfButton'
import ShareWithInvestorButton from '@/components/shared/ShareWithInvestorButton/ShareWithInvestorButton'
import TimeControls from '@/components/TimeControls/TimeControls'
import RoiHero from '@/components/RoiHero/RoiHero'
import ScoreVsTransactions from '@/components/ScoreVsTransactions/ScoreVsTransactions'
import HospitalityVsDwell from '@/components/HospitalityVsDwell/HospitalityVsDwell'
import CheckoutSpeed from '@/components/CheckoutSpeed/CheckoutSpeed'
import RevenueImpactTable from '@/components/RevenueImpactTable/RevenueImpactTable'
import CostPerCoaching from '@/components/CostPerCoaching/CostPerCoaching'
import ProjectionSummary from '@/components/ProjectionSummary/ProjectionSummary'
import { fetchRoiAttribution } from '@/queries/owner-roi'
import { auth } from '@/auth'
import type { RoiAttributionResponse, RoiAttributionParams } from '@/types/owner-roi'

export const metadata = {
  title: 'Pythia — ROI Attribution (Super Admin)',
  description: 'Super Admin read-only mirror of the Owner ROI Attribution page.',
}

// Read-only mirror of /owner/roi-attribution for the Super Admin panel — same
// query/components as the owner page, called with the super admin's own
// session token so the admin can see the same real data owners see.
export default async function SuperAdminRoiAttributionPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const session = await auth()
  const token = session?.user?.pythia2Token

  let data: RoiAttributionResponse | null = null
  let error: string | null = null

  if (token) {
    const periodMap: Record<string, RoiAttributionParams['period_type']> = {
      'This Week': 'week',
      'Month over Month': 'month',
      'Quarter': 'quarter',
      'custom': 'custom',
    }

    const periodParam = typeof searchParams.period === 'string' ? searchParams.period : undefined
    const isCustom = typeof searchParams.custom_start === 'string' && typeof searchParams.custom_end === 'string'

    const periodKey = isCustom ? 'custom' : (periodParam && periodMap[periodParam] ? periodMap[periodParam] : 'month')

    const [roiResult] = await Promise.allSettled([
      fetchRoiAttribution({
        token,
        period_type: periodKey,
        custom_start: typeof searchParams.custom_start === 'string' ? searchParams.custom_start : undefined,
        custom_end: typeof searchParams.custom_end === 'string' ? searchParams.custom_end : undefined,
        view: 'both',
      })
    ])

    if (roiResult.status === 'rejected') {
      unstable_rethrow(roiResult.reason)
      console.error(roiResult.reason)
      error = roiResult.reason?.response?.data?.message || roiResult.reason?.message || 'Failed to load ROI data'
    } else {
      data = roiResult.value
    }
  }

  const periodSlug = (data?.meta?.period?.label ?? 'report')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return (
    <>
      <Header title="ROI Attribution" subtitle="Super Admin">
        <ExportPdfButton targetId="roi-report-content" fileName={`roi-attribution-${periodSlug}-super-admin`} />
        <ShareWithInvestorButton targetId="roi-report-content" fileName={`roi-attribution-${periodSlug}-super-admin`} />
      </Header>

      <TimeControls />

      <div id="roi-report-content" className="grid px-[30px] py-[24px] gap-5">
        {error ? (
          <div className="bg-surface border border-border rounded-lg p-6 text-red-400">
            {error}
          </div>
        ) : !data ? (
          <div className="text-secondary p-6">Loading ROI data...</div>
        ) : (
          <>
            <RoiHero data={data.hero} />

            <div className="grid grid-cols-2 gap-4">
              <ScoreVsTransactions data={data.charts.score_vs_transactions} />
              <HospitalityVsDwell data={data.charts.hospitality_vs_dwell} />
            </div>

            <CheckoutSpeed data={data.charts.checkout_vs_throughput} />
            <RevenueImpactTable
              data={data.revenue_impact_table}
            />
            <CostPerCoaching
              coachingData={data.coaching_efficiency}
              summary={data.coaching_efficiency_summary}
            />
            <ProjectionSummary data={data.projection_summary} />
          </>
        )}
      </div>
    </>
  )
}
