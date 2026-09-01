'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchTenants, updateTenantStatus } from '@/queries/tenants'
import { useToast } from '@/context/ToastContext'
import { extractApiErrorMessage } from '@/utils/common'
import DataTable from '@/components/shared/DataTable/DataTable'
import type { Tenant, TenantStatus } from '@/types/tenant'
import type { ApiResponseV2Paginated, ApiMeta } from '@/types/api'
import type { DataTableColumn } from '@/types/data-table'

interface TenantListPanelProps {
  initialData: ApiResponseV2Paginated<Tenant[]> | null
}

const PAGE_SIZE = 15

export default function TenantListPanel({ initialData }: TenantListPanelProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [skip, setSkip] = useState(0)
  const [tenants, setTenants] = useState<Tenant[]>(initialData?.data || [])
  const [meta, setMeta] = useState<ApiMeta | undefined>(initialData?.meta)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchTenants({ search, status: statusFilter, skip, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return
        setTenants(res.data || [])
        setMeta(res.meta)
      })
      .catch((err) => {
        if (cancelled) return
        setError(extractApiErrorMessage(err, 'Failed to load tenants.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [search, statusFilter, skip])

  async function handleToggleStatus(tenant: Tenant) {
    const nextStatus: TenantStatus = tenant.status === 'suspended' ? 'active' : 'suspended'
    startTransition(async () => {
      try {
        await updateTenantStatus({ tenantId: tenant.id, status: nextStatus })
        setTenants((prev) =>
          prev.map((t) => (t.id === tenant.id ? { ...t, status: nextStatus } : t))
        )
        showToast(`Tenant "${tenant.name}" marked as ${nextStatus.toUpperCase()}.`)
      } catch (err) {
        showToast(extractApiErrorMessage(err, 'Failed to update tenant status.'))
      }
    })
  }

  const columns: DataTableColumn<Tenant>[] = [
    {
      key: 'name',
      header: 'Company / Tenant',
      render: (t) => (
        <div>
          <div className="font-semibold text-primary">{t.name}</div>
          <div className="text-[11px] font-mono text-muted">ID: {t.code}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Primary Contact',
      render: (t) => (
        <div>
          <div className="text-primary font-medium">{t.primaryContact.name}</div>
          <div className="text-[11px] text-muted">{t.primaryContact.email}</div>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan & Stores',
      render: (t) => (
        <div>
          <span className="text-[11.5px] font-semibold uppercase text-secondary">{t.plan}</span>
          <div className="text-[11px] text-muted">
            {t.stats.storeCount} / {t.storeAllowance} stores
          </div>
        </div>
      ),
    },
    {
      key: 'users',
      header: 'Headcount',
      render: (t) => (
        <div className="text-[11.5px] text-secondary">
          <span>{t.stats.ownerCount} Owners</span> · <span>{t.stats.managerCount} Managers</span> ·{' '}
          <span>{t.stats.employeeCount} Staff</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => (
        <span
          className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider ${
            t.status === 'active'
              ? 'bg-accent-light text-accent'
              : t.status === 'onboarding'
              ? 'bg-warning/15 text-warning'
              : 'bg-danger/15 text-danger'
          }`}
        >
          {t.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (t) => (
        <div className="flex items-center justify-end gap-2">
          {t.status === 'onboarding' ? (
            <Link
              href="/super-admin/onboarding"
              className="text-[11.5px] bg-accent text-white font-semibold px-2.5 py-1 rounded-md hover:bg-accent-mid transition-colors cursor-pointer"
            >
              Resume Wizard →
            </Link>
          ) : (
            <Link
              href={`/super-admin/owners?tenant=${t.id}`}
              className="text-[11.5px] text-accent hover:text-accent-mid font-medium cursor-pointer"
            >
              Manage Owners
            </Link>
          )}

          <button
            type="button"
            onClick={() => handleToggleStatus(t)}
            disabled={isPending}
            className={`text-[11px] font-medium px-2 py-0.5 rounded cursor-pointer ${
              t.status === 'suspended'
                ? 'text-accent hover:bg-accent/10'
                : 'text-danger hover:bg-danger/10'
            }`}
          >
            {t.status === 'suspended' ? 'Activate' : 'Suspend'}
          </button>
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
          {['all', 'active', 'onboarding', 'suspended'].map((s) => (
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

        <Link
          href="/super-admin/onboarding"
          className="rounded-[8px] bg-accent px-4 py-[9px] text-[12.5px] font-semibold text-white hover:bg-accent-mid transition-colors cursor-pointer"
        >
          + Onboard New Tenant
        </Link>
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setSkip(0)
        }}
        placeholder="Search tenants by company name, ID, or contact email…"
        className="w-full max-w-[360px] rounded-lg border border-border bg-surface px-3 py-[9px] text-[12.5px] outline-none focus:border-accent"
      />

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center animate-pulse text-muted text-[13px]">
          Loading tenants...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-danger text-[13px]">
          {error}
        </div>
      ) : tenants.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center text-muted text-[13px]">
          No tenants found matching your filter.
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={tenants}
          getRowKey={(t) => t.id}
          pagination={{
            page,
            totalPages,
            totalCount: meta?.total ?? tenants.length,
            onPrev: () => setSkip(Math.max(0, skip - PAGE_SIZE)),
            onNext: () => setSkip(skip + PAGE_SIZE),
          }}
        />
      )}
    </div>
  )
}

