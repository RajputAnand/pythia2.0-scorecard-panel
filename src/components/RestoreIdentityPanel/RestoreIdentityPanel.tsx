'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { restoreUnknownIdentity } from '@/queries/unknown-identities'
import { useToast } from '@/context/ToastContext'
import type { UnknownIdentity } from '@/types/unknown-identity'

interface RestoreIdentityPanelProps {
  identity: UnknownIdentity
  onRestored: () => void
}

export default function RestoreIdentityPanel({ identity, onRestored }: RestoreIdentityPanelProps) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token
  const { showToast } = useToast()
  const [isPending, setIsPending] = useState(false)

  async function handleRestore() {
    if (!token || isPending) return
    setIsPending(true)
    try {
      await restoreUnknownIdentity({ token, identityId: identity.id })
      showToast('Identity restored')
      onRestored()
    } catch {
      showToast('Failed to restore this identity. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-w-0 bg-surface border border-border rounded-[14px] p-5 flex flex-col gap-3">
      <div className="text-[13.5px] font-semibold">Trashed Identity</div>

      <div className="flex flex-col gap-1 text-[11.5px] text-secondary">
        <div className="flex justify-between gap-2 min-w-0">
          <span className="text-muted shrink-0">Store</span>
          <span className="font-mono truncate" title={identity.store_id}>{identity.store_id}</span>
        </div>
        {identity.trashed_at_utc && (
          <div className="flex justify-between gap-2 min-w-0">
            <span className="text-muted shrink-0">Trashed</span>
            <span className="truncate">{new Date(identity.trashed_at_utc).toLocaleString('en-US')}</span>
          </div>
        )}
      </div>

      <p className="text-[11.5px] text-muted">
        This identity and its scores are hidden but not deleted. Restoring it puts it back among unresolved identities.
      </p>

      <button
        type="button"
        onClick={handleRestore}
        disabled={isPending}
        className="w-full rounded-[9px] border-0 bg-accent px-4 py-[10px] text-[12.5px] font-semibold text-white transition-all duration-150 hover:opacity-85 disabled:cursor-default disabled:opacity-40 cursor-pointer"
      >
        {isPending ? 'Restoring…' : 'Restore Identity'}
      </button>
    </div>
  )
}
