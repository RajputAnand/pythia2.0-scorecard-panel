'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { fakeValidateKey, fakeResetPassword } from '@/mock/authAPIs'
import type { ResetPasswordResult } from '@/types/auth'

type Phase = 'validating' | 'invalid' | 'form'

export default function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [key, setKey] = useState('')
  const [phase, setPhase] = useState<Phase>('validating')
  const [invalidMessage, setInvalidMessage] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)


  // ── Extract key from query string & validate it ──
  useEffect(() => {
    const keyParam = searchParams.get('key') ?? ''
    setKey(keyParam)

    if (!keyParam) {
      setInvalidMessage('Reset link is invalid or missing.')
      setPhase('invalid')
      return
    }

    let cancelled = false
    fakeValidateKey(keyParam).then((res) => {
      if (cancelled) return
      if (res.valid) {
        setPhase('form')
      } else {
        setInvalidMessage(res.message)
        setPhase('invalid')
      }
    })

    return () => { cancelled = true }
  }, [searchParams])

  // ── Submit reset ──
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setFormError('')

      if (password.length < 6) {
        setFormError('Password must be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.')
        return
      }
      if (pending) return

      setPending(true)
      try {
        const res = await fakeResetPassword(key, password, confirmPassword)
        if (res.success) {
          router.replace(`/reset-password/success`)
        } else {
          router.replace(`/reset-password/error?message=${encodeURIComponent(res.message)}`)
        }
      } catch {
        router.replace(`/reset-password/error?message=${encodeURIComponent('Something went wrong. Please try again later.')}`)
      } finally {
        setPending(false)
      }
    },
    [password, confirmPassword, pending, key],
  )

  /* ── Validating key ── */
  if (phase === 'validating') {
    return (
      <div className="w-full max-w-[420px]">
        <div className="bg-surface border border-border rounded-2xl shadow-sm px-8 py-9">
          <div className="flex flex-col gap-5">
            <div className="h-4 rounded bg-border animate-[pulse_1.4s_ease-in-out_infinite]" style={{ width: '60%' }} />
            <div className="h-4 rounded bg-border animate-[pulse_1.4s_ease-in-out_infinite]" style={{ width: '100%' }} />
            <div className="h-4 rounded bg-border animate-[pulse_1.4s_ease-in-out_infinite]" style={{ width: '100%' }} />
            <div className="h-4 rounded bg-border animate-[pulse_1.4s_ease-in-out_infinite]" style={{ width: '45%' }} />
          </div>
        </div>
      </div>
    )
  }

  /* ── Invalid key ── */
  if (phase === 'invalid') {
    return (
      <div className="w-full max-w-[420px]">
        <div className="bg-surface border border-border rounded-2xl shadow-sm px-8 py-9">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-danger-light">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="var(--color-danger)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-[18px] font-semibold text-primary">Invalid reset link</h1>
            <p className="text-[13px] text-secondary leading-relaxed">{invalidMessage}</p>
            {/* <button onClick={() => router.push('/forgot-password')} className="w-full bg-accent cursor-pointer text-white font-semibold text-[13.5px] rounded-lg py-[11px] hover:bg-accent-mid transition-colors mt-2">
              Request a new link
            </button> */}
            <button onClick={() => router.push('/login/employee')} className="w-full bg-surface cursor-pointer border border-border text-secondary font-semibold text-[13.5px] rounded-lg py-[11px] hover:bg-surface-alt transition-colors mt-2">
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    )
  }



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
          <h1 className="text-[20px] font-semibold text-primary leading-tight">Reset your password</h1>
          <p className="text-secondary text-[13px] mt-1">Enter a new password for your account.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="reset-password" className="text-[12px] font-medium text-secondary uppercase tracking-[.07em]">
              New Password
            </label>
            <input
              id="reset-password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-lg px-3 py-[10px] text-[13.5px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>

          <div className="flex flex-col gap-[6px]">
            <label htmlFor="reset-confirm-password" className="text-[12px] font-medium text-secondary uppercase tracking-[.07em]">
              Confirm Password
            </label>
            <input
              id="reset-confirm-password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-lg px-3 py-[10px] text-[13.5px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>

          {formError && <p className="text-[12.5px] text-danger">{formError}</p>}

          <button type="submit" disabled={pending} className="mt-1 w-full bg-accent text-white font-semibold text-[13.5px] rounded-lg py-[11px] hover:bg-accent-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-[spin_0.6s_linear_infinite] inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Resetting…
              </span>
            ) : (
              'Reset password'
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
