'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import {
  fetchEmployees,
  fetchArchivedEmployees,
  fetchEmployeeCredentials,
  archiveEmployee,
  unarchiveEmployee,
} from '@/queries/employees'
import { getEmployeeName, getEmployeeInitials, extractApiErrorMessage } from '@/utils/common'
import { useToast } from '@/context/ToastContext'
import DataTable from '@/components/shared/DataTable/DataTable'
import RevealCredentialsModal from '@/components/RevealCredentialsModal/RevealCredentialsModal'
import ConfirmArchiveEmployeeModal from '@/components/ConfirmArchiveEmployeeModal/ConfirmArchiveEmployeeModal'
import type { ApiEmployee } from '@/types/employee'
import type { ApiMeta, ApiResponseV2Paginated } from '@/types/api'
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
      <p className="font-semibold text-[14px]">Failed to load employees</p>
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
        {view === 'archived' ? 'No archived employees' : 'No employees found'}
      </p>
      {search ? (
        <p className="text-[11.5px] text-muted">No results for &quot;{search}&quot;.</p>
      ) : view === 'archived' ? (
        <p className="text-[11.5px] text-muted">Employees you archive will show up here and can be unarchived.</p>
      ) : null}
    </div>
  )
}

interface EmployeeListPanelProps {
  initialData: ApiResponseV2Paginated<ApiEmployee[]> | null
}

export default function EmployeeListPanel({ initialData }: EmployeeListPanelProps) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token
  const { showToast } = useToast()

  const [view, setView] = useState<'active' | 'archived'>('active')

  // ---- Active employees ----

  // Only trust the server-seeded page if it actually came back with rows —
  // an empty `data` array is indistinguishable from "genuinely no employees"
  // and "the SSR request raced ahead of some server-side state and came back
  // empty", so treat an empty seed as unconfirmed and let the client re-fetch
  // to correct it instead of flashing an incorrect empty state until reload.
  const trustedInitialData = initialData && initialData.data.length > 0 ? initialData : null

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [skip, setSkip] = useState(0)
  const [employees, setEmployees] = useState<ApiEmployee[]>(initialData?.data ?? [])
  const [meta, setMeta] = useState<ApiMeta | undefined>(initialData?.meta)
  const [isLoading, setIsLoading] = useState(!trustedInitialData)
  const [isError, setIsError] = useState(false)
  const [revealingId, setRevealingId] = useState<string | null>(null)
  const [unrevealableIds, setUnrevealableIds] = useState<Set<string>>(new Set())
  const [revealed, setRevealed] = useState<{ name: string; userId: string; password: string } | null>(null)
  const [pendingArchive, setPendingArchive] = useState<ApiEmployee | null>(null)
  const [isArchiving, setIsArchiving] = useState(false)

  // Skips exactly the first fetch after mount when the server already seeded
  // page 1 with real rows — every subsequent search/pagination/retry change
  // fetches normally, and an empty/untrusted seed always re-fetches.
  const skipNextFetch = useRef(!!trustedInitialData)
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  // Reset back to the first page whenever the (debounced) search term changes.
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
    fetchEmployees({ token, search: debouncedSearch, skip, limit: PAGE_SIZE })
      .then((response) => {
        if (cancelled) return
        setEmployees(response.data ?? [])
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
    // retryToken intentionally re-runs this effect on manual retry without changing search/skip
  }, [token, debouncedSearch, skip, retryToken])

  const page = meta ? Math.floor(meta.skip / meta.limit) : 0
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1

  // ---- Archived employees ----

  const [archivedSearch, setArchivedSearch] = useState('')
  const [archivedDebouncedSearch, setArchivedDebouncedSearch] = useState('')
  const [archivedSkip, setArchivedSkip] = useState(0)
  const [archivedEmployees, setArchivedEmployees] = useState<ApiEmployee[]>([])
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
    fetchArchivedEmployees({ token, search: archivedDebouncedSearch, skip: archivedSkip, limit: PAGE_SIZE })
      .then((response) => {
        setArchivedEmployees(response.data ?? [])
        setArchivedMeta(response.meta)
      })
      .catch(() => setIsErrorArchived(true))
      .finally(() => setIsLoadingArchived(false))
  }, [token, archivedDebouncedSearch, archivedSkip])

  // Fetch archived employees lazily, the first time the manager switches to that tab.
  useEffect(() => {
    if (view === 'archived' && token) loadArchived()
  }, [view, token, loadArchived, archivedRetryToken])

  const archivedPage = archivedMeta ? Math.floor(archivedMeta.skip / archivedMeta.limit) : 0
  const archivedTotalPages = archivedMeta ? Math.max(1, Math.ceil(archivedMeta.total / archivedMeta.limit)) : 1

  // ---- Actions ----

  async function handleReveal(employee: ApiEmployee) {
    if (!token) return
    setRevealingId(employee.user_id)
    try {
      const credentials = await fetchEmployeeCredentials({ token, userId: employee.user_id })
      setRevealed({ name: getEmployeeName(employee), userId: credentials.user_id, password: credentials.temp_password })
    } catch (err) {
      console.error('Reveal credentials failed:', err)
      // Only a 409 (already changed, or nothing recoverable on file) is an
      // expected steady state per the API docs — stop offering the action
      // for this row in that case. Any other failure (network blip, 5xx,
      // token issue) should stay retryable, not get permanently stuck.
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setUnrevealableIds((prev) => new Set(prev).add(employee.user_id))
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
      await archiveEmployee({ token, userId: pendingArchive.user_id })
      setEmployees((prev) => prev.filter((e) => e.user_id !== pendingArchive.user_id))
      setMeta((prev) => (prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev))
      showToast(`${getEmployeeName(pendingArchive)} was archived`)
      setPendingArchive(null)
      // Invalidate the archived tab so it's fresh next time it's opened (or refetch now if already loaded).
      if (hasLoadedArchived.current) setArchivedRetryToken((n) => n + 1)
    } catch (err) {
      console.error('Archive employee failed:', err)
      showToast(extractApiErrorMessage(err, 'Failed to archive employee. Please try again.'))
    } finally {
      setIsArchiving(false)
    }
  }

  async function handleUnarchive(employee: ApiEmployee) {
    if (!token || unarchivingId) return
    setUnarchivingId(employee.user_id)
    try {
      await unarchiveEmployee({ token, userId: employee.user_id })
      setArchivedEmployees((prev) => prev.filter((e) => e.user_id !== employee.user_id))
      setArchivedMeta((prev) => (prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev))
      showToast(`${getEmployeeName(employee)} was unarchived`)
      // The active list may currently be showing stale data (missing this employee) — refresh it.
      setRetryToken((n) => n + 1)
    } catch (err) {
      console.error('Unarchive employee failed:', err)
      showToast(extractApiErrorMessage(err, 'Failed to unarchive employee. Please try again.'))
    } finally {
      setUnarchivingId(null)
    }
  }

  const activeColumns: DataTableColumn<ApiEmployee>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (employee) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center shrink-0 rounded-full bg-accent text-white font-bold w-8 h-8 text-[11px]">
            {getEmployeeInitials(employee)}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{getEmployeeName(employee)}</div>
            <div className="text-[10.5px] text-muted truncate capitalize">{employee.role_name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (employee) => (
        <>
          <div className="truncate">{employee.email}</div>
          {employee.phone && <div className="text-[10.5px] text-muted truncate">{employee.phone}</div>}
        </>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (employee) => (
        <span
          className={`rounded-full px-[10px] py-[3px] text-[10px] font-semibold capitalize ${
            employee.is_active ? 'bg-accent-light text-accent' : 'bg-danger-light text-danger'
          }`}
        >
          {employee.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'credentials',
      header: 'Credentials',
      align: 'right',
      render: (employee) => {
        // "Password set" by default — only offer the reveal action when the
        // record explicitly confirms there's still a recoverable temp
        // password, or once a 409 proves otherwise.
        const canReveal = employee.must_change_password === true && !unrevealableIds.has(employee.user_id)
        const isRevealing = revealingId === employee.user_id

        return canReveal ? (
          <button
            type="button"
            onClick={() => handleReveal(employee)}
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
      render: (employee) => (
        <button
          type="button"
          onClick={() => setPendingArchive(employee)}
          className="text-[11.5px] font-semibold text-danger hover:opacity-80 cursor-pointer"
        >
          Archive
        </button>
      ),
    },
  ]

  const archivedColumns: DataTableColumn<ApiEmployee>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (employee) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center shrink-0 rounded-full bg-border text-secondary font-bold w-8 h-8 text-[11px]">
            {getEmployeeInitials(employee)}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{getEmployeeName(employee)}</div>
            <div className="text-[10.5px] text-muted truncate capitalize">{employee.role_name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (employee) => (
        <>
          <div className="truncate">{employee.email}</div>
          {employee.phone && <div className="text-[10.5px] text-muted truncate">{employee.phone}</div>}
        </>
      ),
    },
    {
      key: 'archived_at',
      header: 'Archived',
      render: (employee) =>
        employee.archived_at ? (
          <span className="text-[11.5px] text-muted">{new Date(employee.archived_at).toLocaleDateString()}</span>
        ) : (
          <span className="text-[11.5px] text-muted">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (employee) => (
        <button
          type="button"
          onClick={() => handleUnarchive(employee)}
          disabled={unarchivingId === employee.user_id}
          className="text-[11.5px] font-semibold text-accent hover:text-accent-mid disabled:opacity-50 disabled:cursor-default cursor-pointer"
        >
          {unarchivingId === employee.user_id ? 'Unarchiving…' : 'Unarchive'}
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
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

      <input
        type="text"
        value={view === 'active' ? search : archivedSearch}
        onChange={(e) => (view === 'active' ? setSearch(e.target.value) : setArchivedSearch(e.target.value))}
        placeholder="Search employees by name…"
        className="w-full max-w-[320px] rounded-lg border border-border bg-surface px-3 py-[9px] text-[12.5px] outline-none focus:border-accent transition-colors duration-150"
      />

      {view === 'active' ? (
        isError ? (
          <PanelError onRetry={() => setRetryToken((n) => n + 1)} />
        ) : isLoading ? (
          <TableSkeleton />
        ) : employees.length === 0 ? (
          <PanelEmpty search={debouncedSearch} view="active" />
        ) : (
          <DataTable
            columns={activeColumns}
            rows={employees}
            getRowKey={(employee) => employee.user_id}
            pagination={{
              page,
              totalPages,
              totalCount: meta?.total ?? employees.length,
              onPrev: () => setSkip(Math.max(0, skip - PAGE_SIZE)),
              onNext: () => setSkip(skip + PAGE_SIZE),
            }}
          />
        )
      ) : isErrorArchived ? (
        <PanelError onRetry={() => setArchivedRetryToken((n) => n + 1)} />
      ) : isLoadingArchived ? (
        <TableSkeleton />
      ) : archivedEmployees.length === 0 ? (
        <PanelEmpty search={archivedDebouncedSearch} view="archived" />
      ) : (
        <DataTable
          columns={archivedColumns}
          rows={archivedEmployees}
          getRowKey={(employee) => employee.user_id}
          pagination={{
            page: archivedPage,
            totalPages: archivedTotalPages,
            totalCount: archivedMeta?.total ?? archivedEmployees.length,
            onPrev: () => setArchivedSkip(Math.max(0, archivedSkip - PAGE_SIZE)),
            onNext: () => setArchivedSkip(archivedSkip + PAGE_SIZE),
          }}
        />
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
        <ConfirmArchiveEmployeeModal
          employeeName={getEmployeeName(pendingArchive)}
          isArchiving={isArchiving}
          onConfirm={handleConfirmArchive}
          onCancel={() => setPendingArchive(null)}
        />
      )}
    </div>
  )
}
