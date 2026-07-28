import Link from 'next/link'

interface Props {
  count: number | null
}

export default function UnknownIdentitiesAlertCard({ count }: Props) {
  if (count === null) {
    return (
      <div className="bg-surface border border-border rounded-[13px] px-5 py-4 flex items-center gap-3 animate-pulse">
        <div className="w-9 h-9 rounded-[9px] bg-border shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-3 w-56 rounded bg-border" />
          <div className="h-3 w-40 rounded bg-border" />
        </div>
      </div>
    )
  }

  if (count === 0) {
    return (
      <div className="bg-surface border border-border rounded-[13px] px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-[9px] bg-accent-light flex items-center justify-center text-[16px] shrink-0">
          ✅
        </div>
        <div className="text-[12.5px] text-secondary">
          <strong className="font-semibold text-primary">All captures identified.</strong> No unassigned faces
          pending review.
        </div>
      </div>
    )
  }

  return (
    <Link
      href="/manager/unknown-identities"
      className="bg-danger-light border border-danger rounded-[13px] px-5 py-4 flex items-center gap-3 transition-shadow duration-200 hover:shadow-[0_4px_18px_rgba(0,0,0,.07)]"
    >
      <div className="w-9 h-9 rounded-[9px] bg-surface flex items-center justify-center text-[16px] shrink-0">
        🕵️
      </div>
      <div className="text-[12.5px] text-secondary flex-1">
        <strong className="font-semibold text-danger">
          {count} unassigned {count === 1 ? 'capture' : 'captures'}
        </strong>{' '}
        waiting on identification — their transactions aren&apos;t counted toward any employee&apos;s numbers yet.
      </div>
      <span className="text-[11.5px] font-semibold text-danger shrink-0">Resolve →</span>
    </Link>
  )
}
