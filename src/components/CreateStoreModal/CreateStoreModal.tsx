'use client'

import { useState } from 'react'
import { createStore } from '@/queries/stores'
import { createStoreSchema, type CreateStoreSchema } from '@/schemas/tenant'
import DynamicForm from '@/components/shared/DynamicForm/DynamicForm'
import { extractApiErrorMessage } from '@/utils/common'
import type { FormField } from '@/types/dynamic-form'
import type { TenantStore } from '@/types/tenant'

interface CreateStoreModalProps {
  tenantId: string
  onClose: () => void
  onCreated: (store: TenantStore) => void
}

const FIELDS: FormField[] = [
  { id: 'storeNo', type: 'text', label: 'Store Code / Number', placeholder: 'e.g. STORE-006' },
  { id: 'name', type: 'text', label: 'Store Name', placeholder: 'e.g. Metro Flagship' },
  { id: 'location', type: 'text', label: 'Location / City', placeholder: 'e.g. Downtown' },
  { id: 'district', type: 'text', label: 'District / Region', placeholder: 'e.g. Central' },
  { id: 'street', type: 'text', label: 'Street Address (optional)', placeholder: '123 Main St' },
  { id: 'timezone', type: 'text', label: 'Timezone', placeholder: 'America/New_York', defaultValue: 'America/New_York' },
]

export default function CreateStoreModal({
  tenantId,
  onClose,
  onCreated,
}: CreateStoreModalProps) {
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | undefined>()

  async function handleSubmit(values: CreateStoreSchema) {
    setServerError(undefined)
    setIsPending(true)

    try {
      const res = await createStore({
        data: {
          tenantId,
          storeNo: values.storeNo,
          name: values.name,
          location: values.location,
          district: values.district,
          street: values.street,
          city: values.city,
          state: values.state,
          zip: values.zip,
          timezone: values.timezone,
        },
      })

      if (res.success && res.data) {
        onCreated(res.data)
      }
    } catch (err) {
      setServerError(extractApiErrorMessage(err, 'Failed to create store.'))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-[460px] bg-surface border border-border rounded-2xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[16px] font-semibold text-primary">Add Store Location</h2>
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
          Add a new store. A device pairing code will be minted for on-site edge sensors.
        </p>

        <DynamicForm
          fields={FIELDS}
          zodSchema={createStoreSchema}
          onSubmit={handleSubmit}
          submitLabel="Create Store & Mint Pairing Code"
          loading={isPending}
          serverError={serverError}
        />
      </div>
    </div>
  )
}

