'use client'

interface ConfirmDeleteEmployeeModalProps {
  employeeName: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDeleteEmployeeModal({
  employeeName,
  isDeleting,
  onConfirm,
  onCancel,
}: ConfirmDeleteEmployeeModalProps) {
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
                d="M12 9v4m0 4h.01M12 3l9.66 16.59A1 1 0 0120.66 21H3.34a1 1 0 01-.86-1.41L12 3z"
                stroke="var(--color-danger)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-[18px] font-semibold text-primary">Delete {employeeName}?</h1>
          <p className="text-[13px] text-secondary leading-relaxed">
            This permanently removes their account and login, along with every score, weekly/monthly rollup,
            coaching tip, and points history on file. Any capture assigned to them is unassigned. This
            can&apos;t be undone.
          </p>
          <div className="flex w-full gap-3 mt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 border border-border text-primary font-semibold text-[13.5px] rounded-lg py-[11px] hover:bg-surface-alt transition-colors disabled:opacity-50 disabled:cursor-default cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-danger text-white font-semibold text-[13.5px] rounded-lg py-[11px] hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-default cursor-pointer"
            >
              {isDeleting ? 'Deleting…' : 'Delete permanently'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
