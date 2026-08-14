import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type {
  ApiScheduleResponse,
  ApiRosterMember,
  ApiTrafficHeatmap,
  ApiInsights,
  ApiRecommendationsResponse,
} from '@/types/staff'

// Raw response shapes from app/routers/staffing.py — flat {success, ...fields}
// dicts, not the ApiResponseV2<T> envelope. Same pattern as manager-dashboard.ts.

export interface FetchStaffingScheduleParams {
  token: string
  storeId: string
  weekStartDate: string
  signal?: AbortSignal
}

export async function fetchStaffingSchedule({
  token,
  storeId,
  weekStartDate,
  signal,
}: FetchStaffingScheduleParams): Promise<ApiScheduleResponse> {
  const { data } = await pythia2Client.get<ApiScheduleResponse & { success: boolean }>(
    PYTHIA_2_API.staffing.schedule,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { store_id: storeId, week_start_date: weekStartDate },
      signal,
    }
  )
  return data
}

export interface CreateStaffingShiftBody {
  store_id: string
  employee_id: string
  date: string
  day_part: string
  paired_with?: string | null
}

export async function createStaffingShift({
  token,
  body,
}: {
  token: string
  body: CreateStaffingShiftBody
}) {
  const { data } = await pythia2Client.post(PYTHIA_2_API.staffing.schedule, body, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export interface UpdateStaffingShiftBody {
  employee_id?: string
  day_part?: string
  date?: string
  status?: string
  paired_with?: string | null
}

export async function updateStaffingShift({
  token,
  shiftId,
  body,
}: {
  token: string
  shiftId: string
  body: UpdateStaffingShiftBody
}) {
  const { data } = await pythia2Client.put(PYTHIA_2_API.staffing.scheduleEntry(shiftId), body, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export async function deleteStaffingShift({ token, shiftId }: { token: string; shiftId: string }) {
  const { data } = await pythia2Client.delete(PYTHIA_2_API.staffing.scheduleEntry(shiftId), {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export async function generateStaffingSchedule({
  token,
  storeId,
  weekStartDate,
}: {
  token: string
  storeId: string
  weekStartDate: string
}) {
  const { data } = await pythia2Client.post(
    PYTHIA_2_API.staffing.scheduleGenerate,
    { store_id: storeId, week_start_date: weekStartDate },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return data
}

export async function publishStaffingSchedule({
  token,
  storeId,
  weekStartDate,
}: {
  token: string
  storeId: string
  weekStartDate: string
}) {
  const { data } = await pythia2Client.post(
    PYTHIA_2_API.staffing.schedulePublish,
    { store_id: storeId, week_start_date: weekStartDate },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return data
}

export async function fetchStaffingRoster({
  token,
  storeId,
  signal,
}: {
  token: string
  storeId: string
  signal?: AbortSignal
}): Promise<ApiRosterMember[]> {
  const { data } = await pythia2Client.get<{ success: boolean; store_id: string; employees: ApiRosterMember[] }>(
    PYTHIA_2_API.staffing.roster,
    { headers: { Authorization: `Bearer ${token}` }, params: { store_id: storeId }, signal }
  )
  return data.employees
}

export async function fetchStaffingHeatmap({
  token,
  storeId,
  weekStartDate,
  signal,
}: {
  token: string
  storeId: string
  weekStartDate: string
  signal?: AbortSignal
}): Promise<ApiTrafficHeatmap> {
  const { data } = await pythia2Client.get<ApiTrafficHeatmap & { success: boolean }>(
    PYTHIA_2_API.staffing.trafficHeatmap,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { store_id: storeId, week_start_date: weekStartDate },
      signal,
    }
  )
  return data
}

export async function fetchStaffingInsights({
  token,
  storeId,
  weekStartDate,
  signal,
}: {
  token: string
  storeId: string
  weekStartDate: string
  signal?: AbortSignal
}): Promise<ApiInsights> {
  const { data } = await pythia2Client.get<ApiInsights & { success: boolean }>(PYTHIA_2_API.staffing.insights, {
    headers: { Authorization: `Bearer ${token}` },
    params: { store_id: storeId, week_start_date: weekStartDate },
    signal,
  })
  return data
}

export async function fetchStaffingRecommendations({
  token,
  storeId,
  weekStartDate,
  signal,
}: {
  token: string
  storeId: string
  weekStartDate: string
  signal?: AbortSignal
}): Promise<ApiRecommendationsResponse> {
  const { data } = await pythia2Client.get<ApiRecommendationsResponse & { success: boolean }>(
    PYTHIA_2_API.staffing.recommendations,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { store_id: storeId, week_start_date: weekStartDate },
      signal,
    }
  )
  return data
}

export async function generateStaffingRecommendations({
  token,
  storeId,
  weekStartDate,
}: {
  token: string
  storeId: string
  weekStartDate: string
}) {
  const { data } = await pythia2Client.post(
    PYTHIA_2_API.staffing.recommendationsGenerate,
    { store_id: storeId, week_start_date: weekStartDate },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return data
}

export interface ApplyStaffingRecommendationResult {
  recommendation: import('@/types/staff').ApiRecommendation
  scheduled_shift: Record<string, unknown> | null
}

export async function applyStaffingRecommendation({
  token,
  recommendationId,
  storeId,
  weekStartDate,
}: {
  token: string
  recommendationId: string
  storeId: string
  weekStartDate: string
}): Promise<ApplyStaffingRecommendationResult> {
  const { data } = await pythia2Client.post<ApplyStaffingRecommendationResult & { success: boolean }>(
    PYTHIA_2_API.staffing.recommendationApply(recommendationId),
    { store_id: storeId, week_start_date: weekStartDate },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return data
}

export async function dismissStaffingRecommendation({
  token,
  recommendationId,
  storeId,
  weekStartDate,
  reason,
}: {
  token: string
  recommendationId: string
  storeId: string
  weekStartDate: string
  reason?: string
}): Promise<import('@/types/staff').ApiRecommendation> {
  const { data } = await pythia2Client.post<{ success: boolean; recommendation: import('@/types/staff').ApiRecommendation }>(
    PYTHIA_2_API.staffing.recommendationDismiss(recommendationId),
    { store_id: storeId, week_start_date: weekStartDate, reason: reason ?? '' },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return data.recommendation
}
