'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { fakeValidateKey, fakeResetPassword } from '@/mock/authAPIs'
import { resetPasswordSchema, type ResetPasswordSchema } from '@/schemas/auth'
import DynamicForm from '@/components/shared/DynamicForm/DynamicForm'
import type { FormField } from '@/types/dynamic-form'

type Phase = 'validating' | 'invalid' | 'form'

export default function ResetPasswordForm() {
  const [serverError, setServerError] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [key, setKey] = useState('')
  const [phase, setPhase] = useState<Phase>('validating')
  const [invalidMessage, setInvalidMessage] = useState('')

  const fields: FormField[] = [
    {
      id: 'password',
      type: 'password',
      label: 'New Password',
      placeholder: '••••••••',
    },
    {
      id: 'confirmPassword',
      type: 'password',
      label: 'Confirm Password',
      placeholder: '••••••••',
    },
  ]


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
    (values: ResetPasswordSchema) => {
      setServerError(undefined)

      startTransition(async () => {
        try {
          const res = await fakeResetPassword(key, values.password, values.confirmPassword)
          if (res.success) {
            router.replace(`/reset-password/success`)
          } else {
            router.replace(`/reset-password/error?message=${encodeURIComponent(res.message)}`)
          }
        } catch {
          router.replace(`/reset-password/error?message=${encodeURIComponent('Something went wrong. Please try again later.')}`)
        }
      })
    },
    [key, router]
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
        <DynamicForm
          fields={fields}
          zodSchema={resetPasswordSchema}
          onSubmit={handleSubmit}
          submitLabel="Reset password"
          loading={isPending}
          serverError={serverError}
        />

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
