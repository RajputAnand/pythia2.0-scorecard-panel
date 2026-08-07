'use client'

interface ConfirmArchiveEmployeeModalProps {
  employeeName: string
  isArchiving: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmArchiveEmployeeModal({
  employeeName,
  isArchiving,
  onConfirm,
  onCancel,
}: ConfirmArchiveEmployeeModalProps) {
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
                d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-7 4v6m4-6v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12"
                stroke="var(--color-danger)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-[18px] font-semibold text-primary">Archive {employeeName}?</h1>
          <p className="text-[13px] text-secondary leading-relaxed">
            They&apos;ll be signed out and hidden from your team everywhere — the employee list, leaderboards,
            and dashboards. Their scores, points, and coaching history stay on file. You can unarchive them
            from the Archived tab at any time.
          </p>
          <div className="flex w-full gap-3 mt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isArchiving}
              className="flex-1 border border-border text-primary font-semibold text-[13.5px] rounded-lg py-[11px] hover:bg-surface-alt transition-colors disabled:opacity-50 disabled:cursor-default cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isArchiving}
              className="flex-1 bg-danger text-white font-semibold text-[13.5px] rounded-lg py-[11px] hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-default cursor-pointer"
            >
              {isArchiving ? 'Archiving…' : 'Archive employee'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
