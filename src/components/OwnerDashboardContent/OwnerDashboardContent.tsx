'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { BenchmarkingStoreData, SelectedStoreBenchmarkingData, BenchmarkingAllStoreDataResponse } from '@/types/benchmarking'
import { fetchBenchmarkAllStoreData } from '@/queries/benchmarking'

import NetworkLeaderboard from '@/components/NetworkLeaderboard/NetworkLeaderboard'
import StoreComparison from '@/components/StoreComparison/StoreComparison'
import RankMovement from '@/components/RankMovement/RankMovement'

import Header from '@/components/shared/Header/Header'
import headerStyles from '@/components/shared/Header/Header.module.css'
import Toolbar from '@/components/shared/Toolbar/Toolbar'
import BenchmarkingMetricFilter from '@/components/BenchmarkingMetricFilter/BenchmarkingMetricFilter'
import CreateStoreBanner from '@/components/shared/CreateStoreBanner/CreateStoreBanner'
import { downloadCsv } from '@/utils/common'
import { KPI_IDS } from '@/lib/admin-config-data'

interface OwnerDashboardContentProps {
  /** Super Admin mirror only — prefixes the Header subtitle so it's clear this is the read-only mirror, not the real owner page. */
  subtitlePrefix?: string
  initialHasStores?: boolean | null
}

export default function OwnerDashboardContent({ subtitlePrefix, initialHasStores }: OwnerDashboardContentProps = {}) {
  const { data: session } = useSession()
  const token = session?.user?.token
  
  const { currentStore, stores } = useUserStore()

  // Determine if any stores exist:
  const hasStores =
    stores.length > 0
      ? true
      : initialHasStores !== null && initialHasStores !== undefined
      ? initialHasStores
      : currentStore !== null

  const [allStoreData, setAllStoreData] = useState<BenchmarkingStoreData[]>([])
  const [selectedStoreData, setSelectedStoreData] = useState<SelectedStoreBenchmarkingData | null>(null)
  const [topPerformerStore, setTopPerformerStore] = useState<SelectedStoreBenchmarkingData | null>(null)
  const [meta, setMeta] = useState<BenchmarkingAllStoreDataResponse['meta'] | null>(null)
  const [loading, setLoading] = useState(hasStores)

  const searchParams = useSearchParams()

  // Filter states — defaults to (and follows) the store picked in the Header dropdown
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [period, setPeriod] = useState<string | undefined>(undefined)

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
    if (!token || !hasStores) {
      if (!hasStores) setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)

    const storeToQuery = selectedStoreId || currentStore?._id || null

    fetchBenchmarkAllStoreData({ token, limit: 5, selectedStoreId: storeToQuery })
      .then((res) => {
        if (!cancelled) {
          const stores = res?.data || []; 
          setAllStoreData(stores)
          setMeta(res?.meta ?? null)
          setLoading(false)
          
          if (res?.selected_store) {
            setSelectedStoreData(res.selected_store as any)
            if (res.selected_store.top_performer) {
              setTopPerformerStore(res.selected_store.top_performer as any)
            } else if (stores.length > 0) {
              setTopPerformerStore(stores[0] as any)
            }
          } else if (stores.length > 1) {
            if (!selectedStoreId) {
              setSelectedStoreId(stores[1].store_id)
            }

            if (!selectedStoreData) {
              setSelectedStoreData(stores[1] as any)
              setTopPerformerStore(stores[0] as any)
            }
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
  }, [token, period, sortBy, filterMode, currentStore?._id, selectedStoreId])

  const subtitle = meta
    ? `${meta.period.label} · ${meta.scope.store_count} peer stores in network`
    : 'Loading...'

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
    const filename = `dashboard-${slug(filterPill)}-${slug(sortByTab)}-${new Date().toISOString().slice(0, 10)}.csv`
    downloadCsv(filename, headers, rows)
  }

  return (
    <>
      <Header
        title="Internal Store Benchmarking"
        subtitle={!hasStores ? (subtitlePrefix ? `${subtitlePrefix} · Owner Tools` : 'Owner Tools') : subtitle}
      />

      {hasStores && (
        <Toolbar
          left={<BenchmarkingMetricFilter />}
          right={
            <button
              className={`${headerStyles.btnPrimary} flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={handleExportReport}
              disabled={loading || allStoreData.length === 0}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Export Report</span>
            </button>
          }
        />
      )}

      <div className="grid p-5 gap-5">
        {!hasStores ? (
          <div className="flex flex-col gap-6">
            <CreateStoreBanner featureName="Dashboard" />
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface py-20 text-center">
              <span className="text-[36px]">🏆</span>
              <p className="font-semibold text-[14px] text-primary">No dashboard data available</p>
              <p className="text-[12px] text-gray-800 max-w-md">
                Create your first store location to start viewing your customer service and speed metrics against peer stores.
              </p>
            </div>
          </div>
        ) : (
          <>
            <NetworkLeaderboard 
              data={allStoreData}
              loading={loading}
              selectedStoreId={selectedStoreId}
              onSelectStore={(id) => setSelectedStoreId(id)}
              setSelectedStoreData={setSelectedStoreData}
              visibilityId={KPI_IDS.ownerDashboardNetworkLeaderboard}
            />
            <StoreComparison
              selectedStore={selectedStoreData}
              topPerformerStore={topPerformerStore}
              loading={loading}
              visibilityId={KPI_IDS.ownerDashboardStoreComparison}
            />
            <RankMovement
              data={selectedStoreData?.rank_movement_board}
              loading={loading}
              visibilityId={KPI_IDS.ownerDashboardRankMovement}
            />
          </>
        )}
      </div>
    </>
  )
}
