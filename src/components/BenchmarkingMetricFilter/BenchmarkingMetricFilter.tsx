'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Suspense } from 'react'

const METRICS = ['Overall', 'Hospitality', 'Checkout', 'Time to Svc'] as const

function FilterButtons() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const active = searchParams.get('sort') || 'Overall'

  const handleSelect = (m: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', m)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex border border-border rounded-lg overflow-hidden">
      {METRICS.map((m, i) => (
        <button
          key={m}
          onClick={() => handleSelect(m)}
          className={`font-sans text-[12.5px] font-medium cursor-pointer transition-all duration-150 px-[15px] py-[7px] border-none
            ${i < METRICS.length - 1 ? 'border-r border-border' : ''}
            ${active === m
              ? 'bg-surface-alt text-primary'
              : 'bg-transparent text-secondary hover:bg-surface-alt'
            }`}
        >
          {m}
        </button>
      ))}
    </div>
  )
}

export default function BenchmarkingMetricFilter() {
  return (
    <Suspense fallback={<div className="h-[32px]" />}>
      <FilterButtons />
    </Suspense>
  )
}
