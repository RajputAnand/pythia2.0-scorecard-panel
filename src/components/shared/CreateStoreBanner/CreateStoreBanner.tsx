'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface CreateStoreBannerProps {
  featureName: string
  description?: string
  actionHref?: string
}

export default function CreateStoreBanner({
  featureName,
  description,
  actionHref,
}: CreateStoreBannerProps) {
  const pathname = usePathname()
  const isSuperAdmin = pathname.startsWith('/super-admin')
  const defaultHref = isSuperAdmin ? '/super-admin/owner/stores' : '/owner/stores'
  const targetHref = actionHref || defaultHref

  const defaultDescription =
    featureName.toLowerCase().includes('roi')
      ? 'You need to create at least one store before Pythia can track transactions, customer dwell time, and calculate revenue attribution.'
      : 'You need to create at least one store before Pythia can compare your store performance, ranking, and speed against network peers.'

  return (
    <div className="bg-accent/10 border border-accent/25 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0 text-accent text-[20px]">
          🏪
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-primary">
            Create store to see {featureName}
          </h3>
          <p className="text-[12.5px] text-muted mt-1 leading-normal max-w-2xl">
            {description || defaultDescription}
          </p>
        </div>
      </div>
      <Link
        href={targetHref}
        className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-[12.5px] font-semibold hover:bg-accent-mid transition-colors cursor-pointer whitespace-nowrap shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Create Store
      </Link>
    </div>
  )
}

