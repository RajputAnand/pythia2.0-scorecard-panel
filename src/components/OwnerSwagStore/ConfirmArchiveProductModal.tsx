'use client'

import type { SwagProduct } from '@/types/swagstore'

interface ConfirmArchiveProductModalProps {
  product: SwagProduct
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmArchiveProductModal({
  product,
  onConfirm,
  onCancel,
}: ConfirmArchiveProductModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[420px] bg-surface border border-border rounded-2xl shadow-xl p-6 md:p-7 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-surface-alt text-secondary text-2xl">
            🗄️
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-primary">Archive Reward?</h2>
            <p className="mt-1 text-[13px] font-semibold text-secondary">
              {product.emoji} {product.name}
            </p>
          </div>

          <p className="text-[12.5px] text-secondary leading-relaxed">
            This reward will be hidden from the employee swag store and cannot be claimed by new
            employees. Existing orders remain visible, and you can unarchive this item at any time.
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
              Archive Reward
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
