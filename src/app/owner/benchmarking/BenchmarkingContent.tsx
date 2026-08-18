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

export default function BenchmarkingContent() {
  const { data: session } = useSession()
  const token = session?.user?.token
  const { currentStore } = useUserStore()

  const [allStoreData, setAllStoreData] = useState<BenchmarkingStoreData[]>([])
  const [selectedStoreData, setSelectedStoreData] = useState<SelectedStoreBenchmarkingData | null>(null)
  const [meta, setMeta] = useState<BenchmarkingAllStoreDataResponse['meta'] | null>(null)
  const [loading, setLoading] = useState(true)

  const searchParams = useSearchParams()

  // Filter states
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>('STORE-003')
  const [period, setPeriod] = useState<string | undefined>(undefined)
  
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

  return (
    <>
      <Header title="Competitor Benchmarking" subtitle={subtitle}>
        <BenchmarkingMetricFilter />
        <button className={headerStyles.btnPrimary}>Export Report</button>
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
