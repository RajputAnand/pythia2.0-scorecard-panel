'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import {
  fetchManagers,
  fetchArchivedManagers,
  fetchManagerCredentials,
  archiveManager,
  unarchiveManager,
} from '@/queries/managers'
import { getEmployeeName, getEmployeeInitials, extractApiErrorMessage } from '@/utils/common'
import { useToast } from '@/context/ToastContext'
import { STORES } from '@/lib/store-data'
import DataTable from '@/components/shared/DataTable/DataTable'
import RevealCredentialsModal from '@/components/RevealCredentialsModal/RevealCredentialsModal'
import ConfirmArchiveManagerModal from '@/components/ConfirmArchiveManagerModal/ConfirmArchiveManagerModal'
import CreateManagerModal from '@/components/CreateManagerModal/CreateManagerModal'
import type { ApiManager } from '@/types/manager'
import type { ApiMeta, ApiResponseV2Paginated } from '@/types/api'
import type { DataTableColumn } from '@/types/data-table'

const PAGE_SIZE = 15

const STORE_NAME_BY_ID: Record<string, string> = Object.fromEntries(STORES.map((s) => [s._id, s.name]))

function storeLabels(storeIds: string[]): string {
  if (!storeIds || storeIds.length === 0) return '—'
  return storeIds.map((id) => STORE_NAME_BY_ID[id] ?? id).join(', ')
}

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
      <p className="font-semibold text-[14px]">Failed to load managers</p>
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

function PanelEmpty({ search, view }: { search: string; view: 'active' | 'archived' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">{view === 'archived' ? '🗄️' : '🔍'}</span>
      <p className="font-semibold text-[13px]">
        {view === 'archived' ? 'No archived managers' : 'No managers found'}
      </p>
      {search ? (
        <p className="text-[11.5px] text-muted">No results for &quot;{search}&quot;.</p>
      ) : view === 'archived' ? (
        <p className="text-[11.5px] text-muted">Managers you archive will show up here and can be unarchived.</p>
      ) : null}
    </div>
  )
}

interface ManagerListPanelProps {
  initialData: ApiResponseV2Paginated<ApiManager[]> | null
}

export default function ManagerListPanel({ initialData }: ManagerListPanelProps) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token || session?.user?.token || 'mock_owner_token'
  const { showToast } = useToast()

  const [view, setView] = useState<'active' | 'archived'>('active')
  const [isCreating, setIsCreating] = useState(false)

  // ---- Active managers ----

  const trustedInitialData = initialData && initialData.data.length > 0 ? initialData : null

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [skip, setSkip] = useState(0)
  const [managers, setManagers] = useState<ApiManager[]>(initialData?.data ?? [])
  const [meta, setMeta] = useState<ApiMeta | undefined>(initialData?.meta)
  const [isLoading, setIsLoading] = useState(!trustedInitialData)
  const [isError, setIsError] = useState(false)
  const [revealingId, setRevealingId] = useState<string | null>(null)
  const [unrevealableIds, setUnrevealableIds] = useState<Set<string>>(new Set())
  const [revealed, setRevealed] = useState<{ name: string; userId: string; password: string } | null>(null)
  const [pendingArchive, setPendingArchive] = useState<ApiManager | null>(null)
  const [isArchiving, setIsArchiving] = useState(false)

  const skipNextFetch = useRef(!!trustedInitialData)
  const [retryToken, setRetryToken] = useState(0)

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
    fetchManagers({ token, search: debouncedSearch, skip, limit: PAGE_SIZE })
      .then((response) => {
        if (cancelled) return
        setManagers(response.data ?? [])
        setMeta(response.meta)
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
  }, [token, debouncedSearch, skip, retryToken])

  const page = meta ? Math.floor(meta.skip / meta.limit) : 0
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1

  // ---- Archived managers ----

  const [archivedSearch, setArchivedSearch] = useState('')
  const [archivedDebouncedSearch, setArchivedDebouncedSearch] = useState('')
  const [archivedSkip, setArchivedSkip] = useState(0)
  const [archivedManagers, setArchivedManagers] = useState<ApiManager[]>([])
  const [archivedMeta, setArchivedMeta] = useState<ApiMeta | undefined>(undefined)
  const [isLoadingArchived, setIsLoadingArchived] = useState(false)
  const [isErrorArchived, setIsErrorArchived] = useState(false)
  const [unarchivingId, setUnarchivingId] = useState<string | null>(null)
  const [archivedRetryToken, setArchivedRetryToken] = useState(0)
  const hasLoadedArchived = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setArchivedDebouncedSearch(archivedSearch.trim()), 300)
    return () => clearTimeout(t)
  }, [archivedSearch])

  const [renderedArchivedSearch, setRenderedArchivedSearch] = useState('')
  if (archivedDebouncedSearch !== renderedArchivedSearch) {
    setRenderedArchivedSearch(archivedDebouncedSearch)
    setArchivedSkip(0)
  }

  const loadArchived = useCallback(() => {
    if (!token) return
    hasLoadedArchived.current = true
    setIsLoadingArchived(true)
    setIsErrorArchived(false)
    fetchArchivedManagers({ token, search: archivedDebouncedSearch, skip: archivedSkip, limit: PAGE_SIZE })
      .then((response) => {
        setArchivedManagers(response.data ?? [])
        setArchivedMeta(response.meta)
      })
      .catch(() => setIsErrorArchived(true))
      .finally(() => setIsLoadingArchived(false))
  }, [token, archivedDebouncedSearch, archivedSkip])

  useEffect(() => {
    if (view === 'archived' && token) loadArchived()
  }, [view, token, loadArchived, archivedRetryToken])

  const archivedPage = archivedMeta ? Math.floor(archivedMeta.skip / archivedMeta.limit) : 0
  const archivedTotalPages = archivedMeta ? Math.max(1, Math.ceil(archivedMeta.total / archivedMeta.limit)) : 1

  // ---- Actions ----

  function handleCreated(manager: ApiManager) {
    setIsCreating(false)
    showToast(`${getEmployeeName(manager)} was added`)
    // Refresh the active list so the new manager shows up.
    setRetryToken((n) => n + 1)
  }

  async function handleReveal(manager: ApiManager) {
    if (!token) return
    setRevealingId(manager.user_id)
    try {
      const credentials = await fetchManagerCredentials({ token, userId: manager.user_id })
      setRevealed({ name: getEmployeeName(manager), userId: credentials.user_id, password: credentials.temp_password })
    } catch (err) {
      console.error('Reveal credentials failed:', err)
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setUnrevealableIds((prev) => new Set(prev).add(manager.user_id))
      }
      showToast(extractApiErrorMessage(err, 'Failed to reveal credentials. Please try again.'))
    } finally {
      setRevealingId(null)
    }
  }

  async function handleConfirmArchive() {
    if (!token || !pendingArchive) return
    setIsArchiving(true)
    try {
      await archiveManager({ token, userId: pendingArchive.user_id })
      setManagers((prev) => prev.filter((m) => m.user_id !== pendingArchive.user_id))
      setMeta((prev) => (prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev))
      showToast(`${getEmployeeName(pendingArchive)} was archived`)
      setPendingArchive(null)
      if (hasLoadedArchived.current) setArchivedRetryToken((n) => n + 1)
    } catch (err) {
      console.error('Archive manager failed:', err)
      showToast(extractApiErrorMessage(err, 'Failed to archive manager. Please try again.'))
    } finally {
      setIsArchiving(false)
    }
  }

  async function handleUnarchive(manager: ApiManager) {
    if (!token || unarchivingId) return
    setUnarchivingId(manager.user_id)
    try {
      await unarchiveManager({ token, userId: manager.user_id })
      setArchivedManagers((prev) => prev.filter((m) => m.user_id !== manager.user_id))
      setArchivedMeta((prev) => (prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev))
      showToast(`${getEmployeeName(manager)} was unarchived`)
      setRetryToken((n) => n + 1)
    } catch (err) {
      console.error('Unarchive manager failed:', err)
      showToast(extractApiErrorMessage(err, 'Failed to unarchive manager. Please try again.'))
    } finally {
      setUnarchivingId(null)
    }
  }

  const activeColumns: DataTableColumn<ApiManager>[] = [
    {
      key: 'manager',
      header: 'Manager',
      render: (manager) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center shrink-0 rounded-full bg-accent text-white font-bold w-8 h-8 text-[11px]">
            {getEmployeeInitials(manager)}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{getEmployeeName(manager)}</div>
            <div className="text-[10.5px] text-muted truncate">{manager.user_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (manager) => (
        <>
          <div className="truncate">{manager.email}</div>
          {manager.phone && <div className="text-[10.5px] text-muted truncate">{manager.phone}</div>}
        </>
      ),
    },
    {
      key: 'stores',
      header: 'Stores',
      render: (manager) => (
        <span className="text-[11.5px] text-secondary">{storeLabels(manager.store_ids)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (manager) => (
        <span
          className={`rounded-full px-[10px] py-[3px] text-[10px] font-semibold capitalize ${
            manager.is_active ? 'bg-accent-light text-accent' : 'bg-danger-light text-danger'
          }`}
        >
          {manager.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'credentials',
      header: 'Credentials',
      align: 'right',
      render: (manager) => {
        const canReveal = manager.must_change_password === true && !unrevealableIds.has(manager.user_id)
        const isRevealing = revealingId === manager.user_id

        return canReveal ? (
          <button
            type="button"
            onClick={() => handleReveal(manager)}
            disabled={isRevealing}
            className="text-[11.5px] font-semibold text-accent hover:text-accent-mid disabled:opacity-50 disabled:cursor-default cursor-pointer"
          >
            {isRevealing ? 'Revealing…' : 'Reveal password'}
          </button>
        ) : (
          <span className="text-[11px] text-muted">Password set</span>
        )
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (manager) => (
        <button
          type="button"
          onClick={() => setPendingArchive(manager)}
          className="text-[11.5px] font-semibold text-danger hover:opacity-80 cursor-pointer"
        >
          Archive
        </button>
      ),
    },
  ]

  const archivedColumns: DataTableColumn<ApiManager>[] = [
    {
      key: 'manager',
      header: 'Manager',
      render: (manager) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center shrink-0 rounded-full bg-border text-secondary font-bold w-8 h-8 text-[11px]">
            {getEmployeeInitials(manager)}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{getEmployeeName(manager)}</div>
            <div className="text-[10.5px] text-muted truncate">{manager.user_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (manager) => (
        <>
          <div className="truncate">{manager.email}</div>
          {manager.phone && <div className="text-[10.5px] text-muted truncate">{manager.phone}</div>}
        </>
      ),
    },
    {
      key: 'stores',
      header: 'Stores',
      render: (manager) => (
        <span className="text-[11.5px] text-secondary">{storeLabels(manager.store_ids)}</span>
      ),
    },
    {
      key: 'archived_at',
      header: 'Archived',
      render: (manager) =>
        manager.archived_at ? (
          <span className="text-[11.5px] text-muted">{new Date(manager.archived_at).toLocaleDateString()}</span>
        ) : (
          <span className="text-[11.5px] text-muted">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (manager) => (
        <button
          type="button"
          onClick={() => handleUnarchive(manager)}
          disabled={unarchivingId === manager.user_id}
          className="text-[11.5px] font-semibold text-accent hover:text-accent-mid disabled:opacity-50 disabled:cursor-default cursor-pointer"
        >
          {unarchivingId === manager.user_id ? 'Unarchiving…' : 'Unarchive'}
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView('active')}
            className={`rounded-full px-[14px] py-[6px] text-[12px] font-semibold transition-colors duration-150 cursor-pointer ${
              view === 'active' ? 'bg-accent text-white' : 'bg-surface border border-border text-secondary hover:text-primary'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setView('archived')}
            className={`rounded-full px-[14px] py-[6px] text-[12px] font-semibold transition-colors duration-150 cursor-pointer ${
              view === 'archived' ? 'bg-accent text-white' : 'bg-surface border border-border text-secondary hover:text-primary'
            }`}
          >
            Archived
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="rounded-[8px] bg-accent px-4 py-[9px] text-[12.5px] font-semibold text-white hover:bg-accent-mid transition-colors cursor-pointer"
        >
          + New Manager
        </button>
      </div>

      <input
        type="text"
        value={view === 'active' ? search : archivedSearch}
        onChange={(e) => (view === 'active' ? setSearch(e.target.value) : setArchivedSearch(e.target.value))}
        placeholder="Search managers by name…"
        className="w-full max-w-[320px] rounded-lg border border-border bg-surface px-3 py-[9px] text-[12.5px] outline-none focus:border-accent transition-colors duration-150"
      />

      {view === 'active' ? (
        isError ? (
          <PanelError onRetry={() => setRetryToken((n) => n + 1)} />
        ) : isLoading ? (
          <TableSkeleton />
        ) : managers.length === 0 ? (
          <PanelEmpty search={debouncedSearch} view="active" />
        ) : (
          <DataTable
            columns={activeColumns}
            rows={managers}
            getRowKey={(manager) => manager.user_id}
            pagination={{
              page,
              totalPages,
              totalCount: meta?.total ?? managers.length,
              onPrev: () => setSkip(Math.max(0, skip - PAGE_SIZE)),
              onNext: () => setSkip(skip + PAGE_SIZE),
            }}
          />
        )
      ) : isErrorArchived ? (
        <PanelError onRetry={() => setArchivedRetryToken((n) => n + 1)} />
      ) : isLoadingArchived ? (
        <TableSkeleton />
      ) : archivedManagers.length === 0 ? (
        <PanelEmpty search={archivedDebouncedSearch} view="archived" />
      ) : (
        <DataTable
          columns={archivedColumns}
          rows={archivedManagers}
          getRowKey={(manager) => manager.user_id}
          pagination={{
            page: archivedPage,
            totalPages: archivedTotalPages,
            totalCount: archivedMeta?.total ?? archivedManagers.length,
            onPrev: () => setArchivedSkip(Math.max(0, archivedSkip - PAGE_SIZE)),
            onNext: () => setArchivedSkip(archivedSkip + PAGE_SIZE),
          }}
        />
      )}

      {isCreating && token && (
        <CreateManagerModal token={token} onClose={() => setIsCreating(false)} onCreated={handleCreated} />
      )}

      {revealed && (
        <RevealCredentialsModal
          employeeName={revealed.name}
          userId={revealed.userId}
          password={revealed.password}
          onClose={() => setRevealed(null)}
        />
      )}

      {pendingArchive && (
        <ConfirmArchiveManagerModal
          managerName={getEmployeeName(pendingArchive)}
          isArchiving={isArchiving}
          onConfirm={handleConfirmArchive}
          onCancel={() => setPendingArchive(null)}
        />
      )}
    </div>
  )
}
