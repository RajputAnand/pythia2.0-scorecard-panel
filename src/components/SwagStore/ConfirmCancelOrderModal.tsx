'use client'

import type { SwagOrder } from '@/types/swagstore'

interface ConfirmCancelOrderModalProps {
  order: SwagOrder
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmCancelOrderModal({
  order,
  onConfirm,
  onCancel,
}: ConfirmCancelOrderModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[440px] bg-surface border border-border rounded-2xl shadow-xl p-6 md:p-7 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-danger/10 text-danger text-2xl font-bold">
            ✕
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-primary">Cancel Reward Claim?</h2>
            <p className="mt-1 text-[13px] text-muted">
              Order #{order.id}
            </p>
          </div>

          {/* Order Details Card */}
          <div className="w-full rounded-xl border border-border bg-surface-alt/60 p-4 text-left text-[12.5px] space-y-2.5">
            <div className="flex items-center justify-between border-b border-border/70 pb-2">
              <span className="text-secondary text-[11.5px] uppercase font-semibold">Reward</span>
              <div className="flex items-center gap-1.5 font-semibold text-primary">
                <span>{order.productEmoji}</span>
                <span>{order.productName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-border/70 pb-2">
              <span className="text-secondary text-[11.5px] uppercase font-semibold">Category</span>
              <span className="text-secondary font-medium">{order.category || 'General'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-secondary text-[11.5px] uppercase font-semibold">Refund Amount</span>
              <span className="font-mono font-bold text-gold">🪙 {order.pointsCost.toLocaleString('en-US')} pts</span>
            </div>
          </div>

          <p className="text-[12px] text-secondary leading-relaxed">
            Cancelling this claim will immediately restore{' '}
            <strong className="text-gold font-mono">{order.pointsCost.toLocaleString('en-US')} pts</strong> back to your available balance.
          </p>

          <div className="flex w-full gap-3 mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-border bg-surface hover:bg-surface-alt py-2.5 text-[12.5px] font-semibold text-secondary transition-colors cursor-pointer"
            >
              Keep Order
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-danger hover:bg-danger/90 py-2.5 text-[12.5px] font-semibold text-white transition-opacity cursor-pointer shadow-xs"
            >
              Yes, Cancel Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

