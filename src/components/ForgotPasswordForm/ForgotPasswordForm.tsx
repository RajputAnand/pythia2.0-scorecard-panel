'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { fakeForgotPassword } from '@/mock/authAPIs'
import type { ForgotPasswordResult } from '@/types/auth'

type Phase = 'form'

export default function ForgotPasswordForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [phase, setPhase] = useState<Phase>('form')


  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!email.trim() || pending) return

      setPending(true)
      try {
        const res = await fakeForgotPassword(email.trim())
        if (res.success) {
          router.replace(`/forgot-password/success?message=${encodeURIComponent(res.message)}`)
        } else {
          router.replace(`/forgot-password/error?message=${encodeURIComponent(res.message)}`)
        }
      } catch {
        router.replace(`/forgot-password/error?message=${encodeURIComponent('Something went wrong. Please try again later.')}`)
      } finally {
        setPending(false)
      }
    },
    [email, pending],
  )



  /* ── Form ── */
  return (
    <div className="w-full max-w-[420px]">
      <div className="bg-surface border border-border rounded-2xl shadow-sm px-8 py-9">
        {/* Logo */}
        <div className="flex items-center gap-[10px] mb-7">
          <div className="flex items-center justify-center shrink-0 rounded-[9px] bg-primary w-8 h-8">
            <svg width="17" height="17" fill="white" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
              <path stroke="white" strokeWidth="1.5" d="M12 2v3M12 19v3M2 12h3M19 12h3" fill="none" />
            </svg>
          </div>
          <div>
            <div className="text-[13.5px] font-semibold">Pythia</div>
            <div className="text-[10px] text-muted mt-px">Scorecard</div>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-[20px] font-semibold text-primary leading-tight">Forgot password?</h1>
          <p className="text-secondary text-[13px] mt-1">
            Enter the email associated with your account and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="forgot-email" className="text-[12px] font-medium text-secondary uppercase tracking-[.07em]">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              placeholder="you@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-lg px-3 py-[10px] text-[13.5px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>

          <button type="submit" disabled={pending} className="mt-1 w-full bg-accent text-white font-semibold text-[13.5px] rounded-lg py-[11px] hover:bg-accent-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-[spin_0.6s_linear_infinite] inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Sending…
              </span>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>

        {/* Back link */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <button onClick={() => router.push('/login/employee')} className="w-full bg-surface border border-border text-secondary font-semibold text-[13.5px] rounded-lg py-[11px] hover:bg-surface-alt transition-colors">
            ← Back to login
          </button>
        </div>
      </div>
    </div>
  )
}
