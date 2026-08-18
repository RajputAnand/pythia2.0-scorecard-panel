'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { BenchmarkingStoreData, SelectedStoreBenchmarkingData, BenchmarkingAllStoreDataResponse } from '@/types/benchmarking'
import { fetchAllStoreData } from '@/queries/benchmarking'

import RankHero from '@/components/RankHero/RankHero'
import NetworkLeaderboard from '@/components/NetworkLeaderboard/NetworkLeaderboard'
import StoreComparison from '@/components/StoreComparison/StoreComparison'
import TopStorePractices from '@/components/TopStorePractices/TopStorePractices'
import RankMovement from '@/components/RankMovement/RankMovement'

import Header from '@/components/shared/Header/Header'
import headerStyles from '@/components/shared/Header/Header.module.css'
import BenchmarkingMetricFilter from '@/components/BenchmarkingMetricFilter/BenchmarkingMetricFilter'
import { downloadCsv } from '@/utils/common'

export default function BenchmarkingContent() {
  const { data: session } = useSession()
  const token = session?.user?.token
  const { currentStore } = useUserStore()

  const [allStoreData, setAllStoreData] = useState<BenchmarkingStoreData[]>([])
  const [selectedStoreData, setSelectedStoreData] = useState<SelectedStoreBenchmarkingData | null>(null)
  const [meta, setMeta] = useState<BenchmarkingAllStoreDataResponse['meta'] | null>(null)
  const [loading, setLoading] = useState(true)

  const searchParams = useSearchParams()

  // Filter states — defaults to (and follows) the store picked in the Header dropdown
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(currentStore?._id ?? null)
  const [period, setPeriod] = useState<string | undefined>(undefined)

  // Picking a different store in the Header dropdown re-targets the benchmarking
  // detail view (RankHero/StoreComparison/RankMovement) at that store, which
  // drives fetchAllStoreData below via the selectedStoreId dependency.
  useEffect(() => {
    if (currentStore?._id) setSelectedStoreId(currentStore._id)
  }, [currentStore?._id])
  
  const sortByMap: Record<string, string> = { 'Overall': 'overall', 'Hospitality': 'hospitality', 'Checkout': 'checkout', 'Time to Svc': 'time_to_svc' }
  const sortByTab = searchParams.get('sort') || 'Overall'
  const sortBy = sortByMap[sortByTab] || 'overall'

  const filterMap: Record<string, string> = { 'All Stores': 'all', 'Top 10': 'top_10', 'Near You ±3': 'near_you', 'Improving': 'improving', 'Declining': 'declining' }
  const filterPill = searchParams.get('filter') || 'All Stores'
  const filterMode = filterMap[filterPill] || 'all'

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)

    fetchAllStoreData(token, {
      selected_store_id: selectedStoreId,
      period,
      sort_by: sortBy,
      filter_mode: filterMode,
    })
      .then((res) => {
        if (!cancelled) {
          setAllStoreData(res.data)
          setSelectedStoreData(res.selected_store)
          setMeta(res.meta)
          setLoading(false)
          
          if (!selectedStoreId && res.data.length > 0) {
            setSelectedStoreId(currentStore?._id || res.data[0].store_id)
          }
        }
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, selectedStoreId, period, sortBy, filterMode, currentStore?._id])

  const subtitle = meta
    ? `${meta.period.label} · ${meta.scope.store_count} peer stores in network`
    : 'Loading...'

  // No export endpoint exists yet — CSV of the currently loaded Network
  // Leaderboard rows, reflecting whichever header metric sort (`sortByTab`)
  // and leaderboard pill (`filterPill`) is active, since those already drive
  // `allStoreData` via fetchAllStoreData above.
  const handleExportReport = () => {
    const headers = ['Rank', 'Store', 'Overall', 'Hospitality', 'Checkout', 'Time to Svc', 'MoM Change', 'Percentile']
    const rows = allStoreData.map((d) => {
      const isYours = d.store_id === currentStore?._id
      return [
        d.rank,
        isYours ? currentStore?.name || 'Your Store' : `Store #${d.store_id.slice(-4)}`,
        d.overall ?? '',
        d.hospitality ?? '',
        d.checkout ?? '',
        d.time_to_svc ?? '',
        d.mom_change ?? '',
        d.overall_percentile_display || '',
      ]
    })

    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const filename = `benchmarking-${slug(filterPill)}-${slug(sortByTab)}-${new Date().toISOString().slice(0, 10)}.csv`
    downloadCsv(filename, headers, rows)
  }

  return (
    <>
      <Header title="Competitor Benchmarking" subtitle={subtitle}>
        <BenchmarkingMetricFilter />
        <button
          className={`${headerStyles.btnPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={handleExportReport}
          disabled={loading || allStoreData.length === 0}
        >
          Export Report
        </button>
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
        <RankHero 
          data={selectedStoreData} 
          loading={loading} 
        />
        <NetworkLeaderboard 
          data={allStoreData}
          loading={loading}
          selectedStoreId={selectedStoreId}
          onSelectStore={(id) => setSelectedStoreId(id)}
        />
        <StoreComparison data={selectedStoreData} loading={loading} />
        <TopStorePractices selectedStoreId={selectedStoreId} period={period} />
        <RankMovement data={selectedStoreData?.rank_movement_board} loading={loading} />
      </div>
    </>
  )
}
