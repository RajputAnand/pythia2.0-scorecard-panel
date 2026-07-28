'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { login } from '@/actions/auth'
import { loginSchema, employeeLoginSchema, type LoginSchema } from '@/schemas/auth'
import DynamicForm from '@/components/shared/DynamicForm/DynamicForm'
import type { FormField } from '@/types/dynamic-form'

interface LoginFormProps {
  role: 'employee' | 'manager' | 'owner'
}

const roleConfig = {
  employee: {
    title: 'Employee Login',
    description: 'Sign in as an employee to access your dashboard',
    color: 'from-blue-500 to-blue-600',
  },
  manager: {
    title: 'Manager Login',
    description: 'Sign in as a manager to access coaching tools',
    color: 'from-purple-500 to-purple-600',
  },
  owner: {
    title: 'Owner Login',
    description: 'Sign in as an owner to access business insights',
    color: 'from-green-500 to-green-600',
  },
}

export default function LoginForm({ role }: LoginFormProps) {
  const [serverError, setServerError] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()

  const config = roleConfig[role]
  const schema = role === 'employee' ? employeeLoginSchema : loginSchema

  // Field config for DynamicForm
  const fields: FormField[] = [
    {
      id: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'you@company.com',
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
    formData.set('role', role)

    startTransition(async () => {
      const result = await login(undefined, formData)


      if (result === null) {
        // Hard navigation: a soft router.push() leaves next-auth/react's
        // SessionProvider serving the previous (stale) session, since the
        // redirect:false signIn() only updates the cookie, not the client
        // session cache. A full navigation forces SessionProvider to remount
        // and read the freshly-set cookie.
        window.location.href = '/'
      } else if (typeof result === 'string') {
        setServerError(result)
      }
    })
  }

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

        {/* Role Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 bg-surface-alt border border-border rounded-full">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.color}`} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
            {role} Mode
          </span>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-[20px] font-semibold text-primary leading-tight">{config.title}</h1>
          <p className="text-secondary text-[13px] mt-1">{config.description}</p>
        </div>

        {/* Form — all state lives inside DynamicForm */}
        <DynamicForm
          fields={fields}
          zodSchema={schema}
          onSubmit={handleSubmit}
          submitLabel={`Sign in as ${role}`}
          loading={isPending}
          serverError={serverError}
        />

        {/* Switch Role Links */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-[12px] text-secondary text-center mb-3">Want to log in as a different role?</p>
          <div className="flex gap-2">
            {(['employee', 'manager', 'owner'] as const).map((r) => (
              <Link
                key={r}
                href={`/login/${r}`}
                className={`flex-1 px-2 py-2 text-[11px] font-semibold rounded-lg border transition-colors text-center capitalize ${r === role
                  ? 'bg-accent text-white border-accent'
                  : 'border-border text-secondary hover:bg-surface-alt'
                  }`}
              >
                {r}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
