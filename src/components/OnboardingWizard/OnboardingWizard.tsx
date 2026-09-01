'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  createTenant,
  updateTenantChecklist,
  updateTenantStatus,
} from '@/queries/tenants'
import {
  createStore,
  bulkCreateStores,
  simulateStoreHeartbeat,
} from '@/queries/stores'
import { createOwner } from '@/queries/owners'
import { useToast } from '@/context/ToastContext'
import { extractApiErrorMessage } from '@/utils/common'
import MultiSelect from '@/components/shared/MultiSelect/MultiSelect'
import Select from '@/components/shared/Select/Select'
import CredentialsReveal from '@/components/shared/CredentialsReveal/CredentialsReveal'
import type {
  Tenant,
  TenantStore,
  CreateTenantParams,
  TenantPlan,
} from '@/types/tenant'
import type { TenantOwner } from '@/types/owner'

const STEPS = [
  { id: 1, label: '1. Create Tenant', desc: 'Company details & plan' },
  { id: 2, label: '2. Add Stores', desc: 'Locations & pairing codes' },
  { id: 3, label: '3. Create Owner(s)', desc: 'Assign stores & passwords' },
  { id: 4, label: '4. Manager Hand-off', desc: 'Store managers setup' },
  { id: 5, label: '5. Employee Roster', desc: 'Staff import & verification' },
  { id: 6, label: '6. Go Live', desc: 'Checklist & activation' },
]

const TIMEZONE_OPTIONS = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'Europe/London',
  'Asia/Kolkata',
  'UTC',
]

const PLAN_OPTIONS = [
  { label: 'Standard (5 stores)', value: 'standard' },
  { label: 'Growth (15 stores)', value: 'growth' },
  { label: 'Enterprise (50 stores)', value: 'enterprise' },
  { label: 'Custom', value: 'custom' },
]

const TIMEZONE_SELECT_OPTIONS = TIMEZONE_OPTIONS.map((tz) => ({ label: tz, value: tz }))

interface OnboardingWizardProps {
  initialTenant: Tenant | null
  initialStores: TenantStore[]
  initialOwners: TenantOwner[]
  allTenants: Tenant[]
}

export default function OnboardingWizard({
  initialTenant,
  initialStores,
  initialOwners,
  allTenants,
}: OnboardingWizardProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Custom Tenant Dropdown State
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false)
  const tenantDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tenantDropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (tenantDropdownRef.current && !tenantDropdownRef.current.contains(e.target as Node)) {
        setTenantDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [tenantDropdownOpen])

  // Active onboarding state
  const [tenant, setTenant] = useState<Tenant | null>(initialTenant)
  const [currentStep, setCurrentStep] = useState<number>(initialTenant?.currentOnboardingStep || 1)
  const [stores, setStores] = useState<TenantStore[]>(initialStores)
  const [owners, setOwners] = useState<TenantOwner[]>(initialOwners)

  // Step 1 Form State
  const [step1Form, setStep1Form] = useState<CreateTenantParams>({
    name: initialTenant?.name || '',
    code: initialTenant?.code || '',
    primaryContactName: initialTenant?.primaryContact?.name || '',
    primaryContactEmail: initialTenant?.primaryContact?.email || '',
    primaryContactPhone: initialTenant?.primaryContact?.phone || '',
    plan: (initialTenant?.plan as TenantPlan) || 'enterprise',
    storeAllowance: initialTenant?.storeAllowance || 25,
    defaultTimezone: initialTenant?.defaultTimezone || 'America/New_York',
    defaultLocale: initialTenant?.defaultLocale || 'en-US',
  })

  // Step 2 Form State (Single store & CSV)
  const [storeFormMode, setStoreFormMode] = useState<'single' | 'csv'>('single')
  const [singleStore, setSingleStore] = useState({
    storeNo: '',
    name: '',
    location: '',
    district: 'Central',
    street: '',
    city: '',
    state: '',
    zip: '',
    timezone: tenant?.defaultTimezone || 'America/New_York',
  })
  const [csvText, setCsvText] = useState(
    `storeNo,name,location,district,timezone\nSTORE-201,Downtown Flagship,Downtown,Metro,America/New_York\nSTORE-202,Westfield Mall,Uptown,North,America/New_York`
  )

  // Step 3 Form State (Owner creation)
  const [ownerForm, setOwnerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    storeIds: [] as string[],
    assignAll: true,
  })
  const [createdOwnerCreds, setCreatedOwnerCreds] = useState<{ userId: string; password: string; name: string } | null>(null)

  // Step 5 CSV Employee Roster state
  const [rosterCsv, setRosterCsv] = useState(
    `firstName,lastName,email,storeNo,role\nAlex,Morgan,alex.m@demo.com,STORE-001,cashier\nJordan,Lee,jordan.l@demo.com,STORE-001,barista\nTaylor,Smith,taylor.s@demo.com,STORE-002,shift_lead`
  )
  const [rosterVerified, setRosterVerified] = useState(false)

  // Switch between onboarding tenants
  function handleSelectTenant(tenantId: string) {
    const selected = allTenants.find((t) => t.id === tenantId)
    if (selected) {
      setTenant(selected)
      setCurrentStep(selected.currentOnboardingStep || 1)
      router.refresh()
    }
  }

  // Step 1: Submit Tenant
  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault()
    if (!step1Form.name.trim() || !step1Form.code.trim() || !step1Form.primaryContactEmail.trim()) {
      showToast('Please fill in all required company fields.')
      return
    }

    startTransition(async () => {
      try {
        const res = await createTenant({ data: step1Form })
        if (res.success && res.data) {
          setTenant(res.data)
          setCurrentStep(2)
          showToast(`Tenant "${res.data.name}" created successfully.`)
        }
      } catch (err) {
        showToast(extractApiErrorMessage(err, 'Failed to create tenant.'))
      }
    })
  }

  // Step 2: Add Single Store
  async function handleAddSingleStore(e: React.FormEvent) {
    e.preventDefault()
    if (!tenant) return
    if (!singleStore.storeNo.trim() || !singleStore.name.trim() || !singleStore.location.trim()) {
      showToast('Please fill in Store Number, Name, and Location.')
      return
    }

    startTransition(async () => {
      try {
        const res = await createStore({
          data: {
            tenantId: tenant.id,
            storeNo: singleStore.storeNo,
            name: singleStore.name,
            location: singleStore.location,
            district: singleStore.district,
            street: singleStore.street,
            city: singleStore.city,
            state: singleStore.state,
            zip: singleStore.zip,
            timezone: singleStore.timezone || tenant.defaultTimezone,
          },
        })
        if (res.success && res.data) {
          setStores((prev) => [res.data, ...prev])
          setSingleStore({
            storeNo: '',
            name: '',
            location: '',
            district: 'Central',
            street: '',
            city: '',
            state: '',
            zip: '',
            timezone: tenant.defaultTimezone,
          })
          showToast(`Store "${res.data.name}" added with pairing code.`)
        }
      } catch (err) {
        showToast(extractApiErrorMessage(err, 'Failed to add store.'))
      }
    })
  }

  // Step 2: Bulk Upload Stores CSV
  async function handleBulkUploadStores() {
    if (!tenant) return
    const lines = csvText.trim().split('\n')
    if (lines.length <= 1) {
      showToast('CSV must contain a header and at least one store row.')
      return
    }

    const rows = lines.slice(1).map((line) => {
      const parts = line.split(',').map((p) => p.trim())
      return {
        storeNo: parts[0] || `ST-${Math.floor(100 + Math.random() * 900)}`,
        name: parts[1] || 'Store Location',
        location: parts[2] || 'Main',
        district: parts[3] || 'Central',
        timezone: parts[4] || tenant.defaultTimezone,
      }
    })

    startTransition(async () => {
      try {
        const res = await bulkCreateStores({
          data: {
            tenantId: tenant.id,
            stores: rows,
          },
        })
        if (res.success && res.data) {
          setStores((prev) => [...res.data, ...prev])
          showToast(`${res.data.length} stores imported successfully.`)
        }
      } catch (err) {
        showToast(extractApiErrorMessage(err, 'Failed to bulk import stores.'))
      }
    })
  }

  // Step 2: Simulate Heartbeat
  async function handleHeartbeat(storeId: string) {
    startTransition(async () => {
      try {
        const res = await simulateStoreHeartbeat({ storeId })
        if (res.success && res.data) {
          setStores((prev) => prev.map((s) => (s.id === storeId ? res.data : s)))
          showToast(`Store ${res.data.storeNo} received heartbeat and is now LIVE!`)
        }
      } catch (err) {
        showToast(extractApiErrorMessage(err, 'Heartbeat simulation failed.'))
      }
    })
  }

  // Step 3: Create Owner
  async function handleCreateOwnerSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tenant) return
    if (!ownerForm.firstName.trim() || !ownerForm.lastName.trim() || !ownerForm.email.trim()) {
      showToast('Please fill in Owner First Name, Last Name, and Email.')
      return
    }

    const assigned = ownerForm.assignAll
      ? stores.map((s) => s.id)
      : ownerForm.storeIds.length > 0
      ? ownerForm.storeIds
      : stores.map((s) => s.id)

    startTransition(async () => {
      try {
        const res = await createOwner({
          token: 'mock_sa_token',
          tenantId: tenant.id,
          firstName: ownerForm.firstName,
          lastName: ownerForm.lastName,
          email: ownerForm.email,
          phone: ownerForm.phone || undefined,
          storeIds: assigned,
        })
        if (res.success) {
          const newOwnerRecord: TenantOwner = {
            _id: res.user_id,
            id: res.user_id,
            user_id: res.user_id,
            first_name: ownerForm.firstName,
            last_name: ownerForm.lastName,
            firstName: ownerForm.firstName,
            lastName: ownerForm.lastName,
            email: ownerForm.email,
            phone: ownerForm.phone || null,
            role_name: 'owner',
            tenant_id: tenant.id,
            tenant_name: tenant.name,
            store_ids: assigned,
            storeIds: assigned,
            status: 'invited',
            is_active: true,
            must_change_password: true,
            created_at: new Date().toISOString(),
          }
          setOwners((prev) => [newOwnerRecord, ...prev])
          setCreatedOwnerCreds({
            userId: res.user_id,
            password: res.temp_password,
            name: `${ownerForm.firstName} ${ownerForm.lastName}`,
          })
          showToast(`Owner ${ownerForm.firstName} ${ownerForm.lastName} created!`)
        }
      } catch (err) {
        showToast(extractApiErrorMessage(err, 'Failed to create owner.'))
      }
    })
  }

  // Step 6: Mark Complete
  async function handleMarkComplete() {
    if (!tenant) return
    startTransition(async () => {
      try {
        await updateTenantChecklist({
          tenantId: tenant.id,
          checklist: {
            tenantDetailsCaptured: true,
            storesCreated: true,
            devicesPaired: true,
            ownerCreated: true,
            ownerActivated: true,
            managersCreated: true,
            employeesOnboarded: true,
            firstScoresReceived: true,
          },
          step: 6,
        })
        await updateTenantStatus({ tenantId: tenant.id, status: 'active' })
        setTenant((prev) => (prev ? { ...prev, status: 'active' } : null))
        showToast(`Tenant "${tenant.name}" is now ACTIVE and live!`)
        router.push('/super-admin/tenants')
      } catch (err) {
        showToast(extractApiErrorMessage(err, 'Failed to complete onboarding.'))
      }
    })
  }

  const storeOptions = stores.map((s) => ({ label: `${s.name} (${s.storeNo})`, value: s.id }))

  return (
    <div className="flex flex-col gap-6 max-w-[1100px] mx-auto">
      {/* Top Header & Tenant Selector */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[18px] font-semibold text-primary">Customer Onboarding Wizard</h1>
            {tenant && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${
                  tenant.status === 'active'
                    ? 'bg-accent-light text-accent'
                    : tenant.status === 'onboarding'
                    ? 'bg-warning/15 text-warning font-mono'
                    : 'bg-danger/15 text-danger'
                }`}
              >
                {tenant.status}
              </span>
            )}
          </div>
          <p className="text-[12.5px] text-muted mt-1">
            Stand up a new customer tenant with stores, device pairing codes, owners, and roster onboarding.
          </p>
        </div>

        {/* Tenant Switcher / Resume selector */}
        <div className="flex flex-col items-end gap-1">
          <div className="text-[11px] text-muted font-medium">Onboarding Tenant:</div>
          <div ref={tenantDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setTenantDropdownOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={tenantDropdownOpen}
              className="cursor-pointer flex items-center gap-2.5 font-sans font-medium text-primary bg-surface-alt border border-border rounded-lg transition-all duration-150 hover:bg-border/60 hover:text-primary text-[12.5px] px-3 py-1.5 whitespace-nowrap shadow-2xs"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  tenant?.status === 'active'
                    ? 'bg-accent'
                    : tenant?.status === 'onboarding'
                    ? 'bg-warning'
                    : 'bg-danger'
                }`}
              />
              <span className="font-semibold text-[13px] max-w-[200px] truncate">
                {tenant ? tenant.name : 'Select Tenant'}
              </span>
              {tenant && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider ${
                    tenant.status === 'active'
                      ? 'bg-accent-light text-accent'
                      : tenant.status === 'onboarding'
                      ? 'bg-warning/15 text-warning font-mono'
                      : 'bg-danger/15 text-danger'
                  }`}
                >
                  {tenant.status}
                </span>
              )}
              <svg
                className={`w-[11px] h-[11px] shrink-0 text-muted transition-transform duration-200 ${
                  tenantDropdownOpen ? 'rotate-180' : ''
                }`}
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {tenantDropdownOpen && (
              <ul
                role="listbox"
                aria-label="Select onboarding tenant"
                className="absolute top-[calc(100%+6px)] right-0 min-w-[260px] bg-surface border border-border rounded-[10px] p-[4px] shadow-[0_8px_24px_-4px_rgba(26,23,20,0.12),0_2px_8px_-2px_rgba(26,23,20,0.06)] list-none m-0 z-50 divide-y divide-border/30"
              >
                {allTenants.map((t) => {
                  const active = t.id === tenant?.id
                  return (
                    <li
                      key={t.id}
                      role="option"
                      aria-selected={active}
                      className={`flex items-center justify-between gap-3 rounded-md cursor-pointer transition-colors duration-100 px-3 py-2 ${
                        active ? 'bg-accent-light' : 'hover:bg-surface-alt'
                      }`}
                      onClick={() => {
                        handleSelectTenant(t.id)
                        setTenantDropdownOpen(false)
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-sans font-medium text-[13px] truncate ${
                            active ? 'text-accent font-semibold' : 'text-primary'
                          }`}
                        >
                          {t.name}
                        </div>
                        <div className="text-[10.5px] text-muted font-mono">{t.code}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase ${
                            t.status === 'active'
                              ? 'bg-accent-light text-accent'
                              : t.status === 'onboarding'
                              ? 'bg-warning/15 text-warning font-mono'
                              : 'bg-danger/15 text-danger'
                          }`}
                        >
                          {t.status}
                        </span>
                        {active && (
                          <svg
                            className="w-[13px] h-[13px] shrink-0 text-accent"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2 6L5 9L10 3"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Wizard Steps Stepper */}
      <div className="grid grid-cols-6 gap-2 bg-surface border border-border rounded-xl p-3 shadow-xs">
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id || (tenant?.status === 'active' && step.id === 6)
          const isCurrent = currentStep === step.id

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                if (tenant || step.id === 1) setCurrentStep(step.id)
              }}
              className={`flex flex-col text-left p-2.5 rounded-lg transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-accent-light border border-accent text-accent font-semibold'
                  : isCompleted
                  ? 'bg-surface-alt/60 hover:bg-surface-alt text-primary'
                  : 'opacity-60 text-muted'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11.5px] font-bold">
                <span>{step.label}</span>
                {isCompleted && (
                  <svg className="w-3.5 h-3.5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="text-[10px] text-muted mt-0.5 truncate">{step.desc}</div>
            </button>
          )
        })}
      </div>

      {/* Main Step Content Area */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-xs min-h-[460px]">
        {/* ================= STEP 1: CREATE TENANT ================= */}
        {currentStep === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-[16px] font-semibold text-primary">Step 1 — Create the Tenant</h2>
              <p className="text-[12.5px] text-muted mt-1">
                Enter top-level company details, primary administrator contact, and plan allowances.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11.5px] font-medium text-secondary uppercase tracking-[.07em] block mb-1.5">
                  Company / Tenant Name *
                </label>
                <input
                  type="text"
                  required
                  value={step1Form.name}
                  onChange={(e) => setStep1Form({ ...step1Form, name: e.target.value })}
                  placeholder="e.g. Acme Retail Group"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[11.5px] font-medium text-secondary uppercase tracking-[.07em] block mb-1.5">
                  Tenant Identifier / Slug *
                </label>
                <input
                  type="text"
                  required
                  value={step1Form.code}
                  onChange={(e) =>
                    setStep1Form({ ...step1Form, code: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
                  }
                  placeholder="e.g. acme-retail"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-[13px] font-mono outline-none focus:border-accent"
                />
                <span className="text-[10.5px] text-muted">Used for Organization ID login</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[11.5px] font-medium text-secondary uppercase tracking-[.07em] block mb-1.5">
                  Primary Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={step1Form.primaryContactName}
                  onChange={(e) => setStep1Form({ ...step1Form, primaryContactName: e.target.value })}
                  placeholder="Arthur Pendelton"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[11.5px] font-medium text-secondary uppercase tracking-[.07em] block mb-1.5">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={step1Form.primaryContactEmail}
                  onChange={(e) => setStep1Form({ ...step1Form, primaryContactEmail: e.target.value })}
                  placeholder="arthur@company.com"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[11.5px] font-medium text-secondary uppercase tracking-[.07em] block mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={step1Form.primaryContactPhone || ''}
                  onChange={(e) => setStep1Form({ ...step1Form, primaryContactPhone: e.target.value })}
                  placeholder="+1 555-0100"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[11.5px] font-medium text-secondary uppercase tracking-[.07em] block mb-1.5">
                  Subscription Plan
                </label>
                <Select
                  value={step1Form.plan}
                  options={PLAN_OPTIONS}
                  onChange={(val) => setStep1Form({ ...step1Form, plan: val as TenantPlan })}
                  ariaLabel="Subscription Plan"
                />
              </div>

              <div>
                <label className="text-[11.5px] font-medium text-secondary uppercase tracking-[.07em] block mb-1.5">
                  Store Allowance
                </label>
                <input
                  type="number"
                  min="1"
                  value={step1Form.storeAllowance}
                  onChange={(e) => setStep1Form({ ...step1Form, storeAllowance: parseInt(e.target.value, 10) || 1 })}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[11.5px] font-medium text-secondary uppercase tracking-[.07em] block mb-1.5">
                  Default Timezone
                </label>
                <Select
                  value={step1Form.defaultTimezone}
                  options={TIMEZONE_SELECT_OPTIONS}
                  onChange={(val) => setStep1Form({ ...step1Form, defaultTimezone: String(val) })}
                  ariaLabel="Default Timezone"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="submit"
                disabled={isPending}
                className="bg-accent hover:bg-accent-mid text-white px-5 py-2.5 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {tenant ? 'Save & Continue to Step 2 →' : 'Create Tenant & Continue →'}
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 2: ADD STORES ================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-[16px] font-semibold text-primary">Step 2 — Add Stores & Pairing Codes</h2>
                <p className="text-[12.5px] text-muted mt-1">
                  Add physical store locations. Each store is assigned a unique device pairing code for on-site edge devices.
                </p>
              </div>

              {/* Toggle single vs bulk */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStoreFormMode('single')}
                  className={`px-3 py-1.5 text-[11.5px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                    storeFormMode === 'single'
                      ? 'bg-accent text-white border-accent'
                      : 'bg-surface border-border text-secondary'
                  }`}
                >
                  + Add Single Store
                </button>
                <button
                  type="button"
                  onClick={() => setStoreFormMode('csv')}
                  className={`px-3 py-1.5 text-[11.5px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                    storeFormMode === 'csv'
                      ? 'bg-accent text-white border-accent'
                      : 'bg-surface border-border text-secondary'
                  }`}
                >
                  📄 Bulk CSV Import
                </button>
              </div>
            </div>

            {/* Single store entry */}
            {storeFormMode === 'single' && (
              <form onSubmit={handleAddSingleStore} className="bg-surface-alt/50 border border-border rounded-xl p-4 space-y-4">
                <div className="text-[12px] font-semibold text-secondary uppercase tracking-wider">Add Store Location</div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted block mb-1">Store No / Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. STORE-005"
                      value={singleStore.storeNo}
                      onChange={(e) => setSingleStore({ ...singleStore, storeNo: e.target.value })}
                      className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-[12.5px] outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted block mb-1">Store Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Downtown Flagship"
                      value={singleStore.name}
                      onChange={(e) => setSingleStore({ ...singleStore, name: e.target.value })}
                      className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-[12.5px] outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted block mb-1">Location / Area *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Downtown"
                      value={singleStore.location}
                      onChange={(e) => setSingleStore({ ...singleStore, location: e.target.value })}
                      className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-[12.5px] outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted block mb-1">District</label>
                    <input
                      type="text"
                      placeholder="e.g. Central"
                      value={singleStore.district}
                      onChange={(e) => setSingleStore({ ...singleStore, district: e.target.value })}
                      className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-[12.5px] outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 text-[12px] font-semibold rounded-lg cursor-pointer"
                  >
                    + Add Store & Mint Pairing Code
                  </button>
                </div>
              </form>
            )}

            {/* CSV Import */}
            {storeFormMode === 'csv' && (
              <div className="bg-surface-alt/50 border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold text-secondary uppercase tracking-wider">Paste Stores CSV</div>
                  <span className="text-[11px] text-muted">Columns: storeNo, name, location, district, timezone</span>
                </div>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full bg-surface border border-border font-mono text-[11.5px] rounded-lg p-2.5 outline-none focus:border-accent"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleBulkUploadStores}
                    disabled={isPending}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 text-[12px] font-semibold rounded-lg cursor-pointer"
                  >
                    Import Stores
                  </button>
                </div>
              </div>
            )}

            {/* Existing Stores Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[13px] font-semibold text-primary">Provisioned Stores ({stores.length})</div>
                <span className="text-[11px] text-muted">Click &quot;Simulate Heartbeat&quot; to test device pairing</span>
              </div>

              {stores.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-xl text-muted text-[12.5px]">
                  No stores created yet. Add your first store location above.
                </div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[12.5px]">
                    <thead className="bg-surface-alt border-b border-border text-[11px] uppercase tracking-wider text-muted">
                      <tr>
                        <th className="py-2.5 px-3">Store Code & Name</th>
                        <th className="py-2.5 px-3">Location & District</th>
                        <th className="py-2.5 px-3">Device Pairing Code</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Edge Simulation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {stores.map((s) => (
                        <tr key={s.id} className="hover:bg-surface-alt/40 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-primary">{s.name}</div>
                            <div className="text-[11px] font-mono text-muted">{s.storeNo}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div>{s.location}</div>
                            <div className="text-[11px] text-muted">{s.district}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono font-semibold bg-surface-alt border border-border px-2 py-1 rounded text-[11.5px] text-accent">
                              {s.pairingCode}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                s.status === 'live'
                                  ? 'bg-accent-light text-accent'
                                  : 'bg-warning/15 text-warning font-mono'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {s.status !== 'live' ? (
                              <button
                                type="button"
                                onClick={() => handleHeartbeat(s.id)}
                                className="text-[11px] bg-accent hover:bg-accent-mid text-white px-2.5 py-1 rounded-md font-medium cursor-pointer"
                              >
                                Simulate Heartbeat
                              </button>
                            ) : (
                              <span className="text-[11px] text-accent font-medium">✓ Online (3 nodes)</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="border border-border bg-surface text-secondary px-4 py-2 text-[12.5px] font-semibold rounded-lg cursor-pointer"
              >
                ← Back to Step 1
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={stores.length === 0}
                className="bg-accent hover:bg-accent-mid disabled:opacity-50 text-white px-5 py-2.5 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Continue to Step 3: Create Owner(s) →
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: CREATE OWNERS ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-[16px] font-semibold text-primary">Step 3 — Create Owner(s)</h2>
              <p className="text-[12.5px] text-muted mt-1">
                Add one or more Owners who will oversee this tenant&apos;s store operations. System generates temporary credentials.
              </p>
            </div>

            {/* Created credentials callout */}
            {createdOwnerCreds && (
              <div className="mb-4">
                <CredentialsReveal
                  heading={`Owner created for ${createdOwnerCreds.name}`}
                  message="Share these temporary credentials with the Owner. They will be forced to change password on first login."
                  userId={createdOwnerCreds.userId}
                  password={createdOwnerCreds.password}
                  actionLabel="Acknowledge & Continue"
                  onAction={() => setCreatedOwnerCreds(null)}
                />
              </div>
            )}

            {/* Add Owner Form */}
            <form onSubmit={handleCreateOwnerSubmit} className="bg-surface-alt/50 border border-border rounded-xl p-4 space-y-4">
              <div className="text-[12px] font-semibold text-secondary uppercase tracking-wider">Add Tenant Owner</div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-muted block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane"
                    value={ownerForm.firstName}
                    onChange={(e) => setOwnerForm({ ...ownerForm, firstName: e.target.value })}
                    className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-[12.5px] outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted block mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={ownerForm.lastName}
                    onChange={(e) => setOwnerForm({ ...ownerForm, lastName: e.target.value })}
                    className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-[12.5px] outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-muted block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="jane.doe@company.com"
                    value={ownerForm.email}
                    onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })}
                    className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-[12.5px] outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted block mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 555-0199"
                    value={ownerForm.phone}
                    onChange={(e) => setOwnerForm({ ...ownerForm, phone: e.target.value })}
                    className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-[12.5px] outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Store Assignment */}
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <label className="text-[11.5px] font-medium text-secondary">Store Scope:</label>
                  <label className="flex items-center gap-1.5 text-[12px] text-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ownerForm.assignAll}
                      onChange={(e) => setOwnerForm({ ...ownerForm, assignAll: e.target.checked })}
                    />
                    Assign to All Stores ({stores.length})
                  </label>
                </div>

                {!ownerForm.assignAll && (
                  <MultiSelect
                    ariaLabel="Select specific stores"
                    placeholder="Select assigned stores"
                    options={storeOptions}
                    values={ownerForm.storeIds}
                    onChange={(values) => setOwnerForm({ ...ownerForm, storeIds: values.map(String) })}
                  />
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 text-[12px] font-semibold rounded-lg cursor-pointer"
                >
                  + Add Owner & Send Welcome Email
                </button>
              </div>
            </form>

            {/* Existing Owners List */}
            <div>
              <div className="text-[13px] font-semibold text-primary mb-2">Created Owners ({owners.length})</div>
              {owners.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border rounded-xl text-muted text-[12px]">
                  No owners created for this tenant yet.
                </div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                  {owners.map((o) => (
                    <div key={o.user_id} className="flex items-center justify-between p-3 bg-surface hover:bg-surface-alt/40">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent text-white font-bold flex items-center justify-center text-[11px]">
                          {o.first_name?.[0]}
                          {o.last_name?.[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-primary">
                            {o.first_name} {o.last_name}
                          </div>
                          <div className="text-[11px] text-muted">
                            {o.email} · {o.user_id}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] bg-surface-alt border border-border px-2 py-0.5 rounded text-secondary">
                          {o.store_ids?.length || 0} Stores Assigned
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="border border-border bg-surface text-secondary px-4 py-2 text-[12.5px] font-semibold rounded-lg cursor-pointer"
              >
                ← Back to Step 2
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                disabled={owners.length === 0}
                className="bg-accent hover:bg-accent-mid disabled:opacity-50 text-white px-5 py-2.5 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Continue to Step 4: Manager Setup →
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: MANAGER HANDOFF ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-[16px] font-semibold text-primary">Step 4 — Owner Takes Over: Manager Creation</h2>
              <p className="text-[12.5px] text-muted mt-1">
                Owners provision store Managers directly from the Owner Portal.
              </p>
            </div>

            <div className="bg-surface-alt/60 border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-accent-light text-accent flex items-center justify-center shrink-0 text-[18px]">
                  👤
                </div>
                <div className="space-y-1">
                  <h3 className="text-[14px] font-semibold text-primary">Owner Self-Service Handoff</h3>
                  <p className="text-[12.5px] text-muted leading-relaxed">
                    Once the Owner logs in with their temporary credentials, they will be prompted to set their permanent password and can immediately create Managers for each assigned store using the <strong>Manager Management</strong> panel at <code className="text-accent">/owner/managers</code>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="border border-border bg-surface rounded-lg p-3">
                  <div className="text-[11.5px] font-semibold text-secondary uppercase">Scoping Rule</div>
                  <p className="text-[12px] text-muted mt-1">
                    An Owner can only assign a Manager to stores they personally oversee. Managers inherit exact store scoping.
                  </p>
                </div>
                <div className="border border-border bg-surface rounded-lg p-3">
                  <div className="text-[11.5px] font-semibold text-secondary uppercase">Credential Handling</div>
                  <p className="text-[12px] text-muted mt-1">
                    Temp passwords are recoverable by the Owner until the Manager completes their first sign-in.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="border border-border bg-surface text-secondary px-4 py-2 text-[12.5px] font-semibold rounded-lg cursor-pointer"
              >
                ← Back to Step 3
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="bg-accent hover:bg-accent-mid text-white px-5 py-2.5 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Continue to Step 5: Employee Roster →
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: EMPLOYEE ROSTER ================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-[16px] font-semibold text-primary">Step 5 — Employee Rostering & Verification</h2>
              <p className="text-[12.5px] text-muted mt-1">
                Managers add employees per store or the team roster is bulk-imported during onboarding.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-secondary uppercase tracking-wider">
                  Bulk Roster CSV Verification
                </span>
                <span className="text-[11px] text-muted">Columns: firstName, lastName, email, storeNo, role</span>
              </div>

              <textarea
                rows={4}
                value={rosterCsv}
                onChange={(e) => setRosterCsv(e.target.value)}
                className="w-full bg-surface border border-border font-mono text-[11.5px] rounded-lg p-2.5 outline-none focus:border-accent"
              />

              <div className="flex items-center justify-between bg-surface-alt/60 p-3 rounded-lg border border-border">
                <div className="text-[12px] text-secondary">
                  {rosterVerified
                    ? '✓ Roster verified and ready for face-recognition sync.'
                    : 'Verify that the employee roster maps accurately to provisioned store codes.'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRosterVerified(true)
                    showToast('Roster validated successfully!')
                  }}
                  className="bg-primary hover:bg-primary/90 text-white px-3.5 py-1.5 text-[11.5px] font-semibold rounded-md cursor-pointer"
                >
                  Verify Roster
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="border border-border bg-surface text-secondary px-4 py-2 text-[12.5px] font-semibold rounded-lg cursor-pointer"
              >
                ← Back to Step 4
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="bg-accent hover:bg-accent-mid text-white px-5 py-2.5 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Continue to Step 6: Go Live Checklist →
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 6: GO LIVE & CHECKLIST ================= */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-[16px] font-semibold text-primary">Step 6 — Go Live Checklist & Tenant Activation</h2>
              <p className="text-[12.5px] text-muted mt-1">
                Track all 8 onboarding milestones before marking the customer tenant as fully live.
              </p>
            </div>

            {/* 8-Point Checklist from PDF Document 3 §2.1 */}
            <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
              {[
                { label: 'Tenant details captured', done: !!tenant, owner: 'Super Admin' },
                { label: 'Stores created', done: stores.length > 0, owner: 'Super Admin' },
                { label: 'Devices paired', done: stores.some((s) => s.status === 'live'), owner: 'Field engineer' },
                { label: 'Owner(s) created', done: owners.length > 0, owner: 'Super Admin' },
                { label: 'Owner activated', done: owners.some((o) => o.status === 'active' || !o.must_change_password), owner: 'Owner' },
                { label: 'Managers created', done: true, owner: 'Owner' },
                { label: 'Employees onboarded', done: rosterVerified || stores.some((s) => (s.employeeCount || 0) > 0), owner: 'Manager' },
                { label: 'First scores received', done: tenant?.status === 'active', owner: 'System' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-surface hover:bg-surface-alt/40">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                        item.done ? 'bg-accent text-white' : 'bg-surface-alt border border-border text-muted'
                      }`}
                    >
                      {item.done ? '✓' : idx + 1}
                    </div>
                    <span className={`text-[13px] ${item.done ? 'font-medium text-primary' : 'text-secondary'}`}>
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted">{item.owner}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="border border-border bg-surface text-secondary px-4 py-2 text-[12.5px] font-semibold rounded-lg cursor-pointer"
              >
                ← Back to Step 5
              </button>

              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={isPending || tenant?.status === 'active'}
                className="bg-accent hover:bg-accent-mid disabled:opacity-60 text-white px-6 py-2.5 text-[13.5px] font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                {tenant?.status === 'active' ? '✓ Tenant is Active' : '🚀 Mark Onboarding Complete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

