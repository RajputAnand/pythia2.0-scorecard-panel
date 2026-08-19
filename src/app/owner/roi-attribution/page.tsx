import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import headerStyles from '@/components/shared/Header/Header.module.css'
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

export default async function RoiAttributionPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const session = await auth()
  const token = session?.user?.pythia2Token

  let data: RoiAttributionResponse | null = null
  let error: string | null = null

  if (token) {
    try {
      const viewMap: Record<string, RoiAttributionParams['view']> = {
        'Actuals + Projected': 'both',
        'Actuals Only': 'actual',
        'Projected Only': 'projected',
      }
      
      const viewParam = typeof searchParams.view === 'string' ? searchParams.view : undefined
      const viewKey = viewParam && viewMap[viewParam] ? viewMap[viewParam] : 'both'

      const periodMap: Record<string, RoiAttributionParams['period_type']> = {
        'This Week': 'week',
        'Month over Month': 'month',
        'Quarter': 'quarter',
        'custom': 'custom',
      }

      const periodParam = typeof searchParams.period === 'string' ? searchParams.period : undefined
      const isCustom = typeof searchParams.custom_start === 'string' && typeof searchParams.custom_end === 'string'
      
      const periodKey = isCustom ? 'custom' : (periodParam && periodMap[periodParam] ? periodMap[periodParam] : 'month')

      data = await fetchRoiAttribution({
        token,
        period_type: periodKey,
        custom_start: typeof searchParams.custom_start === 'string' ? searchParams.custom_start : undefined,
        custom_end: typeof searchParams.custom_end === 'string' ? searchParams.custom_end : undefined,
        view: viewKey,
      })
    } catch (e: any) {
      unstable_rethrow(e)
      console.error(e)
      error = e.response?.data?.message || e.message || 'Failed to load ROI data'
    }
  }

  return (
    <>
      <Header title="ROI Attribution" subtitle={data?.meta?.period?.label ?? 'Loading...'}>
        <button className={headerStyles.btnGhost}>Export PDF</button>
        <button className={headerStyles.btnPrimary}>Share with Investor</button>
      </Header>

      <TimeControls />

      <div className="grid px-[30px] py-[24px] gap-5">
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
