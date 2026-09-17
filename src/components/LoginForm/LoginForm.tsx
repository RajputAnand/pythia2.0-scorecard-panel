'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login } from '@/actions/auth'
import { loginSchema, type LoginSchema } from '@/schemas/auth'
import DynamicForm from '@/components/shared/DynamicForm/DynamicForm'
import type { FormField } from '@/types/dynamic-form'
import { getSafeRedirect } from '@/utils/routes'
import type { UserRole } from '@/types/user'

interface LoginFormProps {
  role?: UserRole
}

export default function LoginForm({ role }: LoginFormProps) {
  const [serverError, setServerError] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const schema = loginSchema

  // Field config for DynamicForm
  const fields: FormField[] = [
    {
      id: 'email',
      type: 'text',
      label: 'Email or User ID',
      placeholder: 'you@company.com or user ID',
    },
    {
      id: 'password',
      type: 'password',
      label: 'Password',
      labelSiblings: [
        <Link
          key="forgot"
          href="/forgot-password"
          className="text-[11.5px] text-accent hover:text-accent-mid transition-colors"
        >
          Forgot password?
        </Link>,
      ],
      placeholder: '••••••••',
    },
  ]

  const handleSubmit = (values: LoginSchema) => {
    setServerError(undefined)

    const formData = new FormData()
    formData.set('email', values.email)
    formData.set('password', values.password)
    if (role) {
      formData.set('role', role)
    }

    startTransition(async () => {
      const result = await login(undefined, formData)

      if (result.success && result.role) {
        window.location.href = getSafeRedirect(redirectTo, result.role)
      } else if (result.error) {
        setServerError(result.error)
      }
    })
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="bg-surface border border-border rounded-2xl shadow-sm px-8 py-9">
        {/* Logo & Multi-Tenant Link */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-[10px]">
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
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-[20px] font-semibold text-primary leading-tight">Sign In</h1>
          <p className="text-secondary text-[13px] mt-1">Enter your credentials to access your dashboard</p>
        </div>

        {/* Form — all state lives inside DynamicForm */}
        <DynamicForm
          fields={fields}
          zodSchema={schema}
          onSubmit={handleSubmit}
          submitLabel="Sign In"
          loading={isPending}
          serverError={serverError}
        />
      </div>
    </div>
  )
}
