import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type {
  ApiScheduleResponse,
  ApiRosterMember,
  ApiTrafficHeatmap,
  ApiInsights,
  ApiRecommendationsResponse,
} from '@/types/staff'

const MOCK_ROSTER: ApiRosterMember[] = [
  {
    employee_id: 'EMP-101',
    first_name: 'Marcus',
    last_name: 'Rivera',
    score: 88,
    score_tier: 'high',
  },
  {
    employee_id: 'EMP-102',
    first_name: 'Jessica',
    last_name: 'Chen',
    score: 92,
    score_tier: 'high',
  },
]

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
  if (token.includes('mock')) {
    return {
      store_id: storeId,
      week_start_date: weekStartDate,
      week_end_date: weekStartDate,
      total_shifts: 0,
      by_employee: {},
      shifts: [],
    }
  }
  try {
    const { data } = await pythia2Client.get<ApiScheduleResponse & { success: boolean }>(
      PYTHIA_2_API.staffing.schedule,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { store_id: storeId, week_start_date: weekStartDate },
        signal,
      }
    )
    return data
  } catch {
    return {
      store_id: storeId,
      week_start_date: weekStartDate,
      week_end_date: weekStartDate,
      total_shifts: 0,
      by_employee: {},
      shifts: [],
    }
  }
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
  if (token.includes('mock')) {
    return { success: true, shift_id: `shift_${Date.now()}` }
  }
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
  if (token.includes('mock')) {
    return { success: true, shift_id: shiftId }
  }
  const { data } = await pythia2Client.put(PYTHIA_2_API.staffing.scheduleEntry(shiftId), body, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export async function deleteStaffingShift({ token, shiftId }: { token: string; shiftId: string }) {
  if (token.includes('mock')) {
    return { success: true }
  }
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
  if (token.includes('mock')) {
    return { success: true, job_id: `job_${Date.now()}` }
  }
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
  if (token.includes('mock')) {
    return { success: true, published_at: new Date().toISOString() }
  }
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
  if (token.includes('mock')) {
    return MOCK_ROSTER
  }
  try {
    const { data } = await pythia2Client.get<{ success: boolean; store_id: string; employees: ApiRosterMember[] }>(
      PYTHIA_2_API.staffing.roster,
      { headers: { Authorization: `Bearer ${token}` }, params: { store_id: storeId }, signal }
    )
    return data.employees || []
  } catch {
    return MOCK_ROSTER
  }
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
  if (token.includes('mock')) {
    return {
      store_id: storeId,
      week_start_date: weekStartDate,
      week_end_date: weekStartDate,
      days: [],
    }
  }
  try {
    const { data } = await pythia2Client.get<ApiTrafficHeatmap & { success: boolean }>(
      PYTHIA_2_API.staffing.trafficHeatmap,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { store_id: storeId, week_start_date: weekStartDate },
        signal,
      }
    )
    return data
  } catch {
    return {
      store_id: storeId,
      week_start_date: weekStartDate,
      week_end_date: weekStartDate,
      days: [],
    }
  }
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
  if (token.includes('mock')) {
    return {
      coverage_gaps: 0,
      coverage_gaps_sub_bold: '0 gaps',
      coverage_gaps_sub: 'across peak hours',
      fatigue_flags: 0,
      fatigue_flags_sub_bold: '0 flags',
      fatigue_flags_sub: 'overtime avoided',
      weak_pairings: 0,
      weak_pairings_sub_bold: '0 weak',
      weak_pairings_sub: 'optimal balance',
      optimized_shifts: 0,
      optimized_shifts_sub_bold: '0 shifts',
      optimized_shifts_sub: 'scheduled',
    }
  }
  try {
    const { data } = await pythia2Client.get<ApiInsights & { success: boolean }>(PYTHIA_2_API.staffing.insights, {
      headers: { Authorization: `Bearer ${token}` },
      params: { store_id: storeId, week_start_date: weekStartDate },
      signal,
    })
    return data
  } catch {
    return {
      coverage_gaps: 0,
      coverage_gaps_sub_bold: '0 gaps',
      coverage_gaps_sub: 'across peak hours',
      fatigue_flags: 0,
      fatigue_flags_sub_bold: '0 flags',
      fatigue_flags_sub: 'overtime avoided',
      weak_pairings: 0,
      weak_pairings_sub_bold: '0 weak',
      weak_pairings_sub: 'optimal balance',
      optimized_shifts: 0,
      optimized_shifts_sub_bold: '0 shifts',
      optimized_shifts_sub: 'scheduled',
    }
  }
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
  if (token.includes('mock')) {
    return {
      store_id: storeId,
      week_start_date: weekStartDate,
      generation_status: 'idle',
      generated_at: null,
      critical_alert: null,
      recommendations: [],
    }
  }
  try {
    const { data } = await pythia2Client.get<ApiRecommendationsResponse & { success: boolean }>(
      PYTHIA_2_API.staffing.recommendations,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { store_id: storeId, week_start_date: weekStartDate },
        signal,
      }
    )
    return data
  } catch {
    return {
      store_id: storeId,
      week_start_date: weekStartDate,
      generation_status: 'idle',
      generated_at: null,
      critical_alert: null,
      recommendations: [],
    }
  }
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
  if (token.includes('mock')) {
    return { success: true, job_id: `rec_${Date.now()}` }
  }
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
  if (token.includes('mock')) {
    return {
      recommendation: {
        id: recommendationId,
        type: 'coverage_gap',
        type_label: 'Coverage Gap',
        text: 'Mock recommendation applied',
        detail: 'Applied in mock environment',
        severity: 'warning',
        target: {},
        status: 'applied',
        created_at: new Date().toISOString(),
      },
      scheduled_shift: null,
    }
  }
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
  if (token.includes('mock')) {
    return {
      id: recommendationId,
      type: 'coverage_gap',
      type_label: 'Coverage Gap',
      text: 'Mock recommendation dismissed',
      detail: reason || 'Dismissed in mock environment',
      severity: 'warning',
      target: {},
      status: 'dismissed',
      created_at: new Date().toISOString(),
    }
  }
  const { data } = await pythia2Client.post<{ success: boolean; recommendation: import('@/types/staff').ApiRecommendation }>(
    PYTHIA_2_API.staffing.recommendationDismiss(recommendationId),
    { store_id: storeId, week_start_date: weekStartDate, reason: reason ?? '' },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return data.recommendation
}
