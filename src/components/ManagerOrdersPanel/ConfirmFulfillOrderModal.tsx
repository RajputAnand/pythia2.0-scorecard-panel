'use client'

import type { SwagOrder } from '@/types/swagstore'

interface ConfirmFulfillOrderModalProps {
  order: SwagOrder
  managerName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmFulfillOrderModal({
  order,
  managerName,
  onConfirm,
  onCancel,
}: ConfirmFulfillOrderModalProps) {
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
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-accent-light text-accent text-2xl font-bold">
            ✓
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-primary">Fulfill Reward Order?</h2>
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
              <span className="text-secondary text-[11.5px] uppercase font-semibold">Employee</span>
              <span className="font-semibold text-primary">{order.employeeName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-border/70 pb-2">
              <span className="text-secondary text-[11.5px] uppercase font-semibold">Points Deducted</span>
              <span className="font-mono font-bold text-gold">🪙 {order.pointsCost.toLocaleString('en-US')} pts</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-secondary text-[11.5px] uppercase font-semibold">Fulfilling Manager</span>
              <span className="font-medium text-accent">{managerName}</span>
            </div>
          </div>

          <p className="text-[12px] text-secondary leading-relaxed">
            Please verify that this reward has been handed over or digitally issued to the employee.
          </p>

          <div className="flex w-full gap-3 mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-border text-primary font-semibold text-[13px] rounded-lg py-2.5 hover:bg-surface-alt transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 bg-accent text-white font-semibold text-[13px] rounded-lg py-2.5 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              Confirm & Fulfill
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
