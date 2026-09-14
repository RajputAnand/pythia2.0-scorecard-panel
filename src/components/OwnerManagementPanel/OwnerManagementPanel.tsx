'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  fetchOrganizationOwners,
  deactivateSubOwner,
  fetchSubOwnerCredentials,
  toggleSubOwnerSubscriptionPermission,
} from '@/queries/organization-owners'
import { useToast } from '@/context/ToastContext'
import { extractApiErrorMessage } from '@/utils/common'
import CreateSubOwnerModal from '@/components/CreateSubOwnerModal/CreateSubOwnerModal'
import RevealCredentialsModal from '@/components/RevealCredentialsModal/RevealCredentialsModal'
import type { OrganizationOwner } from '@/types/organization-owner'

interface OwnerManagementPanelProps {
  initialData?: OrganizationOwner[]
}

export default function OwnerManagementPanel({ initialData }: OwnerManagementPanelProps) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token || session?.user?.token || ''
  const currentUserId = session?.user?.id
  const { showToast } = useToast()

  const [owners, setOwners] = useState<OrganizationOwner[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Modals state
  const [isCreating, setIsCreating] = useState(false)
  const [revealedCreds, setRevealedCreds] = useState<{ name: string; userId: string; password: string } | null>(null)
  const [revealingId, setRevealingId] = useState<string | null>(null)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadOwners = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetchOrganizationOwners({
        token,
        search: search.trim() || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      })
      if (res.data) {
        setOwners(res.data)
      }
    } catch (err: unknown) {
      showToast(extractApiErrorMessage(err, 'Failed to load organization owners.'))
    } finally {
      setLoading(false)
    }
  }, [token, search, statusFilter, showToast])

  useEffect(() => {
    loadOwners()
  }, [loadOwners])

  const filteredOwners = useMemo(() => {
    return owners.filter((o) => {
      if (statusFilter === 'active' && !o.is_active) return false
      if (statusFilter === 'inactive' && o.is_active) return false
      if (!search) return true
      const q = search.toLowerCase()
      const fullName = `${o.first_name} ${o.last_name}`.toLowerCase()
      return (
        fullName.includes(q) ||
        (o.email && o.email.toLowerCase().includes(q)) ||
        o.user_id.toLowerCase().includes(q)
      )
    })
  }, [owners, statusFilter, search])

  async function handleRevealCredentials(owner: OrganizationOwner) {
    if (!token) return
    setRevealingId(owner.user_id)
    try {
      const res = await fetchSubOwnerCredentials({ token, userId: owner.user_id })
      setRevealedCreds({
        name: `${owner.first_name} ${owner.last_name}`,
        userId: res.username || res.user_id,
        password: res.temp_password,
      })
    } catch (err: unknown) {
      showToast(extractApiErrorMessage(err, 'Could not retrieve credentials for this owner.'))
    } finally {
      setRevealingId(null)
    }
  }

  async function handleToggleSubscription(owner: OrganizationOwner) {
    if (!token || owner.is_root_owner) return
    const newPermission = !owner.can_manage_subscription
    setTogglingId(owner.user_id)
    try {
      await toggleSubOwnerSubscriptionPermission({
        token,
        userId: owner.user_id,
        canManageSubscription: newPermission,
      })
      setOwners((prev) =>
        prev.map((o) => (o.user_id === owner.user_id ? { ...o, can_manage_subscription: newPermission } : o))
      )
      showToast(
        `Subscription access for ${owner.first_name} ${newPermission ? 'enabled' : 'disabled'}.`
      )
    } catch (err: unknown) {
      showToast(extractApiErrorMessage(err, 'Failed to update subscription permission.'))
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDeactivate(owner: OrganizationOwner) {
    if (!token || owner.is_root_owner) return
    const confirm = window.confirm(
      `Are you sure you want to deactivate ${owner.first_name} ${owner.last_name}? They will lose access to the system immediately.`
    )
    if (!confirm) return

    setDeactivatingId(owner.user_id)
    try {
      await deactivateSubOwner({ token, userId: owner.user_id })
      setOwners((prev) =>
        prev.map((o) => (o.user_id === owner.user_id ? { ...o, is_active: false } : o))
      )
      showToast(`${owner.first_name} ${owner.last_name} deactivated successfully.`)
    } catch (err: unknown) {
      showToast(extractApiErrorMessage(err, 'Failed to deactivate owner.'))
    } finally {
      setDeactivatingId(null)
    }
  }

  function handleOwnerCreated(newOwner: OrganizationOwner) {
    setOwners((prev) => [newOwner, ...prev])
    showToast(`Co-Owner ${newOwner.first_name} ${newOwner.last_name} created successfully.`)
  }

  return (
    <div className="space-y-4">
      {/* Top Filter & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface border border-border rounded-xl p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search */}
          <div className="relative min-w-[220px] max-w-[300px] flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-[12.5px] bg-surface-alt border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-surface-alt border border-border rounded-lg p-0.5 text-[12px]">
            {(['all', 'active', 'inactive'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-surface text-primary shadow-xs font-semibold'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Create Co-Owner Button */}
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-white text-[12.5px] font-medium hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shadow-xs ml-auto sm:ml-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Co-Owner
        </button>
      </div>

      {/* Owners Table */}
      <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
        {loading && owners.length === 0 ? (
          <div className="p-8 text-center text-muted text-[13px] animate-pulse">
            Loading co-owners...
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="font-semibold text-[14px] text-primary">No owners found</h3>
            <p className="text-[12px] text-muted max-w-sm mx-auto mt-1">
              {search
                ? `No owners matched "${search}". Try adjusting your filter.`
                : 'Bring on additional owners to help manage your store organization.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-border bg-surface-alt/50 text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Subscription Access</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredOwners.map((owner) => {
                  const initials = `${owner.first_name[0] || ''}${owner.last_name[0] || ''}`.toUpperCase() || 'O'
                  const isSelf = owner.user_id === currentUserId
                  return (
                    <tr key={owner.user_id} className="hover:bg-surface-alt/40 transition-colors">
                      {/* Owner Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-accent/15 text-accent font-bold flex items-center justify-center text-[11.5px] shrink-0 border border-accent/20">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-primary truncate">
                                {owner.first_name} {owner.last_name}
                              </span>
                              {owner.is_root_owner && (
                                <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
                                  Primary Owner
                                </span>
                              )}
                              {isSelf && (
                                <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded bg-surface-alt text-muted border border-border whitespace-nowrap">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[10.5px] text-muted font-mono">{owner.user_id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Column */}
                      <td className="py-3 px-4">
                        <div className="text-primary truncate max-w-[200px]">{owner.email || '—'}</div>
                        {owner.phone && <div className="text-[11px] text-muted">{owner.phone}</div>}
                      </td>

                      {/* Subscription Access Column */}
                      <td className="py-3 px-4">
                        {owner.is_root_owner ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent/10 text-accent">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                            Full Access (Root)
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                owner.can_manage_subscription
                                  ? 'bg-success/10 text-success border border-success/20'
                                  : 'bg-surface-alt text-muted border border-border'
                              }`}
                            >
                              {owner.can_manage_subscription ? 'Allowed' : 'No Access'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleSubscription(owner)}
                              disabled={togglingId === owner.user_id}
                              className="text-[11px] text-accent hover:underline cursor-pointer disabled:opacity-50"
                            >
                              {togglingId === owner.user_id
                                ? 'Updating...'
                                : owner.can_manage_subscription
                                ? 'Revoke'
                                : 'Grant'}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold uppercase tracking-wider ${
                            owner.is_active
                              ? 'bg-success/15 text-success'
                              : 'bg-muted/15 text-muted'
                          }`}
                        >
                          {owner.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleRevealCredentials(owner)}
                            disabled={revealingId === owner.user_id}
                            className="p-1 text-secondary hover:text-primary rounded hover:bg-surface-alt transition-colors cursor-pointer disabled:opacity-50"
                            title="Reveal login credentials"
                          >
                            {revealingId === owner.user_id ? (
                              <svg className="w-4 h-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            )}
                          </button>

                          {!owner.is_root_owner && owner.is_active && (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(owner)}
                              disabled={deactivatingId === owner.user_id}
                              className="px-2 py-1 text-[11px] font-medium text-danger hover:bg-danger/10 rounded transition-colors cursor-pointer disabled:opacity-50"
                              title="Deactivate co-owner"
                            >
                              {deactivatingId === owner.user_id ? 'Deactivating...' : 'Deactivate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreating && (
        <CreateSubOwnerModal
          token={token}
          onClose={() => setIsCreating(false)}
          onCreated={handleOwnerCreated}
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
    </div>
  )
}
