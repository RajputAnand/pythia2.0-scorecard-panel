'use client'

import { useState, useMemo } from 'react'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'
import { BenchmarkingStoreData } from '@/types/benchmarking'
import { useUserStore } from '@/store/userStore'

type PercentileVariant = 'top5' | 'top10' | 'top25' | 'top50'
type MovementVariant = 'up' | 'down' | 'flat'
type RankVariant = 'gold' | 'silver' | 'bronze' | 'yours' | 'regular'

interface StoreRow {
  storeId: string
  rank: number
  rankVariant: RankVariant
  name: string
  isYours?: boolean
  overall: number
  overallVariant?: 'gold' | 'silver' | 'bronze' | 'yours' | 'regular'
  hospitality: number
  hospColor: string
  checkout: number
  checkoutColor: string
  timeToSvc: number
  ttsColor: string
  movement: string
  movementVariant: MovementVariant
  percentile: string
  percentileVariant: PercentileVariant
}

const rows: StoreRow[] = [
  { storeId: 'mock1', rank: 1, rankVariant: 'gold', name: 'Store #14', overall: 0, overallVariant: 'gold', hospitality: 0, hospColor: '#1D5C3A', checkout: 0, checkoutColor: '#1D5C3A', timeToSvc: 0, ttsColor: '#1D5C3A', movement: 'N/A', movementVariant: 'flat', percentile: 'N/A', percentileVariant: 'top5' },
  { storeId: 'mock2', rank: 2, rankVariant: 'silver', name: 'Store #7', overall: 0, overallVariant: 'silver', hospitality: 0, hospColor: '#7EC8A0', checkout: 0, checkoutColor: '#1D5C3A', timeToSvc: 0, ttsColor: '#1D5C3A', movement: 'N/A', movementVariant: 'flat', percentile: 'N/A', percentileVariant: 'top10' },
  { storeId: 'mock3', rank: 3, rankVariant: 'bronze', name: 'Store #21', overall: 0, overallVariant: 'bronze', hospitality: 0, hospColor: '#1D5C3A', checkout: 0, checkoutColor: '#7EC8A0', timeToSvc: 0, ttsColor: '#1D5C3A', movement: 'N/A', movementVariant: 'flat', percentile: 'N/A', percentileVariant: 'top10' },
  { storeId: 'mock4', rank: 4, rankVariant: 'regular', name: 'Store #3', overall: 0, hospitality: 0, hospColor: '#7EC8A0', checkout: 0, checkoutColor: '#1D5C3A', timeToSvc: 0, ttsColor: '#1D5C3A', movement: 'N/A', movementVariant: 'flat', percentile: 'N/A', percentileVariant: 'top25' },
  { storeId: 'mock5', rank: 5, rankVariant: 'regular', name: 'Store #18', overall: 0, hospitality: 0, hospColor: '#7EC8A0', checkout: 0, checkoutColor: '#1D5C3A', timeToSvc: 0, ttsColor: '#1D5C3A', movement: 'N/A', movementVariant: 'flat', percentile: 'N/A', percentileVariant: 'top25' },
  { storeId: 'mock6', rank: 6, rankVariant: 'yours', name: 'Main St. Store', isYours: true, overall: 0, overallVariant: 'yours', hospitality: 0, hospColor: '#1D5C3A', checkout: 0, checkoutColor: '#C47F18', timeToSvc: 0, ttsColor: '#1D5C3A', movement: 'N/A', movementVariant: 'flat', percentile: 'N/A', percentileVariant: 'top25' },
  { storeId: 'mock7', rank: 7, rankVariant: 'regular', name: 'Store #9', overall: 0, hospitality: 0, hospColor: '#7EC8A0', checkout: 0, checkoutColor: '#1D5C3A', timeToSvc: 0, ttsColor: '#7EC8A0', movement: 'N/A', movementVariant: 'flat', percentile: 'N/A', percentileVariant: 'top25' },
  { storeId: 'mock8', rank: 8, rankVariant: 'regular', name: 'Store #2', overall: 0, hospitality: 0, hospColor: '#7EC8A0', checkout: 0, checkoutColor: '#7EC8A0', timeToSvc: 0, ttsColor: '#7EC8A0', movement: 'N/A', movementVariant: 'flat', percentile: 'N/A', percentileVariant: 'top50' },
]

const previewRows: StoreRow[] = [
  { storeId: 'prev1', rank: 1, rankVariant: 'gold', name: 'Store #14', overall: 89.2, overallVariant: 'gold', hospitality: 91, hospColor: '#1D5C3A', checkout: 88, checkoutColor: '#1D5C3A', timeToSvc: 90, ttsColor: '#1D5C3A', movement: '+2.1', movementVariant: 'up', percentile: 'Top 5%', percentileVariant: 'top5' },
  { storeId: 'prev2', rank: 2, rankVariant: 'silver', name: 'Store #7', overall: 86.5, overallVariant: 'silver', hospitality: 88, hospColor: '#1D5C3A', checkout: 85, checkoutColor: '#7EC8A0', timeToSvc: 87, ttsColor: '#1D5C3A', movement: '+1.4', movementVariant: 'up', percentile: 'Top 5%', percentileVariant: 'top5' },
  { storeId: 'prev3', rank: 3, rankVariant: 'bronze', name: 'Main St. Store', isYours: true, overall: 84.8, overallVariant: 'yours', hospitality: 86, hospColor: '#1D5C3A', checkout: 79, checkoutColor: '#C47F18', timeToSvc: 82, ttsColor: '#1D5C3A', movement: '+0.5', movementVariant: 'up', percentile: 'Top 12%', percentileVariant: 'top10' },
  { storeId: 'prev4', rank: 4, rankVariant: 'regular', name: 'Store #3', overall: 82.1, hospitality: 84, hospColor: '#1D5C3A', checkout: 81, checkoutColor: '#1D5C3A', timeToSvc: 83, ttsColor: '#1D5C3A', movement: '-0.2', movementVariant: 'flat', percentile: 'Top 15%', percentileVariant: 'top25' },
  { storeId: 'prev5', rank: 5, rankVariant: 'regular', name: 'Store #18', overall: 81.5, hospitality: 82, hospColor: '#1D5C3A', checkout: 80, checkoutColor: '#1D5C3A', timeToSvc: 81, ttsColor: '#1D5C3A', movement: '+0.8', movementVariant: 'up', percentile: 'Top 20%', percentileVariant: 'top25' },
  { storeId: 'prev6', rank: 6, rankVariant: 'regular', name: 'Store #21', overall: 79.2, hospitality: 80, hospColor: '#7EC8A0', checkout: 78, checkoutColor: '#7EC8A0', timeToSvc: 79, ttsColor: '#7EC8A0', movement: '-1.1', movementVariant: 'down', percentile: 'Top 25%', percentileVariant: 'top50' },
  { storeId: 'prev7', rank: 7, rankVariant: 'regular', name: 'Store #9', overall: 78.4, hospitality: 79, hospColor: '#7EC8A0', checkout: 77, checkoutColor: '#7EC8A0', timeToSvc: 78, ttsColor: '#7EC8A0', movement: '0.0', movementVariant: 'flat', percentile: 'Top 30%', percentileVariant: 'top50' },
  { storeId: 'prev8', rank: 8, rankVariant: 'regular', name: 'Store #2', overall: 76.8, hospitality: 77, hospColor: '#7EC8A0', checkout: 75, checkoutColor: '#7EC8A0', timeToSvc: 76, ttsColor: '#7EC8A0', movement: '-0.5', movementVariant: 'down', percentile: 'Top 35%', percentileVariant: 'top50' },
]

const FILTERS = ['All Stores', 'Top 10', 'Near You ±3', 'Improving', 'Declining'] as const

const rankNumClass: Record<RankVariant, string> = {
  gold: 'bg-[#FBF0C0] text-[#A07010]',
  silver: 'bg-[#F0F0F4] text-[#70708A]',
  bronze: 'bg-[#FAE8D8] text-[#A05020]',
  yours: 'bg-accent text-white',
  regular: 'bg-surface-alt text-secondary',
}

const overallColor: Record<string, string> = {
  gold: 'text-gold',
  silver: 'text-[#70708A]',
  bronze: 'text-[#A05020]',
  yours: 'text-accent',
  regular: 'text-secondary',
}

const movementClass: Record<MovementVariant, string> = {
  up: 'text-accent',
  down: 'text-danger',
  flat: 'text-muted',
}

const percentileClass: Record<PercentileVariant, string> = {
  top5: 'bg-gold-light text-gold',
  top10: 'bg-gold-light text-gold',
  top25: 'bg-accent-light text-accent',
  top50: 'bg-cobalt-light text-cobalt',
}

function MetricCell({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="w-[60px] h-[5px] bg-surface-alt rounded overflow-hidden">
        <div className="h-full rounded" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono text-[12px] text-secondary">{value}</span>
    </div>
  )
}

interface NetworkLeaderboardProps {
  previewMode?: boolean
  data?: BenchmarkingStoreData[]
  loading?: boolean
  selectedStoreId?: string | null
  onSelectStore?: (storeId: string) => void
}

export default function NetworkLeaderboard({ 
  previewMode, data, loading, selectedStoreId, onSelectStore 
}: NetworkLeaderboardProps = {}) {
  const [activeFilter, setActiveFilter] = useState('All Stores')
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.benchmarkingNetworkLeaderboard] ?? true)
  const currentStore = useUserStore((s) => s.currentStore)

  if (!previewMode && !visible) return null

  const displayRows = useMemo(() => {
    if (previewMode) return previewRows.filter((r) => r.rank === 1 || r.isYours)
    if (!data || data.length === 0) return rows

    return data.map((d, index) => {
      const isYours = d.store_id === currentStore?._id
      
      let rankVariant: RankVariant = 'regular'
      if (index === 0) rankVariant = 'gold'
      else if (index === 1) rankVariant = 'silver'
      else if (index === 2) rankVariant = 'bronze'
      else if (isYours) rankVariant = 'yours'

      const hospColor = (d.hospitality ?? 0) > 80 ? '#1D5C3A' : '#7EC8A0'
      const checkoutColor = (d.checkout ?? 0) > 80 ? '#1D5C3A' : '#7EC8A0'
      const ttsColor = (d.time_to_svc ?? 0) > 80 ? '#1D5C3A' : '#7EC8A0'

      let percentileVariant: PercentileVariant = 'top50'
      if (index < data.length * 0.05) percentileVariant = 'top5'
      else if (index < data.length * 0.1) percentileVariant = 'top10'
      else if (index < data.length * 0.25) percentileVariant = 'top25'

      return {
        storeId: d.store_id,
        rank: index + 1,
        rankVariant,
        name: isYours ? currentStore?.name || 'Your Store' : `Store #${d.store_id.slice(-4)}`,
        isYours,
        overall: d.overall ?? 0,
        overallVariant: rankVariant,
        hospitality: d.hospitality ?? 0,
        hospColor,
        checkout: d.checkout ?? 0,
        checkoutColor,
        timeToSvc: d.time_to_svc ?? 0,
        ttsColor,
        movement: String(d.mom_change ?? 'N/A'),
        movementVariant: 'flat' as MovementVariant,
        percentile: String(d.percentile ?? 'N/A'),
        percentileVariant
      }
    })
  }, [data, previewMode, currentStore])

  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-[22px] py-4 border-b border-border">
        <div>
          <div className="text-[13.5px] font-semibold">Network Leaderboard</div>
          <div className="text-[11.5px] text-muted mt-[2px]">All stores anonymous · Sorted by overall score</div>
        </div>
      </div>

      <div className="flex gap-[6px] px-[22px] py-3 border-b border-border bg-surface-alt">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-[5px] rounded-full border font-sans text-[11.5px] font-medium cursor-pointer transition-all duration-150
              ${activeFilter === f
                ? 'bg-primary text-white border-primary'
                : 'bg-surface text-secondary border-border hover:border-accent hover:text-accent'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      <table className={`w-full border-collapse transition-opacity ${loading ? 'opacity-50' : ''}`}>
        <thead>
          <tr>
            {['Rank', 'Store', 'Overall', 'Hospitality', 'Checkout', 'Time to Svc', 'MoM Change', 'Percentile'].map((h, i) => (
              <th
                key={h}
                className={`text-[10px] font-semibold text-muted uppercase tracking-[.09em] py-[10px] border-b border-border text-left
                  ${i === 0 ? 'pl-[22px] pr-[18px]' : i === 7 ? 'pr-[22px] pl-[18px] text-right' : 'px-[18px]'}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row) => (
            <tr 
              key={row.storeId} 
              className={`cursor-pointer transition-colors ${selectedStoreId === row.storeId ? 'bg-surface-alt' : row.isYours ? 'bg-accent-light' : 'hover:bg-surface-alt/50'}`}
              onClick={() => onSelectStore?.(row.storeId)}
            >
              <td className="pl-[22px] pr-[18px] py-[13px] border-b border-border align-middle">
                <div className="flex items-center gap-[10px]">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[12px] font-bold shrink-0 ${rankNumClass[row.rankVariant]}`}>
                    {row.rank}
                  </div>
                </div>
              </td>
              <td className="px-[18px] py-[13px] border-b border-border align-middle">
                <span className={`text-[13px] font-semibold ${row.isYours ? 'text-accent' : ''}`}>
                  {row.name}
                  {row.isYours && (
                    <span className="ml-[6px] text-[10px] font-semibold px-[6px] py-px rounded bg-accent text-white">You</span>
                  )}
                </span>
              </td>
              <td className="px-[18px] py-[13px] border-b border-border align-middle">
                <span className={`font-mono text-[14px] font-bold ${overallColor[row.overallVariant ?? 'regular']}`}>
                  {row.overall}
                </span>
              </td>
              <td className="px-[18px] py-[13px] border-b border-border align-middle">
                <MetricCell value={row.hospitality} color={row.hospColor} />
              </td>
              <td className="px-[18px] py-[13px] border-b border-border align-middle">
                <MetricCell value={row.checkout} color={row.checkoutColor} />
              </td>
              <td className="px-[18px] py-[13px] border-b border-border align-middle">
                <MetricCell value={row.timeToSvc} color={row.ttsColor} />
              </td>
              <td className="px-[18px] py-[13px] border-b border-border align-middle">
                <span className={`font-mono text-[11.5px] font-semibold ${movementClass[row.movementVariant]}`}>
                  {row.movement}
                </span>
              </td>
              <td className="pr-[22px] pl-[18px] py-[13px] border-b border-border align-middle text-right">
                <span className={`font-mono text-[11px] font-bold px-2 py-[3px] rounded-full ${percentileClass[row.percentileVariant]}`}>
                  {row.percentile}
                </span>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={8} className="px-[22px] py-[10px] text-[11.5px] text-muted bg-surface-alt text-center">
              {previewMode ? '16 additional stores · below top 50%' : 'Additional stores · Score data N/A · Below top 50%'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
