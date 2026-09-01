'use client'

interface ConfirmArchiveOwnerModalProps {
  ownerName: string
  isArchiving: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmArchiveOwnerModal({
  ownerName,
  isArchiving,
  onConfirm,
  onCancel,
}: ConfirmArchiveOwnerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onCancel}>
      <div
        className="w-full max-w-[400px] bg-surface border border-border rounded-2xl shadow-lg p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-danger/10 text-danger flex items-center justify-center text-[18px]">
            ⚠️
          </div>
          <div>
            <h2 className="text-[15.5px] font-semibold text-primary">Archive Owner?</h2>
            <p className="text-[12px] text-muted">This action can be reversed at any time.</p>
          </div>
        </div>

        <p className="text-[12.5px] text-secondary leading-relaxed">
          Are you sure you want to archive <strong>{ownerName}</strong>? They will no longer be able to log in. Their assigned stores and historical oversight data will remain intact.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            disabled={isArchiving}
            className="border border-border bg-surface text-secondary hover:text-primary px-3.5 py-1.5 text-[12.5px] font-semibold rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isArchiving}
            className="bg-danger hover:bg-danger/90 text-white px-4 py-1.5 text-[12.5px] font-semibold rounded-lg cursor-pointer"
          >
            {isArchiving ? 'Archiving…' : 'Archive Owner'}
          </button>
        </div>
      </div>
    </div>
  )
}

