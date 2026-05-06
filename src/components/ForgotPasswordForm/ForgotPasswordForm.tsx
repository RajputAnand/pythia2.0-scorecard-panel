'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { fakeForgotPassword } from '@/mock/authAPIs'
import { forgotPasswordSchema, type ForgotPasswordSchema } from '@/schemas/auth'
import DynamicForm from '@/components/shared/DynamicForm/DynamicForm'
import type { FormField } from '@/types/dynamic-form'

export default function ForgotPasswordForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()

  const fields: FormField[] = [
    {
      id: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'you@company.com',
    },
  ]

  const handleSubmit = useCallback(
    (values: ForgotPasswordSchema) => {
      setServerError(undefined)

      startTransition(async () => {
        try {
          const res = await fakeForgotPassword(values.email.trim())
          if (res.success) {
            router.replace(`/forgot-password/success`)
          } else {
            router.replace(`/forgot-password/error?message=${encodeURIComponent(res.message)}`)
          }
        } catch {
          router.replace(`/forgot-password/error`)
        }
      })
    },
    [router],
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
        <DynamicForm
          fields={fields}
          zodSchema={forgotPasswordSchema}
          onSubmit={handleSubmit}
          submitLabel="Send reset link"
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
