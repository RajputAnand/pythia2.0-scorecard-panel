'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Something went wrong. Please try again later.'
  const keyParam = searchParams.get('key') || ''

  return (
    <div className="w-full max-w-[420px]">
      <div className="bg-surface border border-border rounded-2xl shadow-sm px-8 py-9">
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
          <h1 className="text-[18px] font-semibold text-primary">Reset failed</h1>
          <p className="text-[13px] text-secondary leading-relaxed">{message}</p>
          <button
            onClick={() => router.replace(`/reset-password${keyParam ? `?key=${keyParam}` : ''}`)}
            className="w-full bg-accent cursor-pointer text-white font-semibold text-[13.5px] rounded-lg py-[11px] hover:bg-accent-mid transition-colors mt-2"
          >
            ← Try again
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordError() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  )
}
