'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/actions/auth'

export default function LoginForm() {
  const router = useRouter()
  const [result, action, pending] = useActionState(login, undefined)

  // null = success; navigate to / so the proxy redirects to the role's default page
  useEffect(() => {
    if (result === null) router.push('/')
  }, [result, router])

  const error = typeof result === 'string' ? result : undefined

  return (
    <div className="w-full max-w-[380px] bg-surface border border-border rounded-2xl shadow-sm px-8 py-9">
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
        <h1 className="text-[20px] font-semibold text-primary leading-tight">Welcome back</h1>
        <p className="text-secondary text-[13px] mt-1">Sign in to your account to continue.</p>
      </div>

      {/* Form */}
      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-[6px]">
          <label className="text-[12px] font-medium text-secondary uppercase tracking-[.07em]">
            Email
          </label>
          <input
            name="email"
            type="email"
            placeholder="you@company.com"
            required
            className="w-full bg-surface-alt border border-border rounded-lg px-3 py-[10px] text-[13.5px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
          />
        </div>

        <div className="flex flex-col gap-[6px]">
          <label className="text-[12px] font-medium text-secondary uppercase tracking-[.07em]">
            Password
          </label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="w-full bg-surface-alt border border-border rounded-lg px-3 py-[10px] text-[13.5px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
          />
        </div>

        {error && (
          <p className="text-[12.5px] text-danger">{error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 w-full bg-accent text-white font-semibold text-[13.5px] rounded-lg py-[11px] hover:bg-accent-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
