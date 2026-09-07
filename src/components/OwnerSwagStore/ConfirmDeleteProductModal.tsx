'use client'

import type { SwagProduct } from '@/types/swagstore'

interface ConfirmDeleteProductModalProps {
  product: SwagProduct
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDeleteProductModal({
  product,
  onConfirm,
  onCancel,
}: ConfirmDeleteProductModalProps) {
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
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-danger-light text-danger">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path
                d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-7 4v6m4-6v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-primary">Permanently Delete Reward?</h2>
            <p className="mt-1 text-[13px] font-semibold text-danger">
              {product.emoji} {product.name}
            </p>
          </div>

          <p className="text-[12.5px] text-secondary leading-relaxed">
            There are no active uncompleted orders for this reward. Once deleted, this product will
            be permanently removed from the catalog. This action cannot be undone.
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
              className="flex-1 bg-danger text-white font-semibold text-[13px] rounded-lg py-2.5 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              Delete Reward
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
