'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useSession } from 'next-auth/react'
import {
  fetchStoresForTenant,
  fetchDeactivatedStores,
  deactivateStore,
  activateStore,
  simulateStoreHeartbeat,
} from '@/queries/stores'
import { useToast } from '@/context/ToastContext'
import { extractApiErrorMessage } from '@/utils/common'
import DataTable from '@/components/shared/DataTable/DataTable'
import CreateStoreModal from '@/components/CreateStoreModal/CreateStoreModal'
import EditStoreModal from '@/components/EditStoreModal/EditStoreModal'
import ConfirmDeactivateStoreModal from '@/components/ConfirmDeactivateStoreModal/ConfirmDeactivateStoreModal'
import type { TenantStore } from '@/types/tenant'
import type { ApiResponseV2Paginated, ApiMeta } from '@/types/api'
import type { DataTableColumn } from '@/types/data-table'

const PAGE_SIZE = 15

function TableSkeleton() {
  return (
    <div className="rounded-[10px] border border-border bg-surface overflow-hidden animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[52px] border-b border-border last:border-b-0 bg-surface-alt/40" />
      ))}
    </div>
  )
}

function PanelError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">⚠️</span>
      <p className="font-semibold text-[14px]">Failed to load stores</p>
      <p className="text-[12px] text-muted">Check your connection and try again.</p>
      <button
        type="button"
        className="mt-1 rounded-[8px] border-0 bg-accent px-4 py-2 text-[12.5px] font-semibold text-white hover:opacity-85 cursor-pointer"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  )
}

function PanelEmpty({ search, view }: { search: string; view: 'active' | 'deactivated' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">{view === 'deactivated' ? '🗄️' : '🔍'}</span>
      <p className="font-semibold text-[13px]">
        {view === 'deactivated' ? 'No deactivated stores' : 'No stores found'}
      </p>
      {search ? (
        <p className="text-[11.5px] text-muted">No results for &quot;{search}&quot;.</p>
      ) : view === 'deactivated' ? (
        <p className="text-[11.5px] text-muted">Stores you deactivate will show up here and can be reactivated anytime.</p>
      ) : (
        <p className="text-[11.5px] text-muted">Click &quot;+ Add Store&quot; above to create your first store location.</p>
      )}
    </div>
  )
}

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
  const token = session?.user?.pythia2Token || session?.user?.token || 'mock_owner_token'
  const { showToast } = useToast()
  const [isHeartbeating, startTransition] = useTransition()

  const [view, setView] = useState<'active' | 'deactivated'>('active')

  // Modals
  const [isCreating, setIsCreating] = useState(false)
  const [editingStore, setEditingStore] = useState<TenantStore | null>(null)
  const [pendingDeactivate, setPendingDeactivate] = useState<TenantStore | null>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [activatingId, setActivatingId] = useState<string | null>(null)

  // ---- Active Stores ----
  const trustedInitialData = initialData && initialData.data.length > 0 ? initialData : null

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [skip, setSkip] = useState(0)
  const [stores, setStores] = useState<TenantStore[]>(initialData?.data ?? [])
  const [meta, setMeta] = useState<ApiMeta | undefined>(initialData?.meta)
  const [isLoading, setIsLoading] = useState(!trustedInitialData)
  const [isError, setIsError] = useState(false)
  const [retryToken, setRetryToken] = useState(0)
  const skipNextFetch = useRef(!!trustedInitialData)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  const [renderedSearch, setRenderedSearch] = useState('')
  if (debouncedSearch !== renderedSearch) {
    setRenderedSearch(debouncedSearch)
    setSkip(0)
  }

  useEffect(() => {
    if (!token) return
    if (skipNextFetch.current) {
      skipNextFetch.current = false
      return
    }
    let cancelled = false
    setIsLoading(true)
    setIsError(false)

    fetchStoresForTenant({
      token,
      tenantId: tenantId === 'all' ? undefined : tenantId,
      search: debouncedSearch,
      skip,
      limit: PAGE_SIZE,
    })
      .then((res) => {
        if (cancelled) return
        setStores(res.data ?? [])
        setMeta(res.meta)
      })
      .catch(() => {
        if (!cancelled) setIsError(true)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, tenantId, debouncedSearch, skip, retryToken])

  const page = meta ? Math.floor(meta.skip / meta.limit) : 0
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1

  // ---- Deactivated Stores ----
  const [deactivatedSearch, setDeactivatedSearch] = useState('')
  const [deactivatedDebouncedSearch, setDeactivatedDebouncedSearch] = useState('')
  const [deactivatedSkip, setDeactivatedSkip] = useState(0)
  const [deactivatedStores, setDeactivatedStores] = useState<TenantStore[]>([])
  const [deactivatedMeta, setDeactivatedMeta] = useState<ApiMeta | undefined>(undefined)
  const [isLoadingDeactivated, setIsLoadingDeactivated] = useState(false)
  const [isErrorDeactivated, setIsErrorDeactivated] = useState(false)
  const [deactivatedRetryToken, setDeactivatedRetryToken] = useState(0)
  const hasLoadedDeactivated = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setDeactivatedDebouncedSearch(deactivatedSearch.trim()), 300)
    return () => clearTimeout(t)
  }, [deactivatedSearch])

  const [renderedDeactivatedSearch, setRenderedDeactivatedSearch] = useState('')
  if (deactivatedDebouncedSearch !== renderedDeactivatedSearch) {
    setRenderedDeactivatedSearch(deactivatedDebouncedSearch)
    setDeactivatedSkip(0)
  }

  const loadDeactivated = useCallback(() => {
    if (!token) return
    hasLoadedDeactivated.current = true
    setIsLoadingDeactivated(true)
    setIsErrorDeactivated(false)

    fetchDeactivatedStores({
      token,
      tenantId: tenantId === 'all' ? undefined : tenantId,
      search: deactivatedDebouncedSearch,
      skip: deactivatedSkip,
      limit: PAGE_SIZE,
    })
      .then((res) => {
        setDeactivatedStores(res.data ?? [])
        setDeactivatedMeta(res.meta)
      })
      .catch(() => setIsErrorDeactivated(true))
      .finally(() => setIsLoadingDeactivated(false))
  }, [token, tenantId, deactivatedDebouncedSearch, deactivatedSkip])

  useEffect(() => {
    if (view === 'deactivated' && token) {
      loadDeactivated()
    }
  }, [view, token, loadDeactivated, deactivatedRetryToken])

  const deactivatedPage = deactivatedMeta ? Math.floor(deactivatedMeta.skip / deactivatedMeta.limit) : 0
  const deactivatedTotalPages = deactivatedMeta ? Math.max(1, Math.ceil(deactivatedMeta.total / deactivatedMeta.limit)) : 1

  // ---- Action Handlers ----

  function handleCopyPairingCode(code: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code)
      showToast(`Pairing code ${code} copied to clipboard!`)
    }
  }

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

  function handleCreated(newStore: TenantStore) {
    setIsCreating(false)
    showToast(`Store "${newStore.name}" added successfully!`)
    setRetryToken((n) => n + 1)
  }

  function handleUpdated(updatedStore: TenantStore) {
    setEditingStore(null)
    setStores((prev) => prev.map((s) => (s.id === updatedStore.id ? updatedStore : s)))
    if (hasLoadedDeactivated.current) {
      setDeactivatedStores((prev) => prev.map((s) => (s.id === updatedStore.id ? updatedStore : s)))
    }
    showToast(`Store "${updatedStore.name}" updated!`)
  }

  async function handleConfirmDeactivate() {
    if (!pendingDeactivate) return
    setIsDeactivating(true)
    try {
      await deactivateStore({ token, storeId: pendingDeactivate.id })
      setStores((prev) => prev.filter((s) => s.id !== pendingDeactivate.id))
      setMeta((prev) => (prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev))
      showToast(`Store "${pendingDeactivate.name}" was deactivated`)
      setPendingDeactivate(null)
      if (hasLoadedDeactivated.current) {
        setDeactivatedRetryToken((n) => n + 1)
      }
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to deactivate store. Please try again.'))
    } finally {
      setIsDeactivating(false)
    }
  }

  async function handleActivate(store: TenantStore) {
    if (activatingId) return
    setActivatingId(store.id)
    try {
      await activateStore({ token, storeId: store.id })
      setDeactivatedStores((prev) => prev.filter((s) => s.id !== store.id))
      setDeactivatedMeta((prev) => (prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev))
      showToast(`Store "${store.name}" was activated`)
      setRetryToken((n) => n + 1)
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to activate store. Please try again.'))
    } finally {
      setActivatingId(null)
    }
  }

  // ---- Active Table Columns ----
  const activeColumns: DataTableColumn<TenantStore>[] = [
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
      header: 'Location & Full Address',
      render: (s) => {
        const addressText = s.fullAddress || (s.address ? `${s.address.street || ''}, ${s.address.city || ''} ${s.address.state || ''}`.trim() : '')
        return (
          <div className="max-w-[280px]">
            <div className="text-secondary font-medium text-[12.5px]">{s.location} · <span className="text-muted text-[11px]">{s.district}</span></div>
            {addressText && (
              <div className="text-[11px] text-muted truncate mt-0.5" title={addressText}>
                {addressText}
              </div>
            )}
          </div>
        )
      },
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
              Last seen {new Date(s.lastHeartbeat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        <div className="flex items-center justify-end gap-2.5">
          {s.status !== 'live' && !readOnly && (
            <button
              type="button"
              onClick={() => handleSimulateHeartbeat(s.id)}
              disabled={isHeartbeating}
              className="text-[11px] bg-accent hover:bg-accent-mid text-white px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors"
            >
              Test Heartbeat
            </button>
          )}
          {!readOnly && (
            <>
              <button
                type="button"
                onClick={() => setEditingStore(s)}
                className="text-[11.5px] text-secondary hover:text-primary font-semibold cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setPendingDeactivate(s)}
                className="text-[11.5px] font-semibold text-danger hover:opacity-80 cursor-pointer"
              >
                Deactivate
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  // ---- Deactivated Table Columns ----
  const deactivatedColumns: DataTableColumn<TenantStore>[] = [
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
      header: 'Location & Full Address',
      render: (s) => {
        const addressText = s.fullAddress || (s.address ? `${s.address.street || ''}, ${s.address.city || ''} ${s.address.state || ''}`.trim() : '')
        return (
          <div className="max-w-[280px]">
            <div className="text-secondary font-medium text-[12.5px]">{s.location} · <span className="text-muted text-[11px]">{s.district}</span></div>
            {addressText && (
              <div className="text-[11px] text-muted truncate mt-0.5" title={addressText}>
                {addressText}
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: 'deactivated_at',
      header: 'Deactivated At',
      render: (s) => (
        <span className="text-[11.5px] text-muted">
          {s.deactivated_at ? new Date(s.deactivated_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'pairingCode',
      header: 'Pairing Code',
      render: (s) => (
        <span className="font-mono text-[11px] bg-surface-alt border border-border px-2 py-0.5 rounded text-secondary">
          {s.pairingCode}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: () => (
        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-danger/15 text-danger">
          Deactivated
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end">
          {!readOnly && (
            <button
              type="button"
              onClick={() => handleActivate(s)}
              disabled={activatingId === s.id}
              className="text-[11.5px] font-semibold text-accent hover:text-accent-mid disabled:opacity-50 disabled:cursor-default cursor-pointer"
            >
              {activatingId === s.id ? 'Activating…' : 'Activate'}
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Top action bar: Tabs + Add Store button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView('active')}
            className={`rounded-full px-[14px] py-[6px] text-[12px] font-semibold transition-colors duration-150 cursor-pointer ${
              view === 'active'
                ? 'bg-accent text-white'
                : 'bg-surface border border-border text-secondary hover:text-primary'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setView('deactivated')}
            className={`rounded-full px-[14px] py-[6px] text-[12px] font-semibold transition-colors duration-150 cursor-pointer ${
              view === 'deactivated'
                ? 'bg-accent text-white'
                : 'bg-surface border border-border text-secondary hover:text-primary'
            }`}
          >
            Deactivated
          </button>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="rounded-[8px] bg-accent px-4 py-[9px] text-[12.5px] font-semibold text-white hover:bg-accent-mid transition-colors cursor-pointer shadow-sm"
          >
            + Add Store
          </button>
        )}
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={view === 'active' ? search : deactivatedSearch}
        onChange={(e) =>
          view === 'active' ? setSearch(e.target.value) : setDeactivatedSearch(e.target.value)
        }
        placeholder="Search stores by name, code, location, or address…"
        className="w-full max-w-[340px] rounded-lg border border-border bg-surface px-3 py-[9px] text-[12.5px] outline-none focus:border-accent transition-colors duration-150"
      />

      {/* Table view */}
      {view === 'active' ? (
        isError ? (
          <PanelError onRetry={() => setRetryToken((n) => n + 1)} />
        ) : isLoading ? (
          <TableSkeleton />
        ) : stores.length === 0 ? (
          <PanelEmpty search={debouncedSearch} view="active" />
        ) : (
          <DataTable
            columns={activeColumns}
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
        )
      ) : isErrorDeactivated ? (
        <PanelError onRetry={() => setDeactivatedRetryToken((n) => n + 1)} />
      ) : isLoadingDeactivated ? (
        <TableSkeleton />
      ) : deactivatedStores.length === 0 ? (
        <PanelEmpty search={deactivatedDebouncedSearch} view="deactivated" />
      ) : (
        <DataTable
          columns={deactivatedColumns}
          rows={deactivatedStores}
          getRowKey={(s) => s.id}
          pagination={{
            page: deactivatedPage,
            totalPages: deactivatedTotalPages,
            totalCount: deactivatedMeta?.total ?? deactivatedStores.length,
            onPrev: () => setDeactivatedSkip(Math.max(0, deactivatedSkip - PAGE_SIZE)),
            onNext: () => setDeactivatedSkip(deactivatedSkip + PAGE_SIZE),
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

      {pendingDeactivate && (
        <ConfirmDeactivateStoreModal
          storeName={pendingDeactivate.name}
          storeNo={pendingDeactivate.storeNo}
          isDeactivating={isDeactivating}
          onConfirm={handleConfirmDeactivate}
          onCancel={() => setPendingDeactivate(null)}
        />
      )}
    </div>
  )
}

