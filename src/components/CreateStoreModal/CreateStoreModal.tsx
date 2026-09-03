'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createStore } from '@/queries/stores'
import { createStoreSchema, type CreateStoreSchema } from '@/schemas/tenant'
import { extractApiErrorMessage } from '@/utils/common'
import { useToast } from '@/context/ToastContext'
import type { TenantStore } from '@/types/tenant'

interface CreateStoreModalProps {
  tenantId?: string
  onClose: () => void
  onCreated: (store: TenantStore) => void
}

function generatePairingCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000)
  const letters = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `PAIR-${num}-${letters}`
}

export default function CreateStoreModal({
  tenantId = 'ten_lionmart',
  onClose,
  onCreated,
}: CreateStoreModalProps) {
  const { showToast } = useToast()
  const [pairingCode, setPairingCode] = useState(() => generatePairingCode())
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | undefined>()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateStoreSchema>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      storeNo: '',
      name: '',
      location: '',
      district: '',
      fullAddress: '',
      timezone: 'America/New_York',
      pairingCode: pairingCode,
    },
    mode: 'onBlur',
  })

  function handleRegeneratePairingCode() {
    const newCode = generatePairingCode()
    setPairingCode(newCode)
    setValue('pairingCode', newCode)
    showToast('Generated new edge device pairing code')
  }

  function handleCopyCode() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pairingCode)
      showToast('Pairing code copied to clipboard!')
    }
  }

  async function onSubmit(values: CreateStoreSchema) {
    setServerError(undefined)
    setIsPending(true)

    try {
      const res = await createStore({
        data: {
          tenantId,
          storeNo: values.storeNo.trim(),
          name: values.name.trim(),
          location: values.location.trim(),
          district: values.district.trim(),
          fullAddress: values.fullAddress.trim(),
          pairingCode: pairingCode,
          timezone: values.timezone || 'America/New_York',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 overflow-y-auto" onClick={onClose}>
      <div
        className="w-full max-w-[500px] bg-surface border border-border rounded-2xl shadow-xl p-6 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[16px] font-semibold text-primary">Add Store Location</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-primary cursor-pointer p-1 rounded-md transition-colors"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className="text-[12.5px] text-muted mb-4">
          Register a new store location and assign an edge device pairing code for on-site sensor dispatch.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5" noValidate>
          {serverError && (
            <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-[12.5px] rounded-lg">
              {serverError}
            </div>
          )}

          {/* Store Number and Store Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="storeNo" className="text-[11.5px] font-medium text-secondary uppercase tracking-[.06em]">
                Store Code / Number <span className="text-danger">*</span>
              </label>
              <input
                id="storeNo"
                type="text"
                placeholder="e.g. STORE-007"
                {...register('storeNo')}
                className={`w-full bg-surface-alt border rounded-lg px-3 py-2 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors ${
                  errors.storeNo ? 'border-danger' : 'border-border'
                }`}
              />
              {errors.storeNo && <p className="text-[11px] text-danger">{errors.storeNo.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-[11.5px] font-medium text-secondary uppercase tracking-[.06em]">
                Store Name <span className="text-danger">*</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Downtown Flagship"
                {...register('name')}
                className={`w-full bg-surface-alt border rounded-lg px-3 py-2 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors ${
                  errors.name ? 'border-danger' : 'border-border'
                }`}
              />
              {errors.name && <p className="text-[11px] text-danger">{errors.name.message}</p>}
            </div>
          </div>

          {/* Location & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="location" className="text-[11.5px] font-medium text-secondary uppercase tracking-[.06em]">
                Location / City <span className="text-danger">*</span>
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g. Manhattan"
                {...register('location')}
                className={`w-full bg-surface-alt border rounded-lg px-3 py-2 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors ${
                  errors.location ? 'border-danger' : 'border-border'
                }`}
              />
              {errors.location && <p className="text-[11px] text-danger">{errors.location.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="district" className="text-[11.5px] font-medium text-secondary uppercase tracking-[.06em]">
                District / Region <span className="text-danger">*</span>
              </label>
              <input
                id="district"
                type="text"
                placeholder="e.g. Central District"
                {...register('district')}
                className={`w-full bg-surface-alt border rounded-lg px-3 py-2 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors ${
                  errors.district ? 'border-danger' : 'border-border'
                }`}
              />
              {errors.district && <p className="text-[11px] text-danger">{errors.district.message}</p>}
            </div>
          </div>

          {/* Full Address field with helper note beneath */}
          <div className="flex flex-col gap-1">
            <label htmlFor="fullAddress" className="text-[11.5px] font-medium text-secondary uppercase tracking-[.06em]">
              Full Address <span className="text-danger">*</span>
            </label>
            <textarea
              id="fullAddress"
              rows={2}
              placeholder="e.g. 100 North Blvd, Suite 200, New York, NY 10001"
              {...register('fullAddress')}
              className={`w-full bg-surface-alt border rounded-lg px-3 py-2 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors resize-none ${
                errors.fullAddress ? 'border-danger' : 'border-border'
              }`}
            />
            {errors.fullAddress && <p className="text-[11px] text-danger">{errors.fullAddress.message}</p>}
            <div className="flex items-start gap-1.5 mt-0.5 rounded-lg bg-surface-alt/70 border border-border-subtle p-2 text-[11.5px] text-secondary">
              <span className="text-[13px] shrink-0 leading-tight">📦</span>
              <span className="leading-snug">
                <strong className="text-primary font-medium">Delivery Note:</strong> Add complete and proper address of the store so that edge device can be delivered easily to that store.
              </span>
            </div>
          </div>

          {/* Edge Device Pairing Code (Auto-generated) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="pairingCode" className="text-[11.5px] font-medium text-secondary uppercase tracking-[.06em]">
                Edge Device Pairing Code (Auto-Generated)
              </label>
              <button
                type="button"
                onClick={handleRegeneratePairingCode}
                className="text-[11px] font-semibold text-accent hover:text-accent-mid cursor-pointer flex items-center gap-1"
              >
                <span>🔄</span> Regenerate
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-between bg-surface-alt border border-border rounded-lg px-3 py-2">
                <span className="font-mono text-[13px] font-bold text-accent tracking-wider">
                  {pairingCode}
                </span>
                <span className="text-[10.5px] font-semibold uppercase px-2 py-0.5 rounded bg-accent-light text-accent">
                  Auto-Generated
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                title="Copy Pairing Code"
                className="p-2.5 rounded-lg border border-border bg-surface hover:bg-surface-alt text-secondary hover:text-primary transition-colors cursor-pointer shrink-0"
              >
                📋
              </button>
            </div>
          </div>

          {/* Timezone */}
          <div className="flex flex-col gap-1">
            <label htmlFor="timezone" className="text-[11.5px] font-medium text-secondary uppercase tracking-[.06em]">
              Timezone
            </label>
            <input
              id="timezone"
              type="text"
              defaultValue="America/New_York"
              {...register('timezone')}
              className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-[13px] text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-semibold rounded-lg border border-border bg-surface text-secondary hover:text-primary hover:bg-surface-alt transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 text-[13px] font-semibold rounded-lg bg-accent text-white hover:bg-accent-mid transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isPending ? 'Creating…' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

