'use client'

import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'
import { SelectedStoreBenchmarkingData } from '@/types/benchmarking'

interface MonthItem {
  rank: string
  hasData: boolean
  color: string
}

interface StoreTrack {
  label: string
  isYours?: boolean
  months: MonthItem[]
  currentRank: string
  currentColor: string
  delta: string
  deltaVariant: 'up' | 'down' | 'flat'
}

const tracks: StoreTrack[] = [
  {
    label: '#1',
    months: [
      { rank: '—', hasData: false, color: '#B8860B' },
      { rank: '#2', hasData: true, color: '#B8860B' },
      { rank: '#2', hasData: true, color: '#B8860B' },
      { rank: '#1', hasData: true, color: '#B8860B' },
    ],
    currentRank: '#1',
    currentColor: '#B8860B',
    delta: '↑ 1',
    deltaVariant: 'up',
  },
  {
    label: 'You',
    isYours: true,
    months: [
      { rank: '—', hasData: false, color: '#1D5C3A' },
      { rank: '#1', hasData: true, color: '#1D5C3A' },
      { rank: '#1', hasData: true, color: '#1D5C3A' },
      { rank: '#2', hasData: true, color: '#1D5C3A' },
    ],
    currentRank: '#2',
    currentColor: '#1D5C3A',
    delta: '↓ 1',
    deltaVariant: 'down',
  },
]

const previewTracks: StoreTrack[] = [
  { label: '#1', months: [{ rank: '#3', hasData: true, color: '#B8860B' }, { rank: '#2', hasData: true, color: '#B8860B' }, { rank: '#1', hasData: true, color: '#B8860B' }, { rank: '#1', hasData: true, color: '#B8860B' }], currentRank: '#1', currentColor: '#B8860B', delta: '↑ 2', deltaVariant: 'up' },
  { label: '#2', months: [{ rank: '#1', hasData: true, color: '#5A7A9A' }, { rank: '#1', hasData: true, color: '#5A7A9A' }, { rank: '#2', hasData: true, color: '#5A7A9A' }, { rank: '#2', hasData: true, color: '#5A7A9A' }], currentRank: '#2', currentColor: '#5A7A9A', delta: '↓ 1', deltaVariant: 'down' },
  { label: '#5', months: [{ rank: '#6', hasData: true, color: '#4A8A6A' }, { rank: '#5', hasData: true, color: '#4A8A6A' }, { rank: '#4', hasData: true, color: '#4A8A6A' }, { rank: '#3', hasData: true, color: '#4A8A6A' }], currentRank: '#3', currentColor: '#4A8A6A', delta: '↑ 3', deltaVariant: 'up' },
  { label: 'You', isYours: true, months: [{ rank: '#14', hasData: true, color: '#1D5C3A' }, { rank: '#9', hasData: true, color: '#1D5C3A' }, { rank: '#5', hasData: true, color: '#1D5C3A' }, { rank: '#3', hasData: true, color: '#1D5C3A' }], currentRank: '#3', currentColor: '#1D5C3A', delta: '↑ 11', deltaVariant: 'up' },
  { label: '#4', months: [{ rank: '#3', hasData: true, color: '#888' }, { rank: '#3', hasData: true, color: '#888' }, { rank: '#3', hasData: true, color: '#888' }, { rank: '#4', hasData: true, color: '#888' }], currentRank: '#4', currentColor: '#888', delta: '↓ 1', deltaVariant: 'down' },
]

const deltaClass: Record<'up' | 'down' | 'flat', string> = {
  up: 'text-accent',
  down: 'text-danger',
  flat: 'text-gray-800',
}

interface RankMovementProps {
  previewMode?: boolean
  data?: SelectedStoreBenchmarkingData['rank_movement_board']
  loading?: boolean
  visibilityId?: string
}

export default function RankMovement({ previewMode, data, loading, visibilityId = KPI_IDS.benchmarkingRankMovement }: RankMovementProps = {}) {
  const visible = useAdminConfigStore((s) => s.visibility[visibilityId] ?? true)
  if (!previewMode && !visible) return null

  // Extract month labels (e.g. ['Jul', 'Aug', 'Sep', 'Oct'])
  const monthLabels: string[] = (() => {
    if (data?.months && data.months.length > 0) {
      return data.months.map(m => m.label ? m.label.substring(0, 3) : '')
    }
    return ['Nov', 'Dec', 'Jan', 'Feb']
  })()

  let shownTracks = previewMode ? previewTracks.filter((t) => t.isYours || t.label === '#1') : tracks

  // Track the maximum number of recorded months across stores
  let maxRecordedMonths = 0

  if (data && data.rows && !loading) {
    shownTracks = data.rows.map(row => {
      let currentColor = '#888'
      if (row.is_top_performer) currentColor = '#B8860B'
      else if (row.is_selected_store) currentColor = '#1D5C3A'
      else if (row.is_nearest_competitor) currentColor = '#5A7A9A'
      
      let deltaStr = '—'
      let deltaVariant: 'up' | 'down' | 'flat' = 'flat'
      
      if (row.history && row.history.length > 0 && row.current_rank) {
        const validHistory = row.history.filter(h => h.rank !== null && h.rank !== undefined)
        if (validHistory.length > maxRecordedMonths) {
          maxRecordedMonths = validHistory.length
        }

        if (validHistory.length > 1) {
          // Compare current rank with immediate previous month if available, else first recorded rank
          const prevMonthRank = row.history[row.history.length - 2]?.rank
          const baselineRank = prevMonthRank ?? validHistory[0].rank
          if (baselineRank !== null && baselineRank !== undefined) {
            const change = baselineRank - row.current_rank
            if (change > 0) {
              deltaStr = `↑ ${change}`
              deltaVariant = 'up'
            } else if (change < 0) {
              deltaStr = `↓ ${Math.abs(change)}`
              deltaVariant = 'down'
            } else {
              deltaStr = '— flat'
              deltaVariant = 'flat'
            }
          }
        }
      }
      
      return {
        label: row.is_selected_store ? 'You' : (row.current_rank ? `#${row.current_rank}` : '—'),
        isYours: row.is_selected_store,
        months: row.history.map(h => ({
          rank: h.rank ? `#${h.rank}` : '—',
          hasData: Boolean(h.rank),
          color: currentColor
        })),
        currentRank: row.current_rank ? `#${row.current_rank}` : '—',
        currentColor,
        delta: deltaStr,
        deltaVariant
      }
    })
  }

  return (
    <div className={`bg-surface border border-border rounded-[14px] overflow-hidden transition-opacity ${loading ? 'opacity-50' : ''}`}>
      <div className="px-[22px] py-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="text-[13.5px] font-semibold">Month-over-Month Rank Movement</div>
          <div className="text-[11.5px] text-gray-800 mt-[2px]">Your store vs. top 5 and nearest competitor</div>
        </div>
        {maxRecordedMonths > 0 && maxRecordedMonths < 4 && (
          <div className="bg-surface-alt border border-border rounded-full px-2.5 py-1 text-[11px] font-medium text-gray-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>{maxRecordedMonths} of 4 months recorded</span>
          </div>
        )}
      </div>

      <div className="px-[22px] py-4">
        {/* Month column headers */}
        <div className="flex items-center gap-[14px] pb-2 mb-1 border-b border-border/40">
          <div className="w-[72px] text-[10px] font-semibold text-gray-800 uppercase tracking-[.08em]">
            Store
          </div>
          <div className="flex-1 flex gap-[6px] items-center">
            {monthLabels.map((month, idx) => (
              <div
                key={idx}
                className="flex-1 text-center font-mono text-[11px] font-semibold text-gray-800 uppercase tracking-wider"
              >
                {month}
              </div>
            ))}
          </div>
          <div className="w-[70px] text-right text-[10px] font-semibold text-gray-800 uppercase tracking-[.08em]">
            Current
          </div>
        </div>

        {/* Store tracks */}
        <div className="flex flex-col gap-[12px] pt-2">
          {shownTracks.map((track) => (
            <div key={track.label} className="flex items-center gap-[14px]">
              <div className={`w-[72px] font-mono text-[12px] font-semibold shrink-0 ${track.isYours ? 'text-accent font-bold' : 'text-secondary'}`}>
                {track.label}
              </div>
              <div className="flex-1 flex gap-[6px] items-center">
                {track.months.map((m, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded-[8px] flex items-center justify-center px-[6px] transition-all ${
                      m.hasData
                        ? 'shadow-xs text-white'
                        : 'bg-surface-alt/70 border border-dashed border-border text-gray-800/60'
                    }`}
                    style={{
                      background: m.hasData ? m.color : undefined,
                    }}
                  >
                    <span className={`font-mono text-[11px] font-bold whitespace-nowrap ${m.hasData ? 'text-white' : 'text-gray-800/50'}`}>
                      {m.rank}
                    </span>
                  </div>
                ))}
              </div>
              <div className="w-[70px] flex flex-col items-end gap-[1px]">
                <div className="font-mono text-[16px] font-bold" style={{ color: track.currentColor }}>
                  {track.currentRank}
                </div>
                <div className={`font-mono text-[11px] font-semibold ${deltaClass[track.deltaVariant]}`}>
                  {track.delta}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
