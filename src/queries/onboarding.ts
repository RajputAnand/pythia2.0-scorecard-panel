// Onboarding wizard query helpers for Super Admin.
import {
  fakeGetTenant,
  fakeListStores,
  fakeListOwners,
  fakeUpdateTenantChecklist,
  fakeUpdateTenantStatus,
} from '@/mock/tenantAPIs'
import type { Tenant, TenantChecklist } from '@/types/tenant'
import type { OnboardingWizardState } from '@/types/onboarding'

export async function fetchOnboardingWizardState({
  tenantId,
}: {
  tenantId: string
  token?: string
}): Promise<OnboardingWizardState> {
  const [tenantRes, storesRes, ownersRes] = await Promise.all([
    fakeGetTenant(tenantId),
    fakeListStores({ tenantId, limit: 100 }),
    fakeListOwners({ tenantId, limit: 100 }),
  ])

  const tenant = tenantRes.data
  return {
    tenant,
    stores: storesRes.data,
    owners: ownersRes.data,
    step: tenant.currentOnboardingStep || 1,
    checklist: tenant.checklist,
  }
}

export async function updateOnboardingStep({
  tenantId,
  step,
  checklist,
}: {
  tenantId: string
  step: number
  checklist?: Partial<TenantChecklist>
  token?: string
}): Promise<Tenant> {
  const res = await fakeUpdateTenantChecklist(tenantId, checklist || {}, step)
  return res.data
}

export async function completeOnboarding({
  tenantId,
}: {
  tenantId: string
  token?: string
}): Promise<Tenant> {
  await fakeUpdateTenantChecklist(
    tenantId,
    {
      tenantDetailsCaptured: true,
      storesCreated: true,
      devicesPaired: true,
      ownerCreated: true,
      ownerActivated: true,
      managersCreated: true,
      employeesOnboarded: true,
      firstScoresReceived: true,
    },
    6
  )
  const res = await fakeUpdateTenantStatus(tenantId, 'active')
  return res.data
}

