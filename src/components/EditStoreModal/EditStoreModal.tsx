'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { updateStore } from '@/queries/stores'
import Select from '@/components/shared/Select/Select'
import { extractApiErrorMessage } from '@/utils/common'
import { useToast } from '@/context/ToastContext'
import type { TenantStore, StoreProvisionStatus } from '@/types/tenant'

const STORE_STATUS_OPTIONS = [
  { label: 'Live', value: 'live' },
  { label: 'Provisioning', value: 'provisioning' },
  { label: 'Offline', value: 'offline' },
  { label: 'Closed', value: 'closed' },
]

interface EditStoreModalProps {
  token?: string
  store: TenantStore
  onClose: () => void
  onUpdated: (updated: TenantStore) => void
}

function generatePairingCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000)
  const letters = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `PAIR-${num}-${letters}`
}

export default function EditStoreModal({ token, store, onClose, onUpdated }: EditStoreModalProps) {
  const { data: session } = useSession()
  const authToken = token || session?.user?.pythia2Token || session?.user?.token
  const { showToast } = useToast()

  const [name, setName] = useState(store.name)
  const [location, setLocation] = useState(store.location)
  const [district, setDistrict] = useState(store.district)
  const [fullAddress, setFullAddress] = useState(store.fullAddress || (store.address ? `${store.address.street || ''}, ${store.address.city || ''}, ${store.address.state || ''} ${store.address.zip || ''}`.trim() : ''))
  const [pairingCode, setPairingCode] = useState(store.pairingCode || '')
  const [status, setStatus] = useState<StoreProvisionStatus>(store.status)
  const [timezone, setTimezone] = useState(store.timezone)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleRegeneratePairingCode() {
    const newCode = generatePairingCode()
    setPairingCode(newCode)
    showToast('Generated new edge device pairing code')
  }

  function handleCopyCode() {
    if (typeof navigator !== 'undefined' && navigator.clipboard && pairingCode) {
      navigator.clipboard.writeText(pairingCode)
      showToast('Pairing code copied to clipboard!')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    try {
      const storeCode = store.storeNo || store.id || store._id
      const res = await updateStore({
        token: authToken,
        storeId: storeCode,
        updates: { name, location, district, fullAddress, pairingCode, status, timezone },
      })
      if (res.success && res.data) {
        onUpdated(res.data)
      }
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Failed to update store.'))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 overflow-y-auto" onClick={onClose}>
      <div
        className="w-full max-w-[460px] bg-surface border border-border rounded-2xl shadow-xl p-6 space-y-4 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-primary">Edit Store: {store.storeNo}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-primary cursor-pointer">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="p-2.5 bg-danger/10 text-danger text-[12px] rounded-lg">{error}</div>}

          <div>
            <label className="text-[11px] font-medium text-secondary uppercase block mb-1">Store Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-[12.5px] outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-secondary uppercase block mb-1">Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-[12.5px] outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-secondary uppercase block mb-1">District</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-[12.5px] outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-secondary uppercase block mb-1">Full Address</label>
            <textarea
              rows={2}
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-[12.5px] outline-none focus:border-accent resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-secondary uppercase">
                Edge Device Pairing Code
              </label>
              <button
                type="button"
                onClick={handleRegeneratePairingCode}
                className="text-[11px] font-semibold text-accent hover:text-accent-mid cursor-pointer flex items-center gap-1"
              >
                <span>🔄</span> Regenerate
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-between bg-surface border border-border rounded-lg px-3 py-1.5">
                <span className="font-mono text-[12px] font-bold text-accent tracking-wider">
                  {pairingCode || '—'}
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-accent-light text-accent">
                  Assigned
                </span>
              </div>
              {pairingCode && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  title="Copy Pairing Code"
                  className="p-2 rounded-lg border border-border bg-surface hover:bg-surface-alt text-secondary hover:text-primary transition-colors cursor-pointer shrink-0 text-[12px]"
                >
                  📋
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-secondary uppercase block mb-1">Status</label>
              <Select
                value={status}
                options={STORE_STATUS_OPTIONS}
                onChange={(val) => setStatus(val as StoreProvisionStatus)}
                ariaLabel="Store Status"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-secondary uppercase block mb-1">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-[12.5px] outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="border border-border bg-surface text-secondary px-3 py-1.5 text-[12px] font-semibold rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-accent hover:bg-accent-mid text-white px-4 py-1.5 text-[12px] font-semibold rounded-lg cursor-pointer"
            >
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

