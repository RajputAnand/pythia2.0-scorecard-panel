'use client'

import type { SwagProduct } from '@/types/swagstore'

interface CannotDeleteProductModalProps {
  product: SwagProduct
  pendingOrdersCount: number
  onClose: () => void
  onArchiveInstead: () => void
  onViewOrders: () => void
}

export default function CannotDeleteProductModal({
  product,
  pendingOrdersCount,
  onClose,
  onArchiveInstead,
  onViewOrders,
}: CannotDeleteProductModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] bg-surface border border-border rounded-2xl shadow-xl p-6 md:p-7 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-amber-light text-amber text-2xl">
            ⚠️
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-primary">Cannot Delete Reward</h2>
            <p className="mt-1 text-[13px] font-semibold text-accent-mid">
              {product.emoji} {product.name}
            </p>
          </div>

          <div className="w-full rounded-xl border border-amber/30 bg-amber-light/40 p-3.5 text-left text-[12.5px] leading-relaxed text-secondary">
            <p className="font-semibold text-amber mb-1 flex items-center gap-1.5">
              <span>🔒</span> Active Orders Pending ({pendingOrdersCount})
            </p>
            An employee has claimed this reward, and the order is{' '}
            <strong>still not completed</strong>. Deleting this product would orphan open fulfillment
            obligations.
          </div>

          <p className="text-[12.5px] text-secondary leading-relaxed">
            You can <strong>archive</strong> this reward instead. Archiving instantly hides it from
            the employee swag store so no new employees can claim it, while allowing you to fulfill
            existing orders.
          </p>

          <div className="flex flex-col w-full gap-2.5 mt-2">
            <button
              type="button"
              onClick={onArchiveInstead}
              className="w-full bg-accent hover:opacity-90 text-white font-semibold text-[13px] rounded-lg py-2.5 transition-all cursor-pointer shadow-sm"
            >
              Archive Reward Instead (Recommended)
            </button>
            <div className="flex gap-2.5 w-full">
              <button
                type="button"
                onClick={onViewOrders}
                className="flex-1 border border-border bg-surface-alt hover:bg-surface text-primary font-medium text-[12.5px] rounded-lg py-2 transition-colors cursor-pointer"
              >
                View Pending Orders
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-border text-secondary hover:text-primary font-medium text-[12.5px] rounded-lg py-2 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
