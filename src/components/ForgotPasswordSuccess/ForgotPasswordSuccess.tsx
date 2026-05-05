'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'We have sent a reset link to your email.'

  return (
    <div className="w-full max-w-[420px]">
      <div className="bg-surface border border-border rounded-2xl shadow-sm px-8 py-9">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-accent-light">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path
                d="M5 13l4 4L19 7"
                stroke="var(--color-accent)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-[18px] font-semibold text-primary">Check your email</h1>
          <p className="text-[13px] text-secondary leading-relaxed">{message}</p>
          <button onClick={() => router.replace('/login/employee')} className="w-full bg-surface cursor-pointer border border-border text-secondary font-semibold text-[13.5px] rounded-lg py-[11px] hover:bg-surface-alt transition-colors mt-2">
            ← Back to login
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ForgotPasswordSuccess() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  )
}
