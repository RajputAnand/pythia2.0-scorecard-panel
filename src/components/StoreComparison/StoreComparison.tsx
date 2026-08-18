'use client'

import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'
import { SelectedStoreBenchmarkingData } from '@/types/benchmarking'

interface MetricRowProps {
  label: string
  shortLabel: string
  yoursScore: number
  yoursColor: string
  gap: string
  gapVariant: 'behind' | 'ahead'
  theirsScore: number
  isLast?: boolean
}

function MetricRow({ label, shortLabel, yoursScore, yoursColor, gap, gapVariant, theirsScore, isLast }: MetricRowProps) {
  const borderB = isLast ? '' : 'border-b border-border'
  return (
    <>
      <div className={`flex flex-col gap-[6px] px-[22px] py-[14px] bg-[#FAFDF8] ${borderB}`}>
        <div className="text-[9.5px] font-semibold text-muted uppercase tracking-[.08em]">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[26px] font-bold leading-none" style={{ color: yoursColor }}>{yoursScore}</span>
          <span className={`font-mono text-[11.5px] font-semibold ${gapVariant === 'behind' ? 'text-amber' : 'text-accent'}`}>{gap}</span>
        </div>
        <div className="h-[6px] bg-surface-alt rounded overflow-hidden mt-1">
          <div className="h-full rounded" style={{ width: `${yoursScore}%`, background: yoursColor }} />
        </div>
      </div>
      <div className={`flex items-center justify-center border-l border-r border-border ${borderB}`}>
        <span className="text-[9px] font-semibold text-muted uppercase tracking-[.07em] [writing-mode:vertical-rl] rotate-180">
          {shortLabel}
        </span>
      </div>
      <div className={`flex flex-col gap-[6px] px-[22px] py-[14px] bg-[#FDFCF4] ${borderB}`}>
        <div className="text-[9.5px] font-semibold text-muted uppercase tracking-[.08em]">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[26px] font-bold leading-none text-gold">{theirsScore}</span>
        </div>
        <div className="h-[6px] bg-surface-alt rounded overflow-hidden mt-1">
          <div className="h-full rounded bg-gold" style={{ width: `${theirsScore}%` }} />
        </div>
      </div>
    </>
  )
}

interface StoreComparisonProps {
  previewMode?: boolean
  data?: SelectedStoreBenchmarkingData | null
  loading?: boolean
}

export default function StoreComparison({ previewMode, data, loading }: StoreComparisonProps = {}) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.benchmarkingStoreComparison] ?? true)
  if (!previewMode && !visible) return null

  // Helpers to get metric values
  const getYours = (key: 'overall' | 'hospitality' | 'checkout' | 'time_to_svc') => {
    if (previewMode) {
      if (key === 'overall') return 84
      if (key === 'hospitality') return 86
      if (key === 'checkout') return 79
      if (key === 'time_to_svc') return 82
    }
    return data?.[key] ?? 0
  }

  const getTheirs = (key: 'overall' | 'hospitality' | 'checkout' | 'time_to_svc') => {
    if (previewMode) {
      if (key === 'overall') return 94
      if (key === 'hospitality') return 82
      if (key === 'checkout') return 96
      if (key === 'time_to_svc') return 93
    }
    return data?.top_performer?.[key] ?? 0
  }

  const getGap = (key: 'overall' | 'hospitality' | 'checkout' | 'time_to_svc') => {
    if (previewMode) {
      if (key === 'overall') return { text: '10 behind', variant: 'behind' as const }
      if (key === 'hospitality') return { text: '4 ahead', variant: 'ahead' as const }
      if (key === 'checkout') return { text: '17 behind', variant: 'behind' as const }
      if (key === 'time_to_svc') return { text: '11 behind', variant: 'behind' as const }
    }
    const gapVal = data?.gaps?.[key]
    if (gapVal === undefined || gapVal === null) return { text: 'N/A', variant: 'behind' as const }
    return {
      text: `${Math.abs(gapVal)} ${gapVal >= 0 ? 'ahead' : 'behind'}`,
      variant: (gapVal >= 0 ? 'ahead' : 'behind') as 'ahead' | 'behind'
    }
  }

  return (
    <div className={`grid grid-cols-[1fr_60px_1fr] bg-surface border border-border rounded-[14px] overflow-hidden transition-opacity ${loading ? 'opacity-50' : ''}`}>

      {/* Header row */}
      <div className="flex flex-col px-[22px] py-[18px] gap-1 border-b border-border bg-accent-light">
        <div className="text-[10px] font-semibold uppercase tracking-[.1em] text-accent">Your Store</div>
        <div className="text-[15px] font-bold">{data?.store_id ? `Store #${data.store_id.slice(-4)}` : (previewMode ? 'Main St. Store' : 'N/A')}</div>
        <div className="font-mono text-[11.5px] text-muted">{data?.rank ? `Rank #${data.rank}` : (previewMode ? 'Rank #3' : 'N/A')}</div>
      </div>
      <div className="flex items-center justify-center border-b border-border border-l border-r bg-surface-alt">
        <span className="text-[9px] font-semibold text-muted uppercase tracking-[.07em] [writing-mode:vertical-rl] rotate-180">vs.</span>
      </div>
      <div className="flex flex-col px-[22px] py-[18px] gap-1 border-b border-border bg-gold-light">
        <div className="text-[10px] font-semibold uppercase tracking-[.1em] text-gold">Top Performer</div>
        <div className="text-[15px] font-bold">{data?.top_performer?.store_id ? `Store #${data.top_performer.store_id.slice(-4)}` : (previewMode ? 'Store #14' : 'N/A')}</div>
        <div className="font-mono text-[11.5px] text-muted">{data?.top_performer?.rank ? `Rank #${data.top_performer.rank}` : (previewMode ? 'Rank #1' : 'N/A')}</div>
      </div>

      {/* Metric rows */}
      <MetricRow
        label="Overall Score" shortLabel="Overall"
        yoursScore={getYours('overall')} yoursColor="#C47F18" gap={getGap('overall').text} gapVariant={getGap('overall').variant}
        theirsScore={getTheirs('overall')}
      />
      <MetricRow
        label="Hospitality" shortLabel="Hosp"
        yoursScore={getYours('hospitality')} yoursColor="#1D5C3A" gap={getGap('hospitality').text} gapVariant={getGap('hospitality').variant}
        theirsScore={getTheirs('hospitality')}
      />
      <MetricRow
        label="Checkout Speed" shortLabel="Checkout"
        yoursScore={getYours('checkout')} yoursColor="#C47F18" gap={getGap('checkout').text} gapVariant={getGap('checkout').variant}
        theirsScore={getTheirs('checkout')}
      />
      <MetricRow
        label="Time to Service" shortLabel="Time to Svc"
        yoursScore={getYours('time_to_svc')} yoursColor="#1D5C3A" gap={getGap('time_to_svc').text} gapVariant={getGap('time_to_svc').variant}
        theirsScore={getTheirs('time_to_svc')}
        isLast
      />

      {/* Insight row */}
      <div className="col-span-full px-[22px] py-3 text-[12px] text-secondary leading-[1.5] bg-surface-alt border-t border-border">
        {data?.gaps?.biggest_gap_metric && data?.gaps?.biggest_gap_value !== null ? (
          <><strong className="font-semibold text-primary">Biggest gap: {data.gaps.biggest_gap_metric} ({data.gaps.biggest_gap_value}pts).</strong> Focus on improving this area to climb the ranks.</>
        ) : previewMode ? (
          <><strong className="font-semibold text-primary">Biggest gap: Checkout Speed (17 pts).</strong> Focus on improving this area to climb the ranks.</>
        ) : (
          <><strong className="font-semibold text-primary">Biggest gap: N/A.</strong> Comparison data is not yet available for this period.</>
        )}
      </div>

    </div>
  )
}
