'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginTenant } from '@/actions/auth'
import { tenantLoginSchema, type TenantLoginSchema } from '@/schemas/tenant'
import DynamicForm from '@/components/shared/DynamicForm/DynamicForm'
import type { FormField } from '@/types/dynamic-form'
import { getSafeRedirect } from '@/utils/routes'
import type { UserRole } from '@/types/user'

const ROLE_TABS: Array<{ id: UserRole; label: string; color: string }> = [
  { id: 'employee', label: 'Employee', color: 'from-blue-500 to-blue-600' },
  { id: 'manager', label: 'Manager', color: 'from-purple-500 to-purple-600' },
  { id: 'owner', label: 'Owner', color: 'from-green-500 to-green-600' },
  { id: 'superadmin', label: 'Super Admin', color: 'from-slate-700 to-slate-900' },
]

const DEMO_TENANTS = [
  { code: 'lionmart', label: 'Lionmart' },
  { code: 'star-coffee', label: 'Star Coffee' },
  { code: 'apex-retail', label: 'Apex Supermarkets' },
]

const DEMO_TENANT_CREDS: Record<string, Record<UserRole, { email: string; password: string }>> = {
  lionmart: {
    employee: { email: 'marcus.4821', password: 'demo1234' },
    manager: { email: 'manager@demo.com', password: 'demo1234' },
    owner: { email: 'owner@demo.com', password: 'demo1234' },
    superadmin: { email: 'superadmin@demo.com', password: 'demo1234' },
  },
  'star-coffee': {
    employee: { email: 'elena.101', password: 'demo1234' },
    manager: { email: 'manager@starcoffee.com', password: 'demo1234' },
    owner: { email: 'owner@starcoffee.com', password: 'demo1234' },
    superadmin: { email: 'superadmin@demo.com', password: 'demo1234' },
  },
  'apex-retail': {
    employee: { email: 'marcus.201', password: 'demo1234' },
    manager: { email: 'manager@apexretail.com', password: 'demo1234' },
    owner: { email: 'owner@apexretail.com', password: 'demo1234' },
    superadmin: { email: 'superadmin@demo.com', password: 'demo1234' },
  },
}

export default function TenantLoginForm() {
  const [serverError, setServerError] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()

  const initialOrg =
    searchParams.get('org') ||
    searchParams.get('orgId') ||
    searchParams.get('tenant') ||
    searchParams.get('tenantId') ||
    searchParams.get('organizationId') ||
    ''

  const initialRoleParam = (searchParams.get('role') as UserRole) || 'owner'
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    ['employee', 'manager', 'owner', 'superadmin'].includes(initialRoleParam) ? initialRoleParam : 'owner'
  )
  const [orgId, setOrgId] = useState(initialOrg)
  const [email, setEmail] = useState(() => {
    if (initialOrg && DEMO_TENANT_CREDS[initialOrg]?.[selectedRole]) {
      return DEMO_TENANT_CREDS[initialOrg][selectedRole].email
    }
    return ''
  })
  const [password, setPassword] = useState(() => {
    if (initialOrg && DEMO_TENANT_CREDS[initialOrg]?.[selectedRole]) {
      return DEMO_TENANT_CREDS[initialOrg][selectedRole].password
    }
    return ''
  })

  const redirectTo = searchParams.get('redirectTo')

  useEffect(() => {
    if (initialOrg) {
      setOrgId(initialOrg)
      const creds = DEMO_TENANT_CREDS[initialOrg]?.[selectedRole]
      if (creds) {
        setEmail(creds.email)
        setPassword(creds.password)
      }
    }
  }, [initialOrg, selectedRole])

  function handleSelectDemoTenant(code: string) {
    setOrgId(code)
    const creds = DEMO_TENANT_CREDS[code]?.[selectedRole]
    if (creds) {
      setEmail(creds.email)
      setPassword(creds.password)
    }
  }

  function handleRoleChange(role: UserRole) {
    setSelectedRole(role)
    if (orgId && DEMO_TENANT_CREDS[orgId]?.[role]) {
      setEmail(DEMO_TENANT_CREDS[orgId][role].email)
      setPassword(DEMO_TENANT_CREDS[orgId][role].password)
    }
  }

  const fields: FormField[] = [
    {
      id: 'orgId',
      type: 'text',
      label: 'Organization ID / Slug',
      placeholder: 'e.g. lionmart, star-coffee',
      defaultValue: orgId || undefined,
    },
    {
      id: 'email',
      type: 'text',
      label: 'Username or Email',
      placeholder: selectedRole === 'employee' ? 'marcus.4821 or you@company.com' : 'you@company.com',
      defaultValue: email || undefined,
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
      defaultValue: password || undefined,
    },
  ]

  const handleSubmit = (values: TenantLoginSchema) => {
    setServerError(undefined)

    const formData = new FormData()
    formData.set('orgId', values.orgId || orgId)
    formData.set('email', values.email || email)
    formData.set('password', values.password || password)
    formData.set('role', selectedRole)

    startTransition(async () => {
      const result = await loginTenant(undefined, formData)

      if (result === null) {
        window.location.href = getSafeRedirect(redirectTo, selectedRole)
      } else if (typeof result === 'string') {
        setServerError(result)
      }
    })
  }

  const activeTab = ROLE_TABS.find((t) => t.id === selectedRole) || ROLE_TABS[0]

  return (
    <div className="w-full max-w-[460px]">
      <div className="bg-surface border border-border rounded-2xl shadow-sm px-8 py-9">
        {/* Logo & Header */}
        <div className="flex items-center gap-[10px] mb-6">
          <div className="flex items-center justify-center shrink-0 rounded-[9px] bg-primary w-8 h-8">
            <svg width="17" height="17" fill="white" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
              <path stroke="white" strokeWidth="1.5" d="M12 2v3M12 19v3M2 12h3M19 12h3" fill="none" />
            </svg>
          </div>
          <div>
            <div className="text-[13.5px] font-semibold">Pythia 2.0</div>
            <div className="text-[10px] text-muted mt-px">Multi-Tenant Portal</div>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-surface-alt border border-border rounded-full">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${activeTab.color}`} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
            {selectedRole} Portal
          </span>
        </div>

        {/* Heading */}
        <div className="mb-5">
          <h1 className="text-[20px] font-semibold text-primary leading-tight">Organization Sign In</h1>
          <p className="text-secondary text-[12.5px] mt-1">
            Sign in with your Organization ID and credentials to access your tenant workspace.
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="mb-5">
          <label className="text-[11px] font-medium text-secondary uppercase tracking-[.07em] block mb-2">
            Target Role
          </label>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-surface-alt rounded-lg border border-border">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleRoleChange(tab.id)}
                className={`py-1.5 px-2 text-[11px] font-semibold rounded-md transition-colors cursor-pointer capitalize ${
                  selectedRole === tab.id
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-secondary hover:text-primary hover:bg-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Organization Pills for Quick Testing */}
        <div className="mb-4 p-3 bg-surface-alt/60 border border-border rounded-xl">
          <div className="text-[11px] font-medium text-muted mb-1.5">Quick Demo Tenants:</div>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_TENANTS.map((demo) => (
              <button
                key={demo.code}
                type="button"
                onClick={() => handleSelectDemoTenant(demo.code)}
                className={`text-[11px] px-2.5 py-1 rounded-md border font-mono transition-colors cursor-pointer ${
                  orgId === demo.code
                    ? 'bg-accent-light border-accent text-accent font-semibold'
                    : 'bg-surface border-border text-secondary hover:text-primary'
                }`}
              >
                {demo.code}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Form */}
        <DynamicForm
          key={`${selectedRole}-${orgId}-${email}-${password}`}
          fields={fields}
          zodSchema={tenantLoginSchema}
          onSubmit={handleSubmit}
          submitLabel={`Sign in to ${orgId ? orgId : 'Organization'}`}
          loading={isPending}
          serverError={serverError}
        />

        {/* Footer info & link back to legacy login */}
        <div className="mt-6 pt-5 border-t border-border flex items-center justify-between text-[11.5px] text-muted">
          <span>Looking for single-tenant login?</span>
          <Link
            href="/login/employee"
            className="text-accent hover:text-accent-mid font-medium transition-colors"
          >
            Direct Login →
          </Link>
        </div>
      </div>
    </div>
  )
}
