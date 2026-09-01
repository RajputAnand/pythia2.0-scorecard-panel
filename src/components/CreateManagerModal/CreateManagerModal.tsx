'use client'

import { useRef, useState } from 'react'
import { createManager } from '@/queries/managers'
import { createManagerSchema, type CreateManagerSchema } from '@/schemas/manager'
import DynamicForm from '@/components/shared/DynamicForm/DynamicForm'
import MultiSelect from '@/components/shared/MultiSelect/MultiSelect'
import CredentialsReveal from '@/components/shared/CredentialsReveal/CredentialsReveal'
import { extractApiErrorMessage } from '@/utils/common'
import { STORES } from '@/lib/store-data'
import type { FormField } from '@/types/dynamic-form'
import type { ApiManager } from '@/types/manager'

const FIELDS: FormField[] = [
  { id: 'firstName', type: 'text', label: 'First Name', placeholder: 'Jane' },
  { id: 'lastName', type: 'text', label: 'Last Name', placeholder: 'Doe' },
  { id: 'email', type: 'email', label: 'Email (optional)', placeholder: 'jane@example.com' },
  { id: 'phone', type: 'text', label: 'Phone (optional)', placeholder: '+1 555 0100' },
]

const STORE_OPTIONS = STORES.map((store) => ({ label: `${store.name} · ${store.location}`, value: store._id }))

interface CreateManagerModalProps {
  token: string
  onClose: () => void
  onCreated: (manager: ApiManager) => void
}

export default function CreateManagerModal({ token, onClose, onCreated }: CreateManagerModalProps) {
  const [step, setStep] = useState<'form' | 'credentials'>('form')
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | undefined>()
  const [tempPassword, setTempPassword] = useState('')
  const [createdUserId, setCreatedUserId] = useState('')

  // Store assignment lives outside DynamicForm (it has no multi-select field
  // type) — same pattern CreateEmployeeModal uses for its photos section.
  const [storeIds, setStoreIds] = useState<(string | number)[]>([])
  const [storeError, setStoreError] = useState<string | undefined>()

  const createdName = useRef('')

  async function handleSubmit(values: CreateManagerSchema) {
    if (storeIds.length === 0) {
      setStoreError('Assign the manager to at least one store.')
      return
    }
    setStoreError(undefined)
    setServerError(undefined)
    setIsPending(true)
    try {
      const response = await createManager({
        token,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email || undefined,
        phone: values.phone || undefined,
        storeIds: storeIds.map(String),
      })
      createdName.current = `${values.firstName} ${values.lastName}`.trim()
      setTempPassword(response.temp_password)
      setCreatedUserId(response.user_id)
      setStep('credentials')
    } catch (err) {
      setServerError(extractApiErrorMessage(err, 'Failed to create manager. Please try again.'))
    } finally {
      setIsPending(false)
    }
  }

  function handleDone() {
    onCreated({
      _id: createdUserId,
      user_id: createdUserId,
      first_name: createdName.current.split(' ')[0] ?? '',
      last_name: createdName.current.split(' ').slice(1).join(' '),
      email: '',
      phone: null,
      role_name: 'manager',
      store_ids: storeIds.map(String),
      is_active: true,
      must_change_password: true,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-[440px] bg-surface border border-border rounded-2xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'form' ? (
          <>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[16px] font-semibold text-primary">New Manager</h2>
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
              They&apos;ll be added with a temporary password you can share below, and given access to the stores
              you assign.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-[6px]">
                <label
                  htmlFor="manager-stores"
                  className="text-[12px] font-medium text-secondary uppercase tracking-[.07em]"
                >
                  Stores
                </label>
                <MultiSelect
                  ariaLabel="Assign to stores"
                  placeholder="Select one or more stores"
                  options={STORE_OPTIONS}
                  values={storeIds}
                  onChange={(next) => {
                    setStoreIds(next)
                    if (next.length > 0) setStoreError(undefined)
                  }}
                  invalid={!!storeError}
                />
                {storeError && <p className="text-[11.5px] text-danger">{storeError}</p>}
              </div>

              <DynamicForm
                fields={FIELDS}
                zodSchema={createManagerSchema}
                onSubmit={handleSubmit}
                submitLabel="Create Manager"
                loading={isPending}
                serverError={serverError}
              />
            </div>
          </>
        ) : (
          <CredentialsReveal
            heading="Manager created"
            message="Share these credentials with them securely — the password can only be viewed again from the manager list until they change it."
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
