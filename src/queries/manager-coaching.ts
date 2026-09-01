import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type {
  CoachingEffectivenessRow,
  CoachingEmployeeChip,
  CoachingEmployeeDetail,
  CoachingSummary,
  CoachingView,
  ManagerActionRequestBody,
  ManagerCoachingPlan,
  ManagerPlanStatus,
} from '@/types/coaching-plan'
import { PREVIEW_COACHING_SUMMARY } from '@/lib/kpi-preview-data'

interface ListSignalsResponse {
  success: boolean
  count: number
  signals: ManagerCoachingPlan[]
}

interface SignalResponse {
  success: boolean
  signal: ManagerCoachingPlan
}

export interface FetchManagerCoachingPlansParams {
  token: string
  employeeId?: string
  status?: ManagerPlanStatus | ManagerPlanStatus[]
}

export async function fetchManagerCoachingPlans({
  token,
  employeeId,
  status,
}: FetchManagerCoachingPlansParams): Promise<ManagerCoachingPlan[]> {
  if (token.includes('mock')) {
    return []
  }
  try {
    const { data } = await pythia2Client.get<ListSignalsResponse>(PYTHIA_2_API.managerCoaching.signals, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        employee_id: employeeId || undefined,
        status: Array.isArray(status) ? status.join(',') : status || undefined,
      },
    })
    return data.signals || []
  } catch {
    return []
  }
}

export interface ApplyManagerPlanActionParams {
  token: string
  planId: string
  body: ManagerActionRequestBody
}

export async function applyManagerPlanAction({
  token,
  planId,
  body,
}: ApplyManagerPlanActionParams): Promise<ManagerCoachingPlan> {
  if (token.includes('mock')) {
    return { plan_id: planId, ...body } as any
  }
  const { data } = await pythia2Client.patch<SignalResponse>(PYTHIA_2_API.managerCoaching.signal(planId), body, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data.signal
}

interface SummaryResponse extends CoachingSummary {
  success: boolean
}

interface EffectivenessResponse {
  success: boolean
  count: number
  categories: CoachingEffectivenessRow[]
}

interface EmployeesResponse {
  success: boolean
  count: number
  employees: CoachingEmployeeChip[]
}

interface EmployeeDetailResponse extends CoachingEmployeeDetail {
  success: boolean
}

export interface FetchCoachingViewParams {
  token: string
  view?: CoachingView
}

export async function fetchCoachingSummary({ token, view = 'month' }: FetchCoachingViewParams): Promise<CoachingSummary> {
  if (token.includes('mock')) {
    return PREVIEW_COACHING_SUMMARY
  }
  try {
    const { data } = await pythia2Client.get<SummaryResponse>(PYTHIA_2_API.managerCoaching.summary, {
      headers: { Authorization: `Bearer ${token}` },
      params: { view },
    })
    return data
  } catch {
    return PREVIEW_COACHING_SUMMARY
  }
}

export async function fetchCoachingEffectiveness({
  token,
  view = 'month',
}: FetchCoachingViewParams): Promise<CoachingEffectivenessRow[]> {
  if (token.includes('mock')) {
    return []
  }
  try {
    const { data } = await pythia2Client.get<EffectivenessResponse>(PYTHIA_2_API.managerCoaching.effectiveness, {
      headers: { Authorization: `Bearer ${token}` },
      params: { view },
    })
    return data.categories || []
  } catch {
    return []
  }
}

export async function fetchCoachingEmployees({ token }: { token: string }): Promise<CoachingEmployeeChip[]> {
  if (token.includes('mock')) {
    return []
  }
  try {
    const { data } = await pythia2Client.get<EmployeesResponse>(PYTHIA_2_API.managerCoaching.employees, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data.employees || []
  } catch {
    return []
  }
}

export interface FetchEmployeeCoachingDetailParams {
  token: string
  userId: string
  days?: number
}

export async function fetchEmployeeCoachingDetail({
  token,
  userId,
  days,
}: FetchEmployeeCoachingDetailParams): Promise<CoachingEmployeeDetail> {
  if (token.includes('mock')) {
    return {
      success: true,
      user_id: userId,
      name: 'Demo Employee',
      days_analyzed: days || 30,
      plans_total: 0,
      plans_resolved: 0,
      plans_in_progress: 0,
      plans_stalled: 0,
      areas: [],
    } as any
  }
  const { data } = await pythia2Client.get<EmployeeDetailResponse>(PYTHIA_2_API.managerCoaching.employeeDetail(userId), {
    headers: { Authorization: `Bearer ${token}` },
    params: { days: days ?? undefined },
  })
  return data
}
