import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ManagerActionRequestBody, ManagerCoachingPlan, ManagerPlanStatus } from '@/types/coaching-plan'

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
