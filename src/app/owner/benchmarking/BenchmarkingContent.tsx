'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/store/userStore'
import { BenchmarkingStoreData } from '@/types/benchmarking'
// import { fetchAllStoreData, fetchStoreData } from '@/queries/benchmarking'
import RankHero from '@/components/RankHero/RankHero'
import NetworkLeaderboard from '@/components/NetworkLeaderboard/NetworkLeaderboard'

export default function BenchmarkingContent() {
  const { data: session } = useSession()
  const token = session?.user?.token
  const { currentStore } = useUserStore()

  // const [allStoreData, setAllStoreData] = useState<BenchmarkingStoreData[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [selectedStoreData, setSelectedStoreData] = useState<BenchmarkingStoreData | null>(null)
  // const [loadingList, setLoadingList] = useState(true)
  const [loadingHero, setLoadingHero] = useState(false) // Changed from true since data fetch is commented out

  useEffect(() => {
    if (!selectedStoreId && currentStore?._id) {
      setSelectedStoreId(currentStore._id)
    }
  }, [currentStore, selectedStoreId])

  // Fetch all store data on mount
  // useEffect(() => {
  //   if (!token) return
  //   let cancelled = false
  //   setLoadingList(true)
  //
  //   fetchAllStoreData(token)
  //     .then((data) => {
  //       if (!cancelled) {
  //         setAllStoreData(data)
  //         setLoadingList(false)
  //         // Default selection if none selected
  //         if (!selectedStoreId && data.length > 0) {
  //           setSelectedStoreId(currentStore?._id || data[0].store_id)
  //         }
  //       }
  //     })
  //     .catch((err) => {
  //       console.error(err)
  //       if (!cancelled) setLoadingList(false)
  //     })
  //
  //   return () => {
  //     cancelled = true
  //   }
  // }, [token, currentStore?._id])

  // Fetch individual store data when selectedStoreId changes
  // useEffect(() => {
  //   if (!token || !selectedStoreId) return
  //   let cancelled = false
  //   setLoadingHero(true)
  //
  //   fetchStoreData(token, selectedStoreId)
  //     .then((data) => {
  //       if (!cancelled) {
  //         setSelectedStoreData(data)
  //         setLoadingHero(false)
  //       }
  //     })
  //     .catch((err) => {
  //       console.error(err)
  //       if (!cancelled) setLoadingHero(false)
  //     })
  //
  //   return () => {
  //     cancelled = true
  //   }
  // }, [token, selectedStoreId])

  return (
    <>
      <RankHero 
        data={selectedStoreData} 
        loading={loadingHero} 
      />
      <NetworkLeaderboard 
        // data={allStoreData}
        // loading={loadingList}
        loading={false}
        selectedStoreId={selectedStoreId}
        onSelectStore={(id) => setSelectedStoreId(id)}
      />
    </>
  )
}
