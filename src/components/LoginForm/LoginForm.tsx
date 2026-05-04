'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/actions/auth'
import Link from 'next/link'
import { DEMO_USERS } from '@/lib/demo-user'

interface LoginFormProps {
  role: 'employee' | 'manager' | 'owner'
}

const roleConfig = {
  employee: {
    title: 'Employee Login',
    description: 'Sign in as an employee to access your dashboard',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
  },
  manager: {
    title: 'Manager Login',
    description: 'Sign in as a manager to access coaching tools',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
  },
  owner: {
    title: 'Owner Login',
    description: 'Sign in as an owner to access business insights',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
  },
}

export default function LoginForm({ role }: LoginFormProps) {
  const router = useRouter()
  const [result, action, pending] = useActionState(login, undefined)
  const config = roleConfig[role]
  const demoUser = DEMO_USERS.find((u) => u.role === role)

  // null = success; navigate to / so the proxy redirects to the role's default page
  useEffect(() => {
    if (result === null) router.push('/')
  }, [result, router])

  const error = typeof result === 'string' ? result : undefined

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

        {/* Demo Credentials Info */}
        {demoUser && (
          <div className="mb-6 p-3 bg-surface-alt border border-border rounded-lg">
            <p className="text-[11px] font-semibold text-secondary uppercase tracking-[.07em] mb-2">
              Demo Credentials
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-muted">Email:</span>
                <code className="text-[12px] font-mono text-primary bg-surface px-2 py-1 rounded border border-border">
                  {demoUser.email}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-muted">Password:</span>
                <code className="text-[12px] font-mono text-primary bg-surface px-2 py-1 rounded border border-border">
                  {demoUser.password}
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form action={action} className="flex flex-col gap-4">
          {/* Hidden role input */}
          <input type="hidden" name="role" value={role} />

          <div className="flex flex-col gap-[6px]">
            <label className="text-[12px] font-medium text-secondary uppercase tracking-[.07em]">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@company.com"
              defaultValue={demoUser?.email || ''}
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
              defaultValue={demoUser?.password || ''}
              required
              className="w-full bg-surface-alt border border-border rounded-lg px-3 py-[10px] text-[13.5px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>

          {error && <p className="text-[12.5px] text-danger">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 w-full bg-accent text-white font-semibold text-[13.5px] rounded-lg py-[11px] hover:bg-accent-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? 'Signing in…' : 'Sign in as ' + role}
          </button>
        </form>

        {/* Switch Role Links */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-[12px] text-secondary text-center mb-3">Want to log in as a different role?</p>
          <div className="flex gap-2">
            {(['employee', 'manager', 'owner'] as const).map((r) => (
              <Link
                key={r}
                href={`/login/${r}`}
                className={`flex-1 px-2 py-2 text-[11px] font-semibold rounded-lg border transition-colors text-center capitalize ${
                  r === role
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
