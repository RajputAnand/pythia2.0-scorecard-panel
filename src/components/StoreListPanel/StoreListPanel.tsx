'use client'

import { useState, useEffect, useTransition } from 'react'
import { useSession } from 'next-auth/react'
import {
  fetchStoresForTenant,
  simulateStoreHeartbeat,
} from '@/queries/stores'
import { useToast } from '@/context/ToastContext'
import { extractApiErrorMessage } from '@/utils/common'
import DataTable from '@/components/shared/DataTable/DataTable'
import CreateStoreModal from '@/components/CreateStoreModal/CreateStoreModal'
import EditStoreModal from '@/components/EditStoreModal/EditStoreModal'
import type { TenantStore } from '@/types/tenant'
import type { ApiResponseV2Paginated, ApiMeta } from '@/types/api'
import type { DataTableColumn } from '@/types/data-table'

const PAGE_SIZE = 15

interface StoreListPanelProps {
  initialData: ApiResponseV2Paginated<TenantStore[]> | null
  tenantId?: string
  readOnly?: boolean
}

export default function StoreListPanel({
  initialData,
  tenantId = 'ten_lionmart',
  readOnly = false,
}: StoreListPanelProps) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [skip, setSkip] = useState(0)

  const [stores, setStores] = useState<TenantStore[]>(initialData?.data || [])
  const [meta, setMeta] = useState<ApiMeta | undefined>(initialData?.meta)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modals
  const [isCreating, setIsCreating] = useState(false)
  const [editingStore, setEditingStore] = useState<TenantStore | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchStoresForTenant({
      token,
      tenantId: tenantId === 'all' ? undefined : tenantId,
      search,
      status: statusFilter,
      skip,
      limit: PAGE_SIZE,
    })
      .then((res) => {
        if (cancelled) return
        setStores(res.data || [])
        setMeta(res.meta)
      })
      .catch((err) => {
        if (cancelled) return
        setError(extractApiErrorMessage(err, 'Failed to load stores.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tenantId, search, statusFilter, skip, token])

  async function handleSimulateHeartbeat(storeId: string) {
    startTransition(async () => {
      try {
        const res = await simulateStoreHeartbeat({ token, storeId })
        if (res.success && res.data) {
          setStores((prev) => prev.map((s) => (s.id === storeId ? res.data : s)))
          showToast(`Store ${res.data.storeNo} received heartbeat and is LIVE!`)
        }
      } catch (err) {
        showToast(extractApiErrorMessage(err, 'Failed to simulate heartbeat.'))
      }
    })
  }

  function handleCopyPairingCode(code: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code)
      showToast(`Pairing code ${code} copied to clipboard!`)
    }
  }

  function handleCreated(newStore: TenantStore) {
    setIsCreating(false)
    setStores((prev) => [newStore, ...prev])
    setMeta((prev) => (prev ? { ...prev, total: prev.total + 1 } : prev))
    showToast(`Store "${newStore.name}" added successfully!`)
  }

  function handleUpdated(updatedStore: TenantStore) {
    setEditingStore(null)
    setStores((prev) => prev.map((s) => (s.id === updatedStore.id ? updatedStore : s)))
    showToast(`Store "${updatedStore.name}" updated!`)
  }

  const columns: DataTableColumn<TenantStore>[] = [
    {
      key: 'store',
      header: 'Store',
      render: (s) => (
        <div>
          <div className="font-semibold text-primary">{s.name}</div>
          <div className="text-[11px] font-mono text-muted">{s.storeNo}</div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (s) => (
        <div>
          <div className="text-secondary font-medium">{s.location}</div>
          <div className="text-[11px] text-muted">{s.district} District</div>
        </div>
      ),
    },
    {
      key: 'device',
      header: 'Edge Device / Telemetry',
      render: (s) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                s.status === 'live' ? 'bg-accent animate-pulse' : 'bg-muted'
              }`}
            />
            <span className="text-[11.5px] font-medium capitalize text-primary">
              {s.status === 'live' ? `${s.nodesOnline || 2} nodes active` : s.status}
            </span>
          </div>
          {s.lastHeartbeat ? (
            <div className="text-[10.5px] text-muted">
              Last seen {new Date(s.lastHeartbeat).toLocaleTimeString()}
            </div>
          ) : (
            <div className="text-[10.5px] text-muted font-mono">No heartbeat yet</div>
          )}
        </div>
      ),
    },
    {
      key: 'pairingCode',
      header: 'Pairing Code',
      render: (s) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] bg-surface-alt border border-border px-2 py-0.5 rounded font-semibold text-accent">
            {s.pairingCode}
          </span>
          <button
            type="button"
            title="Copy pairing code"
            onClick={() => handleCopyPairingCode(s.pairingCode)}
            className="text-muted hover:text-accent text-[12px] cursor-pointer"
          >
            📋
          </button>
        </div>
      ),
    },
    {
      key: 'team',
      header: 'Staffing',
      render: (s) => (
        <span className="text-[11.5px] text-secondary">
          {s.managerCount || 1} Managers · {s.employeeCount || 8} Staff
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            s.status === 'live'
              ? 'bg-accent-light text-accent'
              : s.status === 'provisioning'
              ? 'bg-warning/15 text-warning'
              : 'bg-danger/15 text-danger'
          }`}
        >
          {s.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-2">
          {s.status !== 'live' && !readOnly && (
            <button
              type="button"
              onClick={() => handleSimulateHeartbeat(s.id)}
              disabled={isPending}
              className="text-[11px] bg-accent hover:bg-accent-mid text-white px-2 py-0.5 rounded font-medium cursor-pointer"
            >
              Test Heartbeat
            </button>
          )}
          {!readOnly && (
            <button
              type="button"
              onClick={() => setEditingStore(s)}
              className="text-[11.5px] text-secondary hover:text-primary font-medium cursor-pointer"
            >
              Edit
            </button>
          )}
        </div>
      ),
    },
  ]

  const page = meta ? Math.floor(meta.skip / meta.limit) : 0
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1

  return (
    <div className="flex flex-col gap-4">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['all', 'live', 'provisioning', 'offline'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatusFilter(s)
                setSkip(0)
              }}
              className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold capitalize transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border text-secondary hover:text-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="rounded-[8px] bg-accent px-4 py-[9px] text-[12.5px] font-semibold text-white hover:bg-accent-mid transition-colors cursor-pointer"
          >
            + Add Store
          </button>
        )}
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setSkip(0)
        }}
        placeholder="Search stores by name, store number, or location…"
        className="w-full max-w-[360px] rounded-lg border border-border bg-surface px-3 py-[9px] text-[12.5px] outline-none focus:border-accent"
      />

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center animate-pulse text-muted text-[13px]">
          Loading stores...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-danger text-[13px]">
          {error}
        </div>
      ) : stores.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center text-muted text-[13px]">
          No stores found matching your criteria.
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={stores}
          getRowKey={(s) => s.id}
          pagination={{
            page,
            totalPages,
            totalCount: meta?.total ?? stores.length,
            onPrev: () => setSkip(Math.max(0, skip - PAGE_SIZE)),
            onNext: () => setSkip(skip + PAGE_SIZE),
          }}
        />
      )}

      {/* Modals */}
      {isCreating && (
        <CreateStoreModal
          tenantId={tenantId}
          onClose={() => setIsCreating(false)}
          onCreated={handleCreated}
        />
      )}

      {editingStore && (
        <EditStoreModal
          store={editingStore}
          onClose={() => setEditingStore(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}

