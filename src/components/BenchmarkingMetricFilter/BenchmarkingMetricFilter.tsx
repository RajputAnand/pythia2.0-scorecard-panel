'use client'

import { useState } from 'react'

const METRICS = ['Overall', 'Hospitality', 'Checkout', 'Time to Svc'] as const

export default function BenchmarkingMetricFilter() {
  const [active, setActive] = useState('Hospitality')

  return (
    <div className="flex border border-border rounded-lg overflow-hidden">
      {METRICS.map((m, i) => (
        <button
          key={m}
          onClick={() => setActive(m)}
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
