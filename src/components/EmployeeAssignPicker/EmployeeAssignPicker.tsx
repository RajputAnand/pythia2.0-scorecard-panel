'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { fetchEmployees } from '@/queries/employees'
import { assignUnknownIdentity } from '@/queries/unknown-identities'
import { useToast } from '@/context/ToastContext'
import { getEmployeeName, getEmployeeInitials } from '@/utils/common'
import CreateEmployeeModal from '@/components/CreateEmployeeModal/CreateEmployeeModal'
import type { ApiEmployee } from '@/types/employee'
import type { ApiMeta } from '@/types/api'
import type { UnknownIdentity } from '@/types/unknown-identity'

const PAGE_LIMIT = 8

interface EmployeeAssignPickerProps {
  identity: UnknownIdentity
  onAssigned: () => void
}

export default function EmployeeAssignPicker({ identity, onAssigned }: EmployeeAssignPickerProps) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [renderedSearch, setRenderedSearch] = useState('')
  const [skip, setSkip] = useState(0)
  const [open, setOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<ApiEmployee | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  // Reset back to the first page whenever the (debounced) search term changes.
  if (debouncedSearch !== renderedSearch) {
    setRenderedSearch(debouncedSearch)
    setSkip(0)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const [employees, setEmployees] = useState<ApiEmployee[]>([])
  const [meta, setMeta] = useState<ApiMeta | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setIsLoading(true)
    fetchEmployees({ token, search: debouncedSearch, skip, limit: PAGE_LIMIT })
      .then((response) => {
        if (cancelled) return
        setEmployees(response.data ?? [])
        setMeta(response.meta)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, debouncedSearch, skip, refreshKey])

  const page = meta ? Math.floor(meta.skip / meta.limit) : 0
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1
  const isResolved = identity.status === 'resolved'

  async function handleAssign() {
    if (!selectedEmployee || !token || isResolved) return
    setIsPending(true)
    try {
      await assignUnknownIdentity({ token, identityId: identity.id, userId: selectedEmployee._id })
      showToast(`Assigned ${getEmployeeName(selectedEmployee)} to this identity`)
      setSelectedEmployee(null)
      setSearch('')
      onAssigned()
    } catch {
      showToast('Failed to assign employee. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  function handleEmployeeCreated(employee: ApiEmployee) {
    setSelectedEmployee(employee)
    setShowCreateModal(false)
    setOpen(false)
    setSearch('')
    setSkip(0)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="bg-surface border border-border rounded-[14px] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-[13.5px] font-semibold">Assign to Employee</div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="text-[11.5px] font-semibold text-accent hover:text-accent-mid cursor-pointer"
        >
          + New Employee
        </button>
      </div>

      <div ref={dropdownRef} className="relative">
        {selectedEmployee ? (
          <div className="flex items-center gap-[10px] rounded-lg border border-border bg-surface-alt px-3 py-[9px]">
            <div className="flex items-center justify-center shrink-0 rounded-full bg-accent text-white font-bold w-7 h-7 text-[10.5px]">
              {getEmployeeInitials(selectedEmployee)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-medium truncate">{getEmployeeName(selectedEmployee)}</div>
              <div className="text-[10.5px] text-muted truncate">{selectedEmployee.email}</div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedEmployee(null)}
              aria-label="Clear selected employee"
              className="shrink-0 text-muted hover:text-danger transition-colors duration-150 cursor-pointer"
            >
              <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search employees by name…"
            className="w-full rounded-lg border border-border bg-surface px-3 py-[9px] text-[12.5px] outline-none focus:border-accent transition-colors duration-150"
          />
        )}

        {open && !selectedEmployee && (
          <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-30 bg-surface border border-border rounded-[10px] shadow-[0_8px_24px_-4px_rgba(26,23,20,0.12),0_2px_8px_-2px_rgba(26,23,20,0.06)] overflow-hidden">
            <ul role="listbox" aria-label="Select employee" className="max-h-[220px] overflow-y-auto list-none m-0 p-[4px]">
              {isLoading ? (
                <li className="px-[10px] py-[14px] text-center text-[12px] text-muted">Loading…</li>
              ) : employees.length === 0 ? (
                <li className="px-[10px] py-[14px] text-center text-[12px] text-muted">No employees found</li>
              ) : (
                employees.map((employee) => (
                  <li
                    key={employee.user_id}
                    role="option"
                    aria-selected={false}
                    onClick={() => {
                      setSelectedEmployee(employee)
                      setOpen(false)
                    }}
                    className="flex items-center gap-[9px] rounded-md cursor-pointer transition-colors duration-100 px-[10px] py-[8px] hover:bg-surface-alt"
                  >
                    <div className="flex items-center justify-center shrink-0 rounded-full bg-surface-alt text-secondary font-bold w-7 h-7 text-[10.5px]">
                      {getEmployeeInitials(employee)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-medium truncate">{getEmployeeName(employee)}</div>
                      <div className="text-[10.5px] text-muted truncate">{employee.email}</div>
                    </div>
                  </li>
                ))
              )}
            </ul>

            {meta && meta.total > meta.limit && (
              <div className="flex items-center justify-between border-t border-border px-[10px] py-[7px]">
                <button
                  type="button"
                  onClick={() => setSkip(Math.max(0, skip - PAGE_LIMIT))}
                  disabled={page <= 0 || isLoading}
                  className="text-[11px] font-medium text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-default cursor-pointer"
                >
                  ‹ Prev
                </button>
                <span className="text-[10.5px] text-muted">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setSkip(skip + PAGE_LIMIT)}
                  disabled={page + 1 >= totalPages || isLoading}
                  className="text-[11px] font-medium text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-default cursor-pointer"
                >
                  Next ›
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleAssign}
        disabled={!selectedEmployee || isPending || isResolved}
        className="w-full rounded-[9px] border-0 bg-accent px-4 py-[10px] text-[12.5px] font-semibold text-white transition-all duration-150 hover:opacity-85 disabled:cursor-default disabled:opacity-40 cursor-pointer"
      >
        {isResolved ? 'Already Resolved' : isPending ? 'Assigning…' : 'Assign Employee'}
      </button>

      {showCreateModal && token && (
        <CreateEmployeeModal
          token={token}
          // sourceImages={identity.images} — disabled with the photo upload/prefill logic, see CreateEmployeeModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleEmployeeCreated}
        />
      )}
    </div>
  )
}
