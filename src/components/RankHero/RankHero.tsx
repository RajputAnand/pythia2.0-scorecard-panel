'use client'

import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'
import { SelectedStoreBenchmarkingData } from '@/types/benchmarking'

const rankHistory = [
  { month: 'Nov', width: '0%', color: '#E4DFD8', rank: 'N/A', accent: false },
  { month: 'Dec', width: '0%', color: '#B0CFC0', rank: 'N/A', accent: false },
  { month: 'Jan', width: '0%', color: '#78B898', rank: 'N/A', accent: false },
  { month: 'Feb', width: '0%', color: '#1D5C3A', rank: 'N/A', accent: true },
]

const metrics = [
  { label: 'Hospitality', val: 0, rank: 'N/A', color: 'text-accent' },
  { label: 'Checkout Spd', val: 0, rank: 'N/A', color: 'text-amber' },
  { label: 'Time to Svc', val: 0, rank: 'N/A', color: 'text-accent' },
  { label: 'Overall Score', val: 0, rank: 'N/A', color: 'text-accent' },
]

const previewRankHistory = [
  { month: 'Nov', width: '45%', color: '#E4DFD8', rank: '#14', accent: false },
  { month: 'Dec', width: '58%', color: '#B0CFC0', rank: '#9', accent: false },
  { month: 'Jan', width: '72%', color: '#78B898', rank: '#5', accent: false },
  { month: 'Feb', width: '88%', color: '#1D5C3A', rank: '#3', accent: true },
]

const previewMetrics = [
  { label: 'Hospitality', val: 86, rank: '#2 of 24', color: 'text-accent' },
  { label: 'Checkout Spd', val: 79, rank: '#6 of 24', color: 'text-amber' },
  { label: 'Time to Svc', val: 82, rank: '#4 of 24', color: 'text-accent' },
  { label: 'Overall Score', val: 84, rank: '#3 of 24', color: 'text-accent' },
]

interface RankHeroProps {
  previewMode?: boolean
  data?: SelectedStoreBenchmarkingData | null
  loading?: boolean
}

export default function RankHero({ previewMode, data, loading }: RankHeroProps = {}) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.benchmarkingRankHero] ?? true)
  if (!previewMode && !visible) return null

  let history = previewMode ? previewRankHistory : rankHistory
  if (data?.rank_history && !loading) {
    history = data.rank_history.map(item => ({
      month: item.period.label.substring(0, 3), // "August 2026" -> "Aug"
      width: item.rank ? `${100 - ((item.rank / (item.cohort_size || 1)) * 100)}%` : '0%',
      color: item.rank && item.rank <= 3 ? '#1D5C3A' : '#E4DFD8',
      rank: item.rank ? `#${item.rank}` : 'N/A',
      accent: item.rank && item.rank <= 3 ? true : false,
    }))
  }
  
  // Combine real data with preview/default metrics layout
  const baseMetrics = previewMode ? previewMetrics : metrics
  const shownMetrics = baseMetrics.map(m => {
    if (data && !loading) {
      if (m.label === 'Hospitality') return { ...m, val: data.hospitality ?? 0, rank: data.hospitality_rank ? `#${data.hospitality_rank} of ${data.hospitality_cohort_size}` : 'N/A' }
      if (m.label === 'Checkout Spd') return { ...m, val: data.checkout ?? 0, rank: data.checkout_rank ? `#${data.checkout_rank} of ${data.checkout_cohort_size}` : 'N/A' }
      if (m.label === 'Time to Svc') return { ...m, val: data.time_to_svc ?? 0, rank: data.time_to_svc_rank ? `#${data.time_to_svc_rank} of ${data.time_to_svc_cohort_size}` : 'N/A' }
      if (m.label === 'Overall Score') return { ...m, val: data.overall ?? 0, rank: data.rank ? `#${data.rank} of ${data.cohort_size}` : 'N/A' }
    }
    return m
  })

  return (
    <div className="grid grid-cols-[auto_1fr_auto] bg-surface border border-border rounded-2xl overflow-hidden">

      {/* Rank badge */}
      <div
        className="flex flex-col items-center justify-center gap-[10px] min-w-[200px] px-9 py-7"
        style={{ background: 'linear-gradient(160deg, #1A1714 0%, #2C2820 100%)' }}
      >
        <div className="text-[10px] font-semibold uppercase tracking-[.12em] text-white/35">Your Rank</div>
        <div className="font-mono text-[72px] font-medium text-white leading-none tracking-[-0.04em]">{data?.rank ? `#${data.rank}` : (previewMode ? '#3' : 'N/A')}</div>
        <div className="font-mono text-[13px] text-white/35">{data?.cohort_size ? `of ${data.cohort_size} stores` : (previewMode ? 'of 24 stores' : 'N/A')}</div>
        <div
          className="flex items-center gap-[6px] rounded-full px-3 py-1"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <span className="font-mono text-[12px] font-semibold text-white/50">{
            data?.rank_history && data.rank_history.length > 0 && data.rank
              ? (() => {
                  const firstValid = data.rank_history.find(h => h.rank !== null)
                  if (!firstValid) return 'N/A'
                  const firstRank = firstValid.rank!
                  const diff = firstRank - data.rank
                  const monthStr = firstValid.period.label.substring(0, 3)
                  if (diff > 0) return `▲ up ${diff} since ${monthStr}`
                  if (diff < 0) return `▼ down ${Math.abs(diff)} since ${monthStr}`
                  return `flat since ${monthStr}`
                })()
              : (previewMode ? '▲ up 6 since Nov' : 'N/A')
          }</span>
        </div>
      </div>

      {/* Center: percentile + metric chips */}
      <div className="flex flex-col justify-center gap-[14px] px-8 py-7 border-l border-r border-border">
        <div>
          <div className="text-[11px] font-semibold text-muted uppercase tracking-[.1em] mb-[10px]">Percentile Rank</div>
          <div className="h-7 bg-surface-alt rounded-lg overflow-hidden">
            <div
              className="h-full rounded-lg flex items-center pl-3"
              style={{ width: data?.overall_percentile ? `${data.overall_percentile}%` : (previewMode ? '88%' : '0%'), background: 'linear-gradient(90deg, #C8E6D6 0%, #1D5C3A 100%)' }}
            >
              <span className="font-mono text-[12px] font-bold text-white whitespace-nowrap">{data?.overall_percentile_display || (previewMode ? 'Top 12%' : 'N/A')}</span>
            </div>
          </div>
          <div className="flex justify-between mt-[5px]">
            {['Bottom 50%', 'Top 50%', '▲ You', 'Top 10%', 'Top 5%'].map((label, i) => (
              <span key={label} className={`font-mono text-[9px] text-center ${i === 2 ? 'text-accent font-bold' : 'text-muted'}`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {shownMetrics.map((m) => (
            <div key={m.label} className="flex-1 bg-surface-alt rounded-[9px] px-3 py-[10px] flex flex-col gap-[3px]">
              <div className="text-[9.5px] text-muted uppercase tracking-[.07em]">{m.label}</div>
              <div className={`font-mono text-[16px] font-bold ${m.color}`}>{m.val}</div>
              <div className="font-mono text-[10.5px] text-muted">{m.rank}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: rank history */}
      <div className="flex flex-col justify-center gap-2 px-7 py-7 min-w-[180px]">
        <div className="text-[10.5px] font-semibold text-muted uppercase tracking-[.1em] mb-1">Rank History</div>
        {history.map((item) => (
          <div key={item.month} className="flex items-center gap-[14px]">
            <span className="font-mono text-[11px] text-muted w-7">{item.month}</span>
            <div className="flex-1 h-2 bg-surface-alt rounded overflow-hidden">
              <div className="h-full rounded" style={{ width: item.width, background: item.color }} />
            </div>
            <span className={`font-mono text-[11px] w-8 text-right ${item.accent ? 'text-accent font-bold' : 'text-muted'}`}>
              {item.rank}
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}
