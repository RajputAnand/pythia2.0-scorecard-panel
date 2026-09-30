'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/store/userStore'
import { useToast } from '@/context/ToastContext'
import {
  fetchEmployees,
  fetchArchivedEmployees,
  fetchEmployeeCredentials,
  archiveEmployee,
  unarchiveEmployee,
} from '@/queries/employees'
import {
  fetchManagers,
  fetchArchivedManagers,
  fetchManagerCredentials,
  archiveManager,
  unarchiveManager,
} from '@/queries/managers'
import {
  fetchOrganizationOwners,
  deactivateSubOwner,
  fetchSubOwnerCredentials,
  toggleSubOwnerSubscriptionPermission,
} from '@/queries/organization-owners'
import { fetchStoresForTenant } from '@/queries/stores'
import { getEmployeeName, getEmployeeInitials, extractApiErrorMessage } from '@/utils/common'
import DataTable from '@/components/shared/DataTable/DataTable'
import RevealCredentialsModal from '@/components/RevealCredentialsModal/RevealCredentialsModal'
import ConfirmArchiveEmployeeModal from '@/components/ConfirmArchiveEmployeeModal/ConfirmArchiveEmployeeModal'
import ConfirmArchiveManagerModal from '@/components/ConfirmArchiveManagerModal/ConfirmArchiveManagerModal'
import CreateUserModal, { type UserCreationRole } from '@/components/CreateUserModal/CreateUserModal'
import type { ApiEmployee } from '@/types/employee'
import type { ApiManager } from '@/types/manager'
import type { OrganizationOwner } from '@/types/organization-owner'
import type { DataTableColumn } from '@/types/data-table'
import type { TenantStore } from '@/types/tenant'

export type RoleFilter = 'ALL' | 'employee' | 'manager' | 'owner'
export type StatusView = 'active' | 'archived'

export interface UnifiedUser {
  id: string
  userId: string
  name: string
  initials: string
  email: string
  phone: string | null
  role: 'employee' | 'manager' | 'owner'
  roleDisplay: string
  storeScope: string
  isActive: boolean
  isRootOwner?: boolean
  canManageSubscription?: boolean
  mustChangePassword?: boolean
  rawRecord: ApiEmployee | ApiManager | OrganizationOwner
}

interface UserListPanelProps {
  initialRoleFilter?: RoleFilter
  initialEmployees?: ApiEmployee[]
  initialManagers?: ApiManager[]
  initialOwners?: OrganizationOwner[]
  initialStores?: TenantStore[]
  tenantId?: string
}

const PAGE_SIZE = 15

export default function UserListPanel({
  initialRoleFilter = 'ALL',
  initialEmployees,
  initialManagers,
  initialOwners,
  initialStores = [],
  tenantId: propTenantId,
}: UserListPanelProps) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token || session?.user?.token || ''
  const currentUserId = session?.user?.id
  const sessionTenantId = session?.user?.tenantId
  const currentOrganization = useUserStore((s) => s.currentOrganization)
  const effectiveTenantId =
    propTenantId ||
    (session?.user?.role === 'superadmin'
      ? currentOrganization?.tenant_id
      : sessionTenantId)
  const { showToast } = useToast()

  const currentStore = useUserStore((s) => s.currentStore)
  const currentStoreId = currentStore?.storeNo || currentStore?._id

  // Filter states
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(initialRoleFilter)
  const [statusView, setStatusView] = useState<StatusView>('active')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(0)

  // Modals & Actions
  const [isCreating, setIsCreating] = useState(false)
  const [revealedCreds, setRevealedCreds] = useState<{ name: string; userId: string; password: string } | null>(null)
  const [revealingId, setRevealingId] = useState<string | null>(null)
  const [unrevealableIds, setUnrevealableIds] = useState<Set<string>>(() => new Set())

  // Archive action states
  const [pendingArchiveEmployee, setPendingArchiveEmployee] = useState<ApiEmployee | null>(null)
  const [pendingArchiveManager, setPendingArchiveManager] = useState<ApiManager | null>(null)
  const [isArchiving, setIsArchiving] = useState(false)
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null)

  // Raw data lists
  const [employees, setEmployees] = useState<ApiEmployee[]>(initialEmployees || [])
  const [managers, setManagers] = useState<ApiManager[]>(initialManagers || [])
  const [owners, setOwners] = useState<OrganizationOwner[]>(initialOwners || [])
  const [stores, setStores] = useState<TenantStore[]>(initialStores)

  // Archived raw data
  const [archivedEmployees, setArchivedEmployees] = useState<ApiEmployee[]>([])
  const [archivedManagers, setArchivedManagers] = useState<ApiManager[]>([])

  // Loading & error
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  // Check if current user can manage subscription
  const canCurrentUserManageSub = useMemo(() => {
    if (session?.user?.role === 'superadmin') return true
    if (session?.user?.can_manage_subscription !== undefined || session?.user?.is_root_owner !== undefined) {
      return Boolean(session?.user?.can_manage_subscription || session?.user?.is_root_owner)
    }
    const currentOwner = owners.find((o) => o.user_id === currentUserId)
    return Boolean(currentOwner?.is_root_owner || currentOwner?.can_manage_subscription)
  }, [session, owners, currentUserId])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 250)
    return () => clearTimeout(t)
  }, [search])

  // Reset pagination when filter or search changes
  useEffect(() => {
    setPage(0)
  }, [roleFilter, statusView, debouncedSearch])

  // Fetch stores
  useEffect(() => {
    if (initialStores.length > 0 || !token) return
    let cancelled = false
    fetchStoresForTenant({ token, tenantId: effectiveTenantId, limit: 100 })
      .then((res) => {
        if (!cancelled && res.data) setStores(res.data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [token, effectiveTenantId, initialStores.length])

  // Main fetch for active and archived records
  const loadData = useCallback(() => {
    if (!token) return
    let cancelled = false
    setIsLoading(true)
    setIsError(false)
    setErrorMessage(null)

    const empPromise = fetchEmployees({ token, skip: 0, limit: 200, storeId: currentStoreId || undefined, tenantId: effectiveTenantId })
    const mgrPromise = fetchManagers({ token, tenantId: effectiveTenantId, skip: 0, limit: 100, storeId: currentStoreId || undefined })
    const ownPromise = fetchOrganizationOwners({ token })
    const archEmpPromise = fetchArchivedEmployees({ token, skip: 0, limit: 200, storeId: currentStoreId || undefined, tenantId: effectiveTenantId })
    const archMgrPromise = fetchArchivedManagers({ token, tenantId: effectiveTenantId, skip: 0, limit: 100, storeId: currentStoreId || undefined })

    Promise.allSettled([empPromise, mgrPromise, ownPromise, archEmpPromise, archMgrPromise])
      .then(([empRes, mgrRes, ownRes, archEmpRes, archMgrRes]) => {
        if (cancelled) return

        if (empRes.status === 'fulfilled' && empRes.value.data) {
          setEmployees(empRes.value.data)
        }
        if (mgrRes.status === 'fulfilled' && mgrRes.value.data) {
          setManagers(mgrRes.value.data)
        }
        if (ownRes.status === 'fulfilled' && ownRes.value.data) {
          setOwners(ownRes.value.data)
        }
        if (archEmpRes.status === 'fulfilled' && archEmpRes.value.data) {
          setArchivedEmployees(archEmpRes.value.data)
        }
        if (archMgrRes.status === 'fulfilled' && archMgrRes.value.data) {
          setArchivedManagers(archMgrRes.value.data)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setIsError(true)
          setErrorMessage(extractApiErrorMessage(err, 'Failed to load users.'))
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, effectiveTenantId, currentStoreId])

  useEffect(() => {
    loadData()
  }, [loadData, retryToken])

  // Store lookup helper
  const storeMap = useMemo(() => {
    const map = new Map<string, string>()
    stores.forEach((s) => {
      const id = s.storeNo || s.id || s._id
      const name = s.name || s.storeNo || id
      if (id) map.set(String(id), name)
    })
    return map
  }, [stores])

  const getStoreDisplay = useCallback(
    (storeIds?: string[]) => {
      if (!storeIds || storeIds.length === 0) return 'Unassigned'
      const names = storeIds.map((id) => storeMap.get(String(id)) || id)
      return names.join(', ')
    },
    [storeMap]
  )

  // Map raw records into unified models
  const unifiedActiveUsers = useMemo<UnifiedUser[]>(() => {
    const list: UnifiedUser[] = []

    // 1. Employees
    employees.forEach((emp) => {
      list.push({
        id: emp._id || emp.user_id,
        userId: emp.user_id,
        name: getEmployeeName(emp),
        initials: getEmployeeInitials(emp),
        email: emp.email || '—',
        phone: emp.phone || null,
        role: 'employee',
        roleDisplay: 'Employee',
        storeScope: getStoreDisplay(emp.store_ids),
        isActive: emp.is_active !== false,
        mustChangePassword: emp.must_change_password,
        rawRecord: emp,
      })
    })

    // 2. Managers
    managers.forEach((mgr) => {
      list.push({
        id: mgr._id || mgr.user_id,
        userId: mgr.user_id,
        name: getEmployeeName(mgr),
        initials: getEmployeeInitials(mgr),
        email: mgr.email || '—',
        phone: mgr.phone || null,
        role: 'manager',
        roleDisplay: 'Manager',
        storeScope: getStoreDisplay(mgr.store_ids),
        isActive: mgr.is_active !== false,
        mustChangePassword: mgr.must_change_password,
        rawRecord: mgr,
      })
    })

    // 3. Owners (active)
    owners
      .filter((o) => o.is_active)
      .forEach((own) => {
        list.push({
          id: own.user_id,
          userId: own.user_id,
          name: `${own.first_name} ${own.last_name}`.trim(),
          initials: `${own.first_name[0] || ''}${own.last_name[0] || ''}`.toUpperCase() || 'OW',
          email: own.email || '—',
          phone: own.phone || null,
          role: 'owner',
          roleDisplay: own.is_root_owner ? 'Primary Owner' : 'Co-Owner',
          storeScope: 'All Stores (Organization)',
          isActive: true,
          isRootOwner: own.is_root_owner,
          canManageSubscription: own.can_manage_subscription,
          rawRecord: own,
        })
      })

    return list
  }, [employees, managers, owners, getStoreDisplay])

  const unifiedArchivedUsers = useMemo<UnifiedUser[]>(() => {
    const list: UnifiedUser[] = []

    // 1. Archived Employees
    archivedEmployees.forEach((emp) => {
      list.push({
        id: emp._id || emp.user_id,
        userId: emp.user_id,
        name: getEmployeeName(emp),
        initials: getEmployeeInitials(emp),
        email: emp.email || '—',
        phone: emp.phone || null,
        role: 'employee',
        roleDisplay: 'Employee',
        storeScope: getStoreDisplay(emp.store_ids),
        isActive: false,
        rawRecord: emp,
      })
    })

    // 2. Archived Managers
    archivedManagers.forEach((mgr) => {
      list.push({
        id: mgr._id || mgr.user_id,
        userId: mgr.user_id,
        name: getEmployeeName(mgr),
        initials: getEmployeeInitials(mgr),
        email: mgr.email || '—',
        phone: mgr.phone || null,
        role: 'manager',
        roleDisplay: 'Manager',
        storeScope: getStoreDisplay(mgr.store_ids),
        isActive: false,
        rawRecord: mgr,
      })
    })

    // 3. Inactive Owners
    owners
      .filter((o) => !o.is_active)
      .forEach((own) => {
        list.push({
          id: own.user_id,
          userId: own.user_id,
          name: `${own.first_name} ${own.last_name}`.trim(),
          initials: `${own.first_name[0] || ''}${own.last_name[0] || ''}`.toUpperCase() || 'OW',
          email: own.email || '—',
          phone: own.phone || null,
          role: 'owner',
          roleDisplay: 'Co-Owner',
          storeScope: 'All Stores (Organization)',
          isActive: false,
          isRootOwner: own.is_root_owner,
          canManageSubscription: own.can_manage_subscription,
          rawRecord: own,
        })
      })

    return list
  }, [archivedEmployees, archivedManagers, owners, getStoreDisplay])

  // Count calculations for chips
  const activeCounts = useMemo(() => {
    return {
      all: unifiedActiveUsers.length,
      employee: unifiedActiveUsers.filter((u) => u.role === 'employee').length,
      manager: unifiedActiveUsers.filter((u) => u.role === 'manager').length,
      owner: unifiedActiveUsers.filter((u) => u.role === 'owner').length,
    }
  }, [unifiedActiveUsers])

  const archivedCounts = useMemo(() => {
    return {
      all: unifiedArchivedUsers.length,
      employee: unifiedArchivedUsers.filter((u) => u.role === 'employee').length,
      manager: unifiedArchivedUsers.filter((u) => u.role === 'manager').length,
      owner: unifiedArchivedUsers.filter((u) => u.role === 'owner').length,
    }
  }, [unifiedArchivedUsers])

  const currentCounts = statusView === 'active' ? activeCounts : archivedCounts

  // Filtered dataset
  const displayedUsers = useMemo(() => {
    const source = statusView === 'active' ? unifiedActiveUsers : unifiedArchivedUsers
    return source.filter((user) => {
      if (roleFilter !== 'ALL' && user.role !== roleFilter) return false
      if (debouncedSearch) {
        const q = debouncedSearch
        const matchName = user.name.toLowerCase().includes(q)
        const matchEmail = user.email.toLowerCase().includes(q)
        const matchPhone = user.phone ? user.phone.toLowerCase().includes(q) : false
        const matchId = user.userId.toLowerCase().includes(q)
        return matchName || matchEmail || matchPhone || matchId
      }
      return true
    })
  }, [statusView, unifiedActiveUsers, unifiedArchivedUsers, roleFilter, debouncedSearch])

  // Paginated dataset
  const totalPages = Math.max(1, Math.ceil(displayedUsers.length / PAGE_SIZE))
  const paginatedUsers = useMemo(() => {
    const start = page * PAGE_SIZE
    return displayedUsers.slice(start, start + PAGE_SIZE)
  }, [displayedUsers, page])

  // ---- Row Action Handlers ----

  async function handleReveal(user: UnifiedUser) {
    if (!token) return
    setRevealingId(user.userId)
    try {
      if (user.role === 'employee') {
        const res = await fetchEmployeeCredentials({ token, userId: user.userId })
        setRevealedCreds({ name: user.name, userId: res.user_id, password: res.temp_password })
      } else if (user.role === 'manager') {
        const res = await fetchManagerCredentials({ token, userId: user.userId })
        setRevealedCreds({ name: user.name, userId: res.user_id, password: res.temp_password })
      } else if (user.role === 'owner') {
        const res = await fetchSubOwnerCredentials({ token, userId: user.userId })
        setRevealedCreds({ name: user.name, userId: res.user_id, password: res.temp_password })
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setUnrevealableIds((prev) => new Set(prev).add(user.userId))
      }
      showToast(extractApiErrorMessage(err, 'Failed to reveal credentials.'))
    } finally {
      setRevealingId(null)
    }
  }

  async function handleConfirmArchiveEmployee() {
    if (!token || !pendingArchiveEmployee) return
    setIsArchiving(true)
    try {
      await archiveEmployee({ token, userId: pendingArchiveEmployee.user_id })
      setEmployees((prev) => prev.filter((e) => e.user_id !== pendingArchiveEmployee.user_id))
      setArchivedEmployees((prev) => [pendingArchiveEmployee, ...prev])
      showToast(`${getEmployeeName(pendingArchiveEmployee)} was archived`)
      setPendingArchiveEmployee(null)
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to archive employee.'))
    } finally {
      setIsArchiving(false)
    }
  }

  async function handleConfirmArchiveManager() {
    if (!token || !pendingArchiveManager) return
    setIsArchiving(true)
    try {
      await archiveManager({ token, userId: pendingArchiveManager.user_id })
      setManagers((prev) => prev.filter((m) => m.user_id !== pendingArchiveManager.user_id))
      setArchivedManagers((prev) => [pendingArchiveManager, ...prev])
      showToast(`${getEmployeeName(pendingArchiveManager)} was archived`)
      setPendingArchiveManager(null)
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to archive manager.'))
    } finally {
      setIsArchiving(false)
    }
  }

  async function handleUnarchiveUser(user: UnifiedUser) {
    if (!token) return
    setActionInProgressId(user.userId)
    try {
      if (user.role === 'employee') {
        await unarchiveEmployee({ token, userId: user.userId })
        setArchivedEmployees((prev) => prev.filter((e) => e.user_id !== user.userId))
        setEmployees((prev) => [user.rawRecord as ApiEmployee, ...prev])
        showToast(`Employee ${user.name} unarchived successfully`)
      } else if (user.role === 'manager') {
        await unarchiveManager({ token, userId: user.userId })
        setArchivedManagers((prev) => prev.filter((m) => m.user_id !== user.userId))
        setManagers((prev) => [user.rawRecord as ApiManager, ...prev])
        showToast(`Manager ${user.name} unarchived successfully`)
      }
    } catch (err) {
      showToast(extractApiErrorMessage(err, `Failed to unarchive ${user.role}.`))
    } finally {
      setActionInProgressId(null)
    }
  }

  async function handleDeactivateOwner(user: UnifiedUser) {
    if (!token) return
    setActionInProgressId(user.userId)
    try {
      await deactivateSubOwner({ token, userId: user.userId })
      setOwners((prev) =>
        prev.map((o) => (o.user_id === user.userId ? { ...o, is_active: false } : o))
      )
      showToast(`Co-Owner ${user.name} deactivated`)
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to deactivate owner.'))
    } finally {
      setActionInProgressId(null)
    }
  }

  async function handleToggleSubPermission(user: UnifiedUser, currentVal: boolean) {
    if (!token) return
    setActionInProgressId(user.userId)
    try {
      const res = await toggleSubOwnerSubscriptionPermission({
        token,
        userId: user.userId,
        canManageSubscription: !currentVal,
      })
      setOwners((prev) =>
        prev.map((o) =>
          o.user_id === user.userId ? { ...o, can_manage_subscription: res.can_manage_subscription } : o
        )
      )
      showToast(`Subscription permission updated for ${user.name}`)
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to update subscription permission.'))
    } finally {
      setActionInProgressId(null)
    }
  }

  // Preselected role for modal when clicking Add User
  const modalInitialRole: UserCreationRole = useMemo(() => {
    if (roleFilter === 'manager') return 'manager'
    if (roleFilter === 'owner') return 'owner'
    return 'employee'
  }, [roleFilter])

  // Table Columns
  const columns: DataTableColumn<UnifiedUser>[] = [
    {
      key: 'user',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center shrink-0 rounded-full bg-accent text-white font-bold w-8 h-8 text-[11px]">
            {u.initials}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate text-[13px]">{u.name}</div>
            <div className="text-[10.5px] text-gray-800 truncate font-mono">{u.userId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => {
        let badgeClass = 'bg-surface-alt text-secondary border border-border'
        if (u.role === 'owner') {
          badgeClass = 'bg-purple-500/10 text-purple-600 border border-purple-500/20 font-semibold'
        } else if (u.role === 'manager') {
          badgeClass = 'bg-blue-500/10 text-blue-600 border border-blue-500/20 font-medium'
        } else {
          badgeClass = 'bg-accent/10 text-accent border border-accent/20 font-medium'
        }
        return (
          <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] ${badgeClass}`}>
            {u.roleDisplay}
          </span>
        )
      },
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (u) => (
        <div className="min-w-0">
          <div className="truncate text-[12.5px] text-primary">{u.email}</div>
          {u.phone && <div className="text-[11px] text-gray-800 truncate">{u.phone}</div>}
        </div>
      ),
    },
    {
      key: 'scope',
      header: 'Assigned Stores',
      render: (u) => (
        <div className="text-[12px] text-secondary truncate max-w-[200px]" title={u.storeScope}>
          {u.storeScope}
          {u.role === 'owner' && u.canManageSubscription && (
            <span className="block text-[10px] text-accent font-medium mt-0.5">
              💳 Payment & Billing Manager
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[10.5px] font-semibold capitalize ${
            u.isActive ? 'bg-accent-light text-accent' : 'bg-surface-alt text-gray-800 border border-border'
          }`}
        >
          {u.isActive ? 'Active' : 'Archived'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (u) => {
        const isActionLoading = actionInProgressId === u.userId
        const isRevealing = revealingId === u.userId
        const canReveal = u.isActive && !unrevealableIds.has(u.userId)

        return (
          <div className="flex items-center justify-end gap-2.5">
            {canReveal && (
              <button
                type="button"
                onClick={() => handleReveal(u)}
                disabled={isRevealing}
                className="text-[11.5px] font-semibold text-accent hover:text-accent-mid disabled:opacity-50 cursor-pointer"
              >
                {isRevealing ? 'Loading…' : 'Reveal Credentials'}
              </button>
            )}

            {/* Active Actions */}
            {statusView === 'active' ? (
              <>
                {u.role === 'employee' && (
                  <button
                    type="button"
                    onClick={() => setPendingArchiveEmployee(u.rawRecord as ApiEmployee)}
                    className="text-[11.5px] font-medium text-danger hover:underline cursor-pointer"
                  >
                    Archive
                  </button>
                )}

                {u.role === 'manager' && (
                  <button
                    type="button"
                    onClick={() => setPendingArchiveManager(u.rawRecord as ApiManager)}
                    className="text-[11.5px] font-medium text-danger hover:underline cursor-pointer"
                  >
                    Archive
                  </button>
                )}

                {u.role === 'owner' && !u.isRootOwner && u.userId !== currentUserId && (
                  <div className="flex items-center gap-2">
                    {canCurrentUserManageSub && (
                      <button
                        type="button"
                        onClick={() => handleToggleSubPermission(u, Boolean(u.canManageSubscription))}
                        disabled={isActionLoading}
                        className="text-[11px] text-secondary hover:text-primary cursor-pointer"
                        title="Toggle Stripe subscription management permission"
                      >
                        {u.canManageSubscription ? 'Revoke Billing' : 'Grant Billing'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeactivateOwner(u)}
                      disabled={isActionLoading}
                      className="text-[11.5px] font-medium text-danger hover:underline cursor-pointer"
                    >
                      Deactivate
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Archived Actions */
              (u.role === 'employee' || u.role === 'manager') && (
                <button
                  type="button"
                  onClick={() => handleUnarchiveUser(u)}
                  disabled={isActionLoading}
                  className="text-[11.5px] font-medium text-accent hover:underline cursor-pointer disabled:opacity-50"
                >
                  {isActionLoading ? 'Restoring…' : 'Restore'}
                </button>
              )
            )}
          </div>
        )
      },
    },
  ]

  // Filter Chip Definitions matching Swag Store patterns
  const FILTER_CHIPS: { label: string; value: RoleFilter; count: number }[] = [
    { label: 'All Users', value: 'ALL', count: currentCounts.all },
    { label: 'Employees', value: 'employee', count: currentCounts.employee },
    { label: 'Managers', value: 'manager', count: currentCounts.manager },
    { label: 'Co-Owners', value: 'owner', count: currentCounts.owner },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Top Bar: Filter Chips, Status Views & Add User Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface border border-border rounded-xl p-3 shadow-xs">
        {/* Swag-Store Style Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_CHIPS.map((chip) => {
            const isSelected = roleFilter === chip.value
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => setRoleFilter(chip.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-accent text-white font-semibold shadow-xs'
                    : 'bg-surface-alt text-secondary hover:text-primary hover:bg-surface-alt/80 border border-border font-medium'
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-border/60 text-gray-800'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Right side: Status toggle & Add User button */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Active / Archived Pill Toggle */}
          <div className="flex items-center bg-surface-alt p-0.5 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setStatusView('active')}
              className={`px-3 py-1 rounded-md text-[11.5px] font-medium transition-colors cursor-pointer ${
                statusView === 'active'
                  ? 'bg-surface text-primary font-semibold shadow-xs'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusView('archived')}
              className={`px-3 py-1 rounded-md text-[11.5px] font-medium transition-colors cursor-pointer ${
                statusView === 'archived'
                  ? 'bg-surface text-primary font-semibold shadow-xs'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Archived
            </button>
          </div>

          {/* Add User Button */}
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-white text-[12.5px] font-semibold hover:bg-accent-mid transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add User
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-800 text-[13px]">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search users by name, email, or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-8 pr-3 py-2 text-[12.5px] text-primary placeholder:text-gray-800 focus:outline-none focus:border-accent shadow-xs"
          />
        </div>

        <div className="text-[12px] text-gray-800 whitespace-nowrap">
          Showing {displayedUsers.length} {statusView === 'active' ? 'active' : 'archived'} user{displayedUsers.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Table / Content */}
      {isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16 text-center px-4">
          <span className="text-[32px]">⚠️</span>
          <p className="font-semibold text-[14px]">Failed to load users</p>
          <p className="text-[12px] text-gray-800 max-w-md">{errorMessage || 'Check your connection and try again.'}</p>
          <button
            type="button"
            className="mt-1 rounded-[8px] border-0 bg-accent px-4 py-2 text-[12.5px] font-semibold text-white hover:opacity-85 cursor-pointer"
            onClick={() => setRetryToken((n) => n + 1)}
          >
            Retry
          </button>
        </div>
      ) : isLoading && unifiedActiveUsers.length === 0 ? (
        <div className="rounded-[10px] border border-border bg-surface overflow-hidden animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[52px] border-b border-border last:border-b-0 bg-surface-alt/40" />
          ))}
        </div>
      ) : displayedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface py-16 text-center">
          <span className="text-[34px]">{statusView === 'archived' ? '🗄️' : '👥'}</span>
          <p className="font-semibold text-[13.5px]">
            {statusView === 'archived' ? 'No archived users' : 'No users found'}
          </p>
          <p className="text-[12px] text-gray-800 max-w-sm">
            {debouncedSearch
              ? `No users match "${search}". Try adjusting your search query or role filter.`
              : statusView === 'archived'
              ? 'Archived employees and managers will show up here and can be restored.'
              : 'Click "+ Add User" above to add team members to your organization.'}
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={paginatedUsers}
          getRowKey={(u) => u.id}
          pagination={{
            page,
            totalPages,
            totalCount: displayedUsers.length,
            onPrev: () => setPage((p) => Math.max(0, p - 1)),
            onNext: () => setPage((p) => Math.min(totalPages - 1, p + 1)),
          }}
        />
      )}

      {/* Modals */}
      {isCreating && (
        <CreateUserModal
          token={token}
          tenantId={effectiveTenantId}
          storeId={currentStoreId}
          stores={stores.map((s) => ({
            label: `${s.name || s.storeNo} · ${s.location || s.district || ''}`.trim().replace(/ · $/, ''),
            value: s.storeNo || s.id || s._id,
          }))}
          canManageSubscriptionAllowed={canCurrentUserManageSub}
          initialRole={modalInitialRole}
          allowedRoles={['employee', 'manager', 'owner']}
          onClose={() => setIsCreating(false)}
          onCreated={(createdRole, user) => {
            setIsCreating(false)
            if (createdRole === 'employee') {
              const emp = user as ApiEmployee
              setEmployees((prev) => [emp, ...prev.filter((e) => e.user_id !== emp.user_id)])
              showToast(`Employee ${getEmployeeName(emp)} was created successfully.`)
            } else if (createdRole === 'manager') {
              const mgr = user as ApiManager
              setManagers((prev) => [mgr, ...prev.filter((m) => m.user_id !== mgr.user_id)])
              showToast(`Manager ${mgr.first_name} ${mgr.last_name} was created successfully.`)
            } else if (createdRole === 'owner') {
              const own = user as OrganizationOwner
              setOwners((prev) => [own, ...prev.filter((o) => o.user_id !== own.user_id)])
              showToast(`Co-Owner ${own.first_name} ${own.last_name} was created successfully.`)
            }
          }}
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

      {pendingArchiveEmployee && (
        <ConfirmArchiveEmployeeModal
          employeeName={getEmployeeName(pendingArchiveEmployee)}
          isArchiving={isArchiving}
          onConfirm={handleConfirmArchiveEmployee}
          onCancel={() => setPendingArchiveEmployee(null)}
        />
      )}

      {pendingArchiveManager && (
        <ConfirmArchiveManagerModal
          managerName={getEmployeeName(pendingArchiveManager)}
          isArchiving={isArchiving}
          onConfirm={handleConfirmArchiveManager}
          onCancel={() => setPendingArchiveManager(null)}
        />
      )}
    </div>
  )
}

