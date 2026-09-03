'use client'

interface ConfirmDeactivateStoreModalProps {
  storeName: string
  storeNo?: string
  isDeactivating: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDeactivateStoreModal({
  storeName,
  storeNo,
  isDeactivating,
  onConfirm,
  onCancel,
}: ConfirmDeactivateStoreModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onCancel}>
      <div
        className="w-full max-w-[420px] bg-surface border border-border rounded-2xl shadow-lg px-8 py-9"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-danger-light">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                stroke="var(--color-danger)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-[18px] font-semibold text-primary">
            Deactivate {storeName}{storeNo ? ` (${storeNo})` : ''}?
          </h1>
          <p className="text-[13px] text-secondary leading-relaxed">
            This store location will be marked as inactive and edge sensor telemetry streams will be paused.
            All historical data remains preserved, and you can reactivate it anytime from the Deactivated tab.
          </p>
          <div className="flex w-full gap-3 mt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeactivating}
              className="flex-1 border border-border text-primary font-semibold text-[13.5px] rounded-lg py-[11px] hover:bg-surface-alt transition-colors disabled:opacity-50 disabled:cursor-default cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeactivating}
              className="flex-1 bg-danger text-white font-semibold text-[13.5px] rounded-lg py-[11px] hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-default cursor-pointer"
            >
              {isDeactivating ? 'Deactivating…' : 'Deactivate store'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
