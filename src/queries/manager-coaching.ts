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

// Raw response shapes from app/routers/manager_coaching.py — not the
// ApiResponseV2<T> envelope (no top-level `message`/`data`, just `signals`/`signal`).
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
  /** A single status, or a list — sent as a comma-separated `status` query param either way. */
  status?: ManagerPlanStatus | ManagerPlanStatus[]
}

export async function fetchManagerCoachingPlans({
  token,
  employeeId,
  status,
}: FetchManagerCoachingPlansParams): Promise<ManagerCoachingPlan[]> {
  const { data } = await pythia2Client.get<ListSignalsResponse>(PYTHIA_2_API.managerCoaching.signals, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      employee_id: employeeId || undefined,
      status: Array.isArray(status) ? status.join(',') : status || undefined,
    },
  })
  return data.signals
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
  const { data } = await pythia2Client.patch<SignalResponse>(PYTHIA_2_API.managerCoaching.signal(planId), body, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data.signal
}

// Raw response shapes for the Coaching Effectiveness Tracker endpoints —
// same non-enveloped `{success, ...}` shape as above, not ApiResponseV2<T>.
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

export async function fetchCoachingSummary({ token, view = 'week' }: FetchCoachingViewParams): Promise<CoachingSummary> {
  const { data } = await pythia2Client.get<SummaryResponse>(PYTHIA_2_API.managerCoaching.summary, {
    headers: { Authorization: `Bearer ${token}` },
    params: { view },
  })
  return data
}

export async function fetchCoachingEffectiveness({
  token,
  view = 'week',
}: FetchCoachingViewParams): Promise<CoachingEffectivenessRow[]> {
  const { data } = await pythia2Client.get<EffectivenessResponse>(PYTHIA_2_API.managerCoaching.effectiveness, {
    headers: { Authorization: `Bearer ${token}` },
    params: { view },
  })
  return data.categories
}

export async function fetchCoachingEmployees({ token }: { token: string }): Promise<CoachingEmployeeChip[]> {
  const { data } = await pythia2Client.get<EmployeesResponse>(PYTHIA_2_API.managerCoaching.employees, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data.employees
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
  const { data } = await pythia2Client.get<EmployeeDetailResponse>(PYTHIA_2_API.managerCoaching.employeeDetail(userId), {
    headers: { Authorization: `Bearer ${token}` },
    params: { days: days ?? undefined },
  })
  return data
}
