'use client'

import { useState, useEffect, useTransition } from 'react'
import { useSession } from 'next-auth/react'
import {
  fetchOwners,
  fetchArchivedOwners,
  fetchOwnerCredentials,
  archiveOwner,
  unarchiveOwner,
} from '@/queries/owners'
import { useToast } from '@/context/ToastContext'
import { extractApiErrorMessage } from '@/utils/common'
import DataTable from '@/components/shared/DataTable/DataTable'
import Select from '@/components/shared/Select/Select'
import RevealCredentialsModal from '@/components/RevealCredentialsModal/RevealCredentialsModal'
import ConfirmArchiveOwnerModal from '@/components/ConfirmArchiveOwnerModal/ConfirmArchiveOwnerModal'
import CreateOwnerModal from '@/components/CreateOwnerModal/CreateOwnerModal'
import type { TenantOwner } from '@/types/owner'
import type { Tenant, TenantStore } from '@/types/tenant'
import type { ApiResponseV2Paginated, ApiMeta } from '@/types/api'
import type { DataTableColumn } from '@/types/data-table'

const PAGE_SIZE = 15

interface OwnerListPanelProps {
  initialData: ApiResponseV2Paginated<TenantOwner[]> | null
  tenants: Tenant[]
  stores: TenantStore[]
  preselectedTenantId?: string
}

export default function OwnerListPanel({
  initialData,
  tenants,
  stores,
  preselectedTenantId,
}: OwnerListPanelProps) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token || 'mock_sa_token'
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [view, setView] = useState<'active' | 'archived'>('active')
  const [selectedTenantId, setSelectedTenantId] = useState<string>(preselectedTenantId || 'all')
  const [search, setSearch] = useState('')
  const [skip, setSkip] = useState(0)

  const [owners, setOwners] = useState<TenantOwner[]>(initialData?.data || [])
  const [meta, setMeta] = useState<ApiMeta | undefined>(initialData?.meta)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modals state
  const [isCreating, setIsCreating] = useState(false)
  const [revealedCreds, setRevealedCreds] = useState<{ name: string; userId: string; password: string } | null>(null)
  const [pendingArchive, setPendingArchive] = useState<TenantOwner | null>(null)
  const [isArchiving, setIsArchiving] = useState(false)
  const [revealingId, setRevealingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const tenantFilter = selectedTenantId === 'all' ? undefined : selectedTenantId
    const queryFn = view === 'active' ? fetchOwners : fetchArchivedOwners

    queryFn({ token, tenantId: tenantFilter, search, skip, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return
        setOwners(res.data || [])
        setMeta(res.meta)
      })
      .catch((err) => {
        if (cancelled) return
        setError(extractApiErrorMessage(err, 'Failed to load owners.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [view, selectedTenantId, search, skip, token])

  async function handleReveal(owner: TenantOwner) {
    setRevealingId(owner.user_id)
    try {
      const creds = await fetchOwnerCredentials({ token, userId: owner.user_id })
      setRevealedCreds({
        name: `${owner.first_name || ''} ${owner.last_name || ''}`.trim() || owner.email,
        userId: creds.user_id,
        password: creds.temp_password,
      })
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to reveal credentials.'))
    } finally {
      setRevealingId(null)
    }
  }

  async function handleConfirmArchive() {
    if (!pendingArchive) return
    setIsArchiving(true)
    try {
      await archiveOwner({ token, userId: pendingArchive.user_id })
      setOwners((prev) => prev.filter((o) => o.user_id !== pendingArchive.user_id))
      setMeta((prev) => (prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev))
      showToast(`Owner ${pendingArchive.first_name} ${pendingArchive.last_name} was archived.`)
      setPendingArchive(null)
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to archive owner.'))
    } finally {
      setIsArchiving(false)
    }
  }

  async function handleUnarchive(owner: TenantOwner) {
    startTransition(async () => {
      try {
        await unarchiveOwner({ token, userId: owner.user_id })
        setOwners((prev) => prev.filter((o) => o.user_id !== owner.user_id))
        setMeta((prev) => (prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev))
        showToast(`Owner ${owner.first_name} ${owner.last_name} was restored.`)
      } catch (err) {
        showToast(extractApiErrorMessage(err, 'Failed to restore owner.'))
      }
    })
  }

  function handleCreated(newOwner: TenantOwner) {
    setIsCreating(false)
    setOwners((prev) => [newOwner, ...prev])
    setMeta((prev) => (prev ? { ...prev, total: prev.total + 1 } : prev))
    showToast(`Owner ${newOwner.first_name} ${newOwner.last_name} added successfully!`)
  }

  const columns: DataTableColumn<TenantOwner>[] = [
    {
      key: 'owner',
      header: 'Owner',
      render: (o) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent text-white font-bold flex items-center justify-center text-[11px] shrink-0">
            {o.first_name?.[0] || 'O'}
            {o.last_name?.[0] || 'W'}
          </div>
          <div>
            <div className="font-semibold text-primary">
              {o.first_name} {o.last_name}
            </div>
            <div className="text-[11px] font-mono text-muted">{o.user_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'tenant',
      header: 'Company / Tenant',
      render: (o) => (
        <div>
          <div className="font-medium text-primary">{o.tenant_name || o.tenantName}</div>
          <div className="text-[11px] text-muted">Tenant ID: {o.tenant_id || o.tenantId}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (o) => (
        <div>
          <div className="text-secondary">{o.email}</div>
          {o.phone && <div className="text-[11px] text-muted">{o.phone}</div>}
        </div>
      ),
    },
    {
      key: 'stores',
      header: 'Store Scope',
      render: (o) => {
        const storeCount = (o.store_ids || o.storeIds || []).length
        return (
          <span className="text-[11.5px] bg-surface-alt border border-border px-2 py-0.5 rounded text-secondary font-medium">
            {storeCount} Stores
          </span>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold capitalize ${
            o.status === 'active'
              ? 'bg-accent-light text-accent'
              : o.status === 'invited'
              ? 'bg-warning/15 text-warning font-mono'
              : 'bg-danger/15 text-danger'
          }`}
        >
          {o.status}
        </span>
      ),
    },
    {
      key: 'credentials',
      header: 'Credentials',
      align: 'right',
      render: (o) => {
        if (view === 'archived') return <span className="text-muted text-[11px]">—</span>
        const canReveal = o.must_change_password === true
        return canReveal ? (
          <button
            type="button"
            onClick={() => handleReveal(o)}
            disabled={revealingId === o.user_id}
            className="text-[11.5px] font-semibold text-accent hover:text-accent-mid cursor-pointer"
          >
            {revealingId === o.user_id ? 'Revealing…' : 'Reveal password'}
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
      render: (o) => (
        <div>
          {view === 'active' ? (
            <button
              type="button"
              onClick={() => setPendingArchive(o)}
              className="text-[11.5px] font-semibold text-danger hover:opacity-80 cursor-pointer"
            >
              Archive
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleUnarchive(o)}
              disabled={isPending}
              className="text-[11.5px] font-semibold text-accent hover:text-accent-mid cursor-pointer"
            >
              Restore
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
      {/* Action Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setView('active')
                setSkip(0)
              }}
              className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold transition-colors cursor-pointer ${
                view === 'active'
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border text-secondary hover:text-primary'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => {
                setView('archived')
                setSkip(0)
              }}
              className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold transition-colors cursor-pointer ${
                view === 'archived'
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border text-secondary hover:text-primary'
              }`}
            >
              Archived
            </button>
          </div>

          {/* Tenant dropdown filter */}
          <Select
            value={selectedTenantId}
            options={[
              { label: 'All Tenants / Companies', value: 'all' },
              ...tenants.map((t) => ({ label: t.name, value: t.id })),
            ]}
            onChange={(val) => {
              setSelectedTenantId(String(val))
              setSkip(0)
            }}
            ariaLabel="Filter by tenant"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="rounded-[8px] bg-accent px-4 py-[9px] text-[12.5px] font-semibold text-white hover:bg-accent-mid transition-colors cursor-pointer"
        >
          + Provision New Owner
        </button>
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setSkip(0)
        }}
        placeholder="Search owners by name, user ID, email, or tenant…"
        className="w-full max-w-[360px] rounded-lg border border-border bg-surface px-3 py-[9px] text-[12.5px] outline-none focus:border-accent"
      />

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center animate-pulse text-muted text-[13px]">
          Loading owners...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-danger text-[13px]">
          {error}
        </div>
      ) : owners.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center text-muted text-[13px]">
          {view === 'archived' ? 'No archived owners.' : 'No owners found matching your filter.'}
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={owners}
          getRowKey={(o) => o.user_id}
          pagination={{
            page,
            totalPages,
            totalCount: meta?.total ?? owners.length,
            onPrev: () => setSkip(Math.max(0, skip - PAGE_SIZE)),
            onNext: () => setSkip(skip + PAGE_SIZE),
          }}
        />
      )}

      {/* Modals */}
      {isCreating && (
        <CreateOwnerModal
          token={token}
          tenants={tenants}
          stores={stores}
          preselectedTenantId={selectedTenantId === 'all' ? undefined : selectedTenantId}
          onClose={() => setIsCreating(false)}
          onCreated={handleCreated}
        />
      )}

      {revealedCreds && (
        <RevealCredentialsModal
          employeeName={revealedCreds.name}
          userId={revealedCreds.userId}
          password={revealedCreds.password}
          onClose={() => setRevealedCreds(null)}
        />
      )}

      {pendingArchive && (
        <ConfirmArchiveOwnerModal
          ownerName={`${pendingArchive.first_name} ${pendingArchive.last_name}`}
          isArchiving={isArchiving}
          onConfirm={handleConfirmArchive}
          onCancel={() => setPendingArchive(null)}
        />
      )}
    </div>
  )
}

