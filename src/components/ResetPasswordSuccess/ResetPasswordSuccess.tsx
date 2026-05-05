'use client'

import { useRouter } from 'next/navigation'

export default function ResetPasswordSuccess() {
  const router = useRouter()

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
          <h1 className="text-[18px] font-semibold text-primary">Password reset!</h1>
          <p className="text-[13px] text-secondary leading-relaxed">You can now login with your new password</p>
          <button onClick={() => router.replace('/login/employee')} className="w-full bg-accent cursor-pointer text-white font-semibold text-[13.5px] rounded-lg py-[11px] hover:bg-accent-mid transition-colors mt-2">
            ← Sign in with your new password
          </button>
        </div>
      </div>
    </div>
  )
}
