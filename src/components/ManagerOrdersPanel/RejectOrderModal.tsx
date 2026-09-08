'use client'

import { useState } from 'react'
import type { SwagOrder } from '@/types/swagstore'

interface RejectOrderModalProps {
  order: SwagOrder
  roleTitle?: string
  onConfirm: (reason: string) => void
  onCancel: () => void
}

const PRESET_REASONS = [
  'Out of physical stock',
  'Item discontinued or unavailable',
  'Duplicate or accidental claim',
  'Store policy restriction',
]

export default function RejectOrderModal({
  order,
  roleTitle = 'Manager',
  onConfirm,
  onCancel,
}: RejectOrderModalProps) {
  const [reason, setReason] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleSelectPreset(preset: string) {
    setSelectedPreset(preset)
    setReason(preset)
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = reason.trim()
    if (!trimmed) {
      setError('Please provide a reason for rejecting this order.')
      return
    }
    onConfirm(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[480px] bg-surface border border-border rounded-2xl shadow-xl p-6 md:p-7 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-danger/10 text-danger text-xl font-bold shrink-0">
              ✕
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-primary">Reject Reward Order</h2>
              <p className="text-[12px] text-muted">
                Order #{order.id} · Claimed by <span className="font-semibold text-primary">{order.employeeName}</span>
              </p>
            </div>
          </div>

          {/* Order Summary Pill */}
          <div className="rounded-xl border border-border bg-surface-alt/60 p-3.5 flex items-center justify-between text-[12.5px]">
            <div className="flex items-center gap-2">
              <span className="text-[22px]">{order.productEmoji}</span>
              <div>
                <span className="font-semibold text-primary block leading-tight">{order.productName}</span>
                <span className="text-[11px] text-muted">{order.category || 'Swag Item'}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-gold block">
                🪙 {order.pointsCost.toLocaleString('en-US')} pts
              </span>
              <span className="text-[10.5px] text-accent font-medium">Will be refunded</span>
            </div>
          </div>

          {/* Quick preset pills */}
          <div>
            <label className="block text-[11.5px] font-semibold text-secondary uppercase tracking-[.05em] mb-1.5">
              Quick Reasons
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_REASONS.map((p) => {
                const isSelected = selectedPreset === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`text-[11.5px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-danger/10 border-danger/40 text-danger font-semibold'
                        : 'bg-surface border-border text-secondary hover:bg-surface-alt hover:text-primary'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Detailed Reason Textarea */}
          <div>
            <label className="block text-[11.5px] font-semibold text-secondary uppercase tracking-[.05em] mb-1.5">
              Rejection Reason <span className="text-danger">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Explain why this reward claim is being rejected (visible to the employee)…"
              className={`w-full rounded-xl border bg-surface px-3 py-2 text-[12.5px] text-primary placeholder:text-muted focus:outline-hidden resize-none transition-colors ${
                error ? 'border-danger focus:border-danger' : 'border-border focus:border-accent'
              }`}
            />
            {error && (
              <p className="mt-1 text-[11px] text-danger font-medium">{error}</p>
            )}
            <p className="mt-1 text-[11px] text-muted">
              This note will appear in the employee&apos;s orders tab and points will be refunded immediately by {roleTitle}.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex w-full gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-border bg-surface hover:bg-surface-alt py-2.5 text-[12.5px] font-semibold text-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-danger hover:bg-danger/90 py-2.5 text-[12.5px] font-semibold text-white transition-opacity cursor-pointer shadow-xs"
            >
              Reject & Refund Points
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

