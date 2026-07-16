'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { fetchUnknownIdentities } from '@/queries/unknown-identities'
import UnknownIdentityCarousel from '@/components/UnknownIdentityCarousel/UnknownIdentityCarousel'
import EmployeeAssignPicker from '@/components/EmployeeAssignPicker/EmployeeAssignPicker'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { UnknownIdentity } from '@/types/unknown-identity'

// 50 per page matches the backend's default page size — the list can hold
// far more than that, so pages are fetched lazily as the carousel advances.
const PAGE_SIZE = 50

function PanelSkeleton() {
  return (
    <div className="grid grid-cols-2 items-start gap-[18px] animate-pulse">
      <div className="bg-surface border border-border rounded-[14px] p-[22px] flex flex-col items-center gap-3">
        <div className="w-full max-w-[320px] aspect-square rounded-[12px] bg-border" />
        <div className="h-3 w-40 rounded bg-border" />
      </div>
      <div className="bg-surface border border-border rounded-[14px] p-5 flex flex-col gap-3">
        <div className="h-9 w-full rounded-lg bg-border" />
        <div className="h-9 w-full rounded-[9px] bg-border" />
      </div>
    </div>
  )
}

function PanelError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">⚠️</span>
      <p className="font-semibold text-[14px]">Failed to load unknown identities</p>
      <p className="text-[12px] text-muted">Check your connection and try again.</p>
      <button
        className="mt-1 rounded-[8px] border-0 bg-accent px-4 py-2 text-[12.5px] font-semibold text-white hover:opacity-85 cursor-pointer"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  )
}

function PanelEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">🎉</span>
      <p className="font-semibold text-[13px]">No unknown identities</p>
      <p className="text-[11.5px] text-muted">Every detection has been matched to a known employee.</p>
    </div>
  )
}

interface UnknownIdentitiesPanelProps {
  initialData: ApiResponseV2Paginated<UnknownIdentity[]> | null
}

export default function UnknownIdentitiesPanel({ initialData }: UnknownIdentitiesPanelProps) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token

  const [identities, setIdentities] = useState<UnknownIdentity[]>(initialData?.data ?? [])
  const [total, setTotal] = useState(initialData?.meta.total ?? initialData?.data.length ?? 0)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [isError, setIsError] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  // resetIndex=true for the initial load / retry-after-error (start at the
  // top of the list); false after an assign, so the carousel stays on the
  // identity the manager was just looking at instead of jumping back to #1.
  const loadFirstPage = useCallback((resetIndex: boolean = true) => {
    if (!token) return
    setIsLoading(true)
    setIsError(false)
    fetchUnknownIdentities({ token, skip: 0, limit: PAGE_SIZE })
      .then((response) => {
        setIdentities(response.data)
        setTotal(response.meta.total)
        if (resetIndex) setActiveIndex(0)
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }, [token])

  // Fall back to a client-side fetch when the server-side prefetch failed or
  // there was no token yet at request time.
  useEffect(() => {
    if (!initialData && token) loadFirstPage()
  }, [initialData, token, loadFirstPage])

  // Clamp the active index if the list shrinks (e.g. after an assign refetches the first page).
  if (identities.length > 0 && activeIndex >= identities.length) {
    setActiveIndex(identities.length - 1)
  }

  // Fetch the next page once the carousel gets close to the end of what's
  // already loaded, so browsing past 50 identities feels seamless.
  useEffect(() => {
    if (!token || isLoading || isError || isFetchingMore) return
    if (identities.length >= total) return
    if (activeIndex < identities.length - 5) return

    setIsFetchingMore(true)
    fetchUnknownIdentities({ token, skip: identities.length, limit: PAGE_SIZE })
      .then((response) => {
        setIdentities((prev) => [...prev, ...response.data])
        setTotal(response.meta.total)
      })
      .catch(() => {})
      .finally(() => setIsFetchingMore(false))
  }, [activeIndex, identities.length, total, token, isLoading, isError, isFetchingMore])

  if (isError) return <PanelError onRetry={loadFirstPage} />
  if (isLoading) return <PanelSkeleton />
  if (identities.length === 0) return <PanelEmpty />

  const activeIdentity = identities[activeIndex]

  return (
    <div className="flex flex-col gap-3">
      {isFetchingMore && (
        <div className="flex items-center justify-end -mb-2">
          <span className="flex items-center gap-1.5 rounded-full bg-accent-light px-3 py-1 text-[11px] font-medium text-accent">
            <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-accent" />
            Syncing
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 items-start gap-[18px]">
        <UnknownIdentityCarousel
          identities={identities}
          total={total}
          activeIndex={activeIndex}
          onSelectIndex={setActiveIndex}
        />
        <EmployeeAssignPicker identity={activeIdentity} onAssigned={() => loadFirstPage(false)} />
      </div>
    </div>
  )
}
