'use client'

import { useEffect, useRef, useState } from 'react'
import { createEmployee, fetchEmployee } from '@/queries/employees'
import { createManager } from '@/queries/managers'
import { createSubOwner } from '@/queries/organization-owners'
import { fetchStoresForTenant } from '@/queries/stores'
import MultiSelect from '@/components/shared/MultiSelect/MultiSelect'
import Select from '@/components/shared/Select/Select'
import CredentialsReveal from '@/components/shared/CredentialsReveal/CredentialsReveal'
import { extractApiErrorMessage } from '@/utils/common'
import type { ApiEmployee } from '@/types/employee'
import type { ApiManager } from '@/types/manager'
import type { OrganizationOwner } from '@/types/organization-owner'

export type UserCreationRole = 'employee' | 'manager' | 'owner'

export interface StoreOption {
  label: string
  value: string
}

export interface CreateUserModalProps {
  token: string
  initialRole?: UserCreationRole
  allowedRoles?: UserCreationRole[]
  storeId?: string
  stores?: StoreOption[]
  tenantId?: string
  canManageSubscriptionAllowed?: boolean
  onClose: () => void
  onCreated?: (role: UserCreationRole, user: ApiEmployee | ApiManager | OrganizationOwner) => void
  onEmployeeCreated?: (employee: ApiEmployee) => void
  onManagerCreated?: (manager: ApiManager) => void
  onOwnerCreated?: (owner: OrganizationOwner) => void
}

const ROLE_OPTIONS: { label: string; value: UserCreationRole; description: string }[] = [
  {
    label: 'Employee',
    value: 'employee',
    description: "They'll be assigned to a store with temporary credentials you can share.",
  },
  {
    label: 'Manager',
    value: 'manager',
    description: 'They’ll be given managerial access to the stores you assign.',
  },
  {
    label: 'Co-Owner',
    value: 'owner',
    description: 'Bring on another Owner with full organization management access.',
  },
]

export default function CreateUserModal({
  token,
  initialRole = 'employee',
  allowedRoles = ['employee', 'manager', 'owner'],
  storeId,
  stores,
  tenantId,
  canManageSubscriptionAllowed = true,
  onClose,
  onCreated,
  onEmployeeCreated,
  onManagerCreated,
  onOwnerCreated,
}: CreateUserModalProps) {
  const [role, setRole] = useState<UserCreationRole>(() => {
    if (allowedRoles.includes(initialRole)) return initialRole
    return allowedRoles[0] || 'employee'
  })

  const [step, setStep] = useState<'form' | 'credentials'>('form')
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | undefined>()

  // Common Fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Employee specific
  const [employeeStoreId, setEmployeeStoreId] = useState(storeId || '')

  // Manager specific
  const [storeIds, setStoreIds] = useState<(string | number)[]>([])
  const [storeError, setStoreError] = useState<string | undefined>()

  // Co-Owner specific
  const [canManageSubscription, setCanManageSubscription] = useState(false)

  // Stores data for dropdowns
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>(stores || [])
  const [isLoadingStores, setIsLoadingStores] = useState(!stores || stores.length === 0)

  // Reveal state
  const [tempPassword, setTempPassword] = useState('')
  const [createdUserId, setCreatedUserId] = useState('')
  const createdRecordRef = useRef<{ role: UserCreationRole; data: ApiEmployee | ApiManager | OrganizationOwner } | null>(null)

  // Load stores if not passed
  useEffect(() => {
    if (stores && stores.length > 0) {
      setStoreOptions(stores)
      if (!employeeStoreId && stores[0]?.value) {
        setEmployeeStoreId(stores[0].value)
      }
      setIsLoadingStores(false)
      return
    }

    if (!token) {
      setIsLoadingStores(false)
      return
    }

    let cancelled = false
    setIsLoadingStores(true)

    fetchStoresForTenant({ token, tenantId, limit: 100 })
      .then((res) => {
        if (cancelled) return
        if (res.data && res.data.length > 0) {
          const opts: StoreOption[] = res.data.map((s) => ({
            label: `${s.name || s.storeNo} · ${s.location || s.district || ''}`.trim().replace(/ · $/, ''),
            value: s.storeNo || s.id || s._id,
          }))
          setStoreOptions(opts)
          if (!employeeStoreId && opts[0]?.value) {
            setEmployeeStoreId(opts[0].value)
          }
        } else {
          setStoreOptions([])
        }
      })
      .catch((err) => {
        if (cancelled) return
        console.warn('Failed to load stores for user creation:', err)
        setStoreOptions([])
      })
      .finally(() => {
        if (!cancelled) setIsLoadingStores(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, stores, tenantId, employeeStoreId])

  // Sync storeId prop if changed
  useEffect(() => {
    if (storeId) {
      setEmployeeStoreId(storeId)
    }
  }, [storeId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(undefined)
    setStoreError(undefined)

    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedFirst) {
      setServerError('First name is required.')
      return
    }
    if (!trimmedLast) {
      setServerError('Last name is required.')
      return
    }

    if (role === 'owner') {
      if (!trimmedEmail || !trimmedEmail.includes('@')) {
        setServerError('A valid email address is required for Co-Owners.')
        return
      }
    } else if (trimmedEmail && !trimmedEmail.includes('@')) {
      setServerError('Please enter a valid email address.')
      return
    }

    if (role === 'manager') {
      if (storeOptions.length === 0 && !isLoadingStores) {
        setStoreError('No stores are available to assign. Please create a store first.')
        return
      }
      if (storeIds.length === 0) {
        setStoreError('Assign the manager to at least one store.')
        return
      }
    }

    setIsPending(true)

    try {
      if (role === 'employee') {
        const response = await createEmployee({
          token,
          firstName: trimmedFirst,
          lastName: trimmedLast,
          email: trimmedEmail || undefined,
          phone: trimmedPhone || undefined,
          storeId: employeeStoreId || undefined,
        })

        let fullEmployee: ApiEmployee | null = null
        try {
          fullEmployee = await fetchEmployee({ token, userId: response.user_id })
        } catch {
          fullEmployee = {
            _id: response.user_id,
            user_id: response.user_id,
            first_name: trimmedFirst,
            last_name: trimmedLast,
            email: trimmedEmail || '',
            phone: trimmedPhone || null,
            role_name: 'employee',
            store_ids: employeeStoreId ? [employeeStoreId] : [],
            device_id: null,
            is_active: true,
          }
        }

        createdRecordRef.current = { role: 'employee', data: fullEmployee }
        setTempPassword(response.temp_password)
        setCreatedUserId(response.user_id)
        setStep('credentials')
      } else if (role === 'manager') {
        const response = await createManager({
          token,
          firstName: trimmedFirst,
          lastName: trimmedLast,
          email: trimmedEmail || undefined,
          phone: trimmedPhone || undefined,
          storeIds: storeIds.map(String),
          tenantId,
        })

        const newManager: ApiManager = {
          _id: response.user_id,
          user_id: response.user_id,
          first_name: trimmedFirst,
          last_name: trimmedLast,
          email: trimmedEmail || '',
          phone: trimmedPhone || null,
          role_name: 'manager',
          store_ids: storeIds.map(String),
          tenant_id: tenantId || null,
          is_active: true,
          must_change_password: true,
        }

        createdRecordRef.current = { role: 'manager', data: newManager }
        setTempPassword(response.temp_password)
        setCreatedUserId(response.user_id)
        setStep('credentials')
      } else if (role === 'owner') {
        const effectiveCanManageSub = canManageSubscriptionAllowed ? canManageSubscription : false
        const response = await createSubOwner({
          token,
          firstName: trimmedFirst,
          lastName: trimmedLast,
          email: trimmedEmail,
          phone: trimmedPhone || undefined,
          canManageSubscription: effectiveCanManageSub,
        })

        const newOwner: OrganizationOwner = {
          user_id: response.user_id,
          first_name: trimmedFirst,
          last_name: trimmedLast,
          email: trimmedEmail,
          phone: trimmedPhone || null,
          role_name: 'Owner',
          tenant_id: '',
          is_active: true,
          can_manage_subscription: response.can_manage_subscription,
          is_root_owner: false,
          created_by: 'me',
          created_at: new Date().toISOString(),
        }

        createdRecordRef.current = { role: 'owner', data: newOwner }
        setTempPassword(response.temp_password)
        setCreatedUserId(response.user_id)
        setStep('credentials')
      }
    } catch (err: unknown) {
      setServerError(extractApiErrorMessage(err, `Failed to create ${role}. Please try again.`))
    } finally {
      setIsPending(false)
    }
  }

  function handleDone() {
    if (createdRecordRef.current) {
      const { role: recRole, data } = createdRecordRef.current
      onCreated?.(recRole, data)
      if (recRole === 'employee') onEmployeeCreated?.(data as ApiEmployee)
      if (recRole === 'manager') onManagerCreated?.(data as ApiManager)
      if (recRole === 'owner') onOwnerCreated?.(data as OrganizationOwner)
    }
    onClose()
  }

  const handleDismiss = () => {
    if (step === 'credentials') {
      handleDone()
    } else {
      onClose()
    }
  }

  const activeRoleOption = ROLE_OPTIONS.find((r) => r.value === role) || ROLE_OPTIONS[0]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs"
      onClick={handleDismiss}
    >
      <div
        className="w-full max-w-[480px] bg-surface border border-border rounded-2xl shadow-xl p-6 transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'form' ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[16px] font-semibold text-primary">Add New User</h2>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close"
                className="text-muted hover:text-primary cursor-pointer transition-colors"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-[12px] text-muted mb-4">
              Select the user role and configure their access details below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[11.5px] font-medium text-secondary uppercase tracking-[.07em]"
                >
                  Role *
                </label>
                <Select
                  value={role}
                  options={ROLE_OPTIONS.filter((opt) => allowedRoles.includes(opt.value)).map((opt) => ({
                    label: opt.label,
                    value: opt.value,
                  }))}
                  onChange={(val) => {
                    const newRole = val as UserCreationRole
                    setRole(newRole)
                    setServerError(undefined)
                    setStoreError(undefined)
                  }}
                  fullWidth
                  ariaLabel="Select user role"
                  triggerClassName="py-2.5 text-[13px] bg-surface-alt border-border"
                />
                <p className="text-[11px] text-muted">{activeRoleOption.description}</p>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-medium text-secondary mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full px-3 py-2 text-[13px] bg-surface-alt border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent text-primary placeholder:text-muted"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-medium text-secondary mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-3 py-2 text-[13px] bg-surface-alt border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent text-primary placeholder:text-muted"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-[11.5px] font-medium text-secondary mb-1">
                  {role === 'owner' ? 'Email Address *' : 'Email (optional)'}
                </label>
                <input
                  type="email"
                  required={role === 'owner'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@example.com"
                  className="w-full px-3 py-2 text-[13px] bg-surface-alt border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent text-primary placeholder:text-muted"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-[11.5px] font-medium text-secondary mb-1">Phone Number (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 text-[13px] bg-surface-alt border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent text-primary placeholder:text-muted"
                />
              </div>

              {/* Role-Specific Fields */}
              {role === 'employee' && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <label
                    className="text-[11.5px] font-medium text-secondary uppercase tracking-[.07em]"
                  >
                    Assigned Store
                  </label>
                  <Select
                    value={employeeStoreId}
                    options={
                      storeOptions.length === 0
                        ? [
                            {
                              label: isLoadingStores ? 'Loading stores…' : 'No stores available (unassigned)',
                              value: '',
                            },
                          ]
                        : storeOptions
                    }
                    onChange={(val) => setEmployeeStoreId(String(val))}
                    fullWidth
                    ariaLabel="Select assigned store"
                    triggerClassName="py-2.5 text-[13px] bg-surface-alt border-border"
                  />
                </div>
              )}

              {role === 'manager' && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <label
                    htmlFor="manager-stores"
                    className="text-[11.5px] font-medium text-secondary uppercase tracking-[.07em]"
                  >
                    Stores *
                  </label>
                  {!isLoadingStores && storeOptions.length === 0 && (
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11.5px] text-amber-600 dark:text-amber-400">
                      No accessible stores found. Please create or assign a store before adding a manager.
                    </div>
                  )}
                  <MultiSelect
                    ariaLabel="Assign to stores"
                    placeholder={
                      isLoadingStores
                        ? 'Loading stores…'
                        : storeOptions.length === 0
                        ? 'No stores available'
                        : 'Select one or more stores'
                    }
                    options={storeOptions}
                    values={storeIds}
                    onChange={(next) => {
                      setStoreIds(next)
                      if (next.length > 0) setStoreError(undefined)
                    }}
                    invalid={!!storeError}
                  />
                  {storeError && <p className="text-[11.5px] text-danger">{storeError}</p>}
                </div>
              )}

              {role === 'owner' && canManageSubscriptionAllowed && (
                <div className="rounded-xl border border-border/80 bg-surface-alt/60 p-3 mt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canManageSubscription}
                      onChange={(e) => setCanManageSubscription(e.target.checked)}
                      className="mt-0.5 rounded border-border text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[12.5px] font-medium text-primary">
                        Allow maintenance of payment methods & subscription
                      </span>
                      <span className="block text-[11px] text-muted leading-relaxed mt-0.5">
                        Grants access to the Stripe Customer Portal to add or update payment methods, view invoices, and manage subscription settings on behalf of this organization.
                      </span>
                    </div>
                  </label>
                </div>
              )}

              {serverError && (
                <div className="p-2.5 bg-danger/10 border border-danger/20 rounded-lg text-danger text-[12px]">
                  {serverError}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/70">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="px-3.5 py-2 text-[12.5px] font-medium text-secondary hover:text-primary rounded-lg border border-border hover:bg-surface-alt transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-[12.5px] font-medium text-white bg-accent hover:opacity-90 rounded-lg transition-opacity flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    `Create ${activeRoleOption.label}`
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <CredentialsReveal
            heading={`${activeRoleOption.label} created`}
            message="Share these credentials with them securely — the temporary password can only be viewed again until they change it."
            userId={createdUserId}
            password={tempPassword}
            actionLabel="Done"
            onAction={handleDone}
          />
        )}
      </div>
    </div>
  )
}

