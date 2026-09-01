'use client'

import { useState } from 'react'
import { createOwner } from '@/queries/owners'
import { createOwnerSchema, type CreateOwnerSchema } from '@/schemas/tenant'
import DynamicForm from '@/components/shared/DynamicForm/DynamicForm'
import MultiSelect from '@/components/shared/MultiSelect/MultiSelect'
import CredentialsReveal from '@/components/shared/CredentialsReveal/CredentialsReveal'
import { extractApiErrorMessage } from '@/utils/common'
import type { FormField } from '@/types/dynamic-form'
import type { Tenant, TenantStore } from '@/types/tenant'
import type { TenantOwner } from '@/types/owner'

interface CreateOwnerModalProps {
  token: string
  tenants: Tenant[]
  stores: TenantStore[]
  preselectedTenantId?: string
  onClose: () => void
  onCreated: (owner: TenantOwner) => void
}

const FIELDS: FormField[] = [
  { id: 'firstName', type: 'text', label: 'First Name', placeholder: 'Jane' },
  { id: 'lastName', type: 'text', label: 'Last Name', placeholder: 'Doe' },
  { id: 'email', type: 'email', label: 'Email', placeholder: 'jane.doe@company.com' },
  { id: 'phone', type: 'text', label: 'Phone (optional)', placeholder: '+1 555 0100' },
]

export default function CreateOwnerModal({
  token,
  tenants,
  stores,
  preselectedTenantId,
  onClose,
  onCreated,
}: CreateOwnerModalProps) {
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    preselectedTenantId || tenants[0]?.id || ''
  )
  const [assignAll, setAssignAll] = useState(true)
  const [storeIds, setStoreIds] = useState<string[]>([])
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | undefined>()

  const [step, setStep] = useState<'form' | 'credentials'>('form')
  const [tempPassword, setTempPassword] = useState('')
  const [createdUserId, setCreatedUserId] = useState('')
  const [createdName, setCreatedName] = useState('')

  const tenantStores = stores.filter((s) => s.tenantId === selectedTenantId)
  const storeOptions = tenantStores.map((s) => ({ label: `${s.name} (${s.storeNo})`, value: s.id }))

  async function handleSubmit(values: CreateOwnerSchema) {
    if (!selectedTenantId) {
      setServerError('Please select a tenant company.')
      return
    }

    const assignedStores = assignAll
      ? tenantStores.map((s) => s.id)
      : storeIds.length > 0
      ? storeIds
      : tenantStores.map((s) => s.id)

    setServerError(undefined)
    setIsPending(true)

    try {
      const res = await createOwner({
        token,
        tenantId: selectedTenantId,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
        storeIds: assignedStores,
      })

      const fullName = `${values.firstName} ${values.lastName}`.trim()
      setCreatedName(fullName)
      setTempPassword(res.temp_password)
      setCreatedUserId(res.user_id)
      setStep('credentials')
    } catch (err) {
      setServerError(extractApiErrorMessage(err, 'Failed to create owner.'))
    } finally {
      setIsPending(false)
    }
  }

  function handleDone() {
    const tenant = tenants.find((t) => t.id === selectedTenantId)
    const assignedStores = assignAll
      ? tenantStores.map((s) => s.id)
      : storeIds.length > 0
      ? storeIds
      : tenantStores.map((s) => s.id)

    onCreated({
      _id: createdUserId,
      id: createdUserId,
      user_id: createdUserId,
      first_name: createdName.split(' ')[0] || '',
      last_name: createdName.split(' ').slice(1).join(' ') || '',
      email: '',
      role_name: 'owner',
      tenant_id: selectedTenantId,
      tenant_name: tenant?.name || 'Tenant',
      store_ids: assignedStores,
      status: 'invited',
      is_active: true,
      must_change_password: true,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-[460px] bg-surface border border-border rounded-2xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'form' ? (
          <>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[16px] font-semibold text-primary">Add Tenant Owner</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-muted hover:text-primary cursor-pointer"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-[12.5px] text-muted mb-4">
              Provision an Owner for a customer tenant. A temporary password will be generated.
            </p>

            <div className="flex flex-col gap-4">
              {/* Tenant selector */}
              <div>
                <label className="text-[11.5px] font-medium text-secondary uppercase tracking-[.07em] block mb-1.5">
                  Tenant / Company *
                </label>
                <Select
                  options={tenants.map((t) => ({ label: `${t.name} (${t.code})`, value: t.id }))}
                  onChange={(val) => setSelectedTenantId(String(val))}
                  ariaLabel="Select tenant"
                />
              </div>

              {/* Stores scope */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-medium text-secondary uppercase tracking-[.07em]">
                      type="checkbox"
                      checked={assignAll}
                      onChange={(e) => setAssignAll(e.target.checked)}
                    />
                    All Stores
                  </label>
                </div>

                {!assignAll && (
                  <MultiSelect
                    ariaLabel="Select assigned stores"
                    placeholder="Select specific stores"
                    options={storeOptions}
                    values={storeIds}
                    onChange={(vals) => setStoreIds(vals.map(String))}
                  />
                )}
              </div>

              <DynamicForm
                fields={FIELDS}
                zodSchema={createOwnerSchema}
                onSubmit={handleSubmit}
                submitLabel="Create Owner & Generate Password"
                loading={isPending}
                serverError={serverError}
              />
            </div>
          </>
        ) : (
          <CredentialsReveal
            heading="Owner account created"
            message="Share these temporary credentials with the Owner. The temporary password will be wiped once they complete first login."
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

