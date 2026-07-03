'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useUnknownIdentitiesQuery } from '@/queries/unknown-identities'
import UnknownIdentityCarousel from '@/components/UnknownIdentityCarousel/UnknownIdentityCarousel'
import EmployeeAssignPicker from '@/components/EmployeeAssignPicker/EmployeeAssignPicker'

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

export default function UnknownIdentitiesPanel() {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token

  const { data, isLoading, isError, isFetching, refetch } = useUnknownIdentitiesQuery(token)
  const identities = data?.data ?? []
  const [activeIndex, setActiveIndex] = useState(0)

  // Clamp the active index if the list shrinks (e.g. after an assign invalidates the cache).
  if (identities.length > 0 && activeIndex >= identities.length) {
    setActiveIndex(identities.length - 1)
  }

  if (isError) return <PanelError onRetry={refetch} />
  if (isLoading) return <PanelSkeleton />
  if (identities.length === 0) return <PanelEmpty />

  const activeIdentity = identities[activeIndex]

  return (
    <div className="flex flex-col gap-3">
      {isFetching && (
        <div className="flex items-center justify-end -mb-2">
          <span className="flex items-center gap-1.5 rounded-full bg-accent-light px-3 py-1 text-[11px] font-medium text-accent">
            <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-accent" />
            Syncing
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 items-start gap-[18px]">
        <UnknownIdentityCarousel identities={identities} activeIndex={activeIndex} onSelectIndex={setActiveIndex} />
        <EmployeeAssignPicker identity={activeIdentity} onAssigned={refetch} />
      </div>
    </div>
  )
}
