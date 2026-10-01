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
  { employee_id: 'EMP-103', first_name: 'Avery', last_name: 'Patel', score: 76, score_tier: 'mid' },
]

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

function mockShifts(storeId: string, weekStartDate: string) {
  return [
    { id: 'demo-shift-101', employee_id: 'EMP-101', employee_first_name: 'Marcus', employee_last_name: 'Rivera', employee_score: 88, employee_score_tier: 'high' as const, date: addDays(weekStartDate, 0), day_part: 'morning', status: 'scheduled', source: 'actual' as const, paired_with: 'EMP-102', flags: [] },
    { id: 'demo-shift-102', employee_id: 'EMP-102', employee_first_name: 'Jessica', employee_last_name: 'Chen', employee_score: 92, employee_score_tier: 'high' as const, date: addDays(weekStartDate, 1), day_part: 'afternoon', status: 'scheduled', source: 'suggested' as const, paired_with: null, flags: [{ type: 'coverage_gap' as const, severity: 'warning' as const }] },
    { id: 'demo-shift-103', employee_id: 'EMP-103', employee_first_name: 'Avery', employee_last_name: 'Patel', employee_score: 76, employee_score_tier: 'mid' as const, date: addDays(weekStartDate, 2), day_part: 'evening', status: 'scheduled', source: 'actual' as const, paired_with: null, flags: [{ type: 'fatigue_shift' as const, severity: 'warning' as const }] },
  ]
}

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
    const shifts = mockShifts(storeId, weekStartDate)
    return {
      store_id: storeId,
      week_start_date: weekStartDate,
      week_end_date: addDays(weekStartDate, 6),
      total_shifts: shifts.length,
      by_employee: Object.fromEntries(shifts.map((shift) => [shift.employee_id, [shift]])),
      shifts,
    }
  }
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
  const { data } = await pythia2Client.get<{ success: boolean; store_id: string; employees: ApiRosterMember[] }>(
    PYTHIA_2_API.staffing.roster,
    { headers: { Authorization: `Bearer ${token}` }, params: { store_id: storeId }, signal }
  )
  return data.employees || []
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
      week_end_date: addDays(weekStartDate, 6),
      days: [0, 1, 2].map((offset, index) => ({
        date_local: addDays(weekStartDate, offset), day_label: ['Mon', 'Tue', 'Wed'][index],
        cells: [{ segment: 'morning', count: 4 + index, intensity: 'moderate' as const }, { segment: 'afternoon', count: 7 + index, intensity: 'high' as const }, { segment: 'evening', count: 10 + index, intensity: 'very_high' as const }],
        peak_segment: 'evening', peak_intensity: 'very_high',
      })),
    }
  }
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
  if (token.includes('mock')) {
    return {
      coverage_gaps: 1,
      coverage_gaps_sub_bold: '1 gap',
      coverage_gaps_sub: 'during peak hours',
      fatigue_flags: 1,
      fatigue_flags_sub_bold: '1 flag',
      fatigue_flags_sub: 'review weekly hours',
      weak_pairings: 1,
      weak_pairings_sub_bold: '1 pairing',
      weak_pairings_sub: 'could improve team balance',
      optimized_shifts: 3,
      optimized_shifts_sub_bold: '3 shifts',
      optimized_shifts_sub: 'scheduled this week',
    }
  }
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
  if (token.includes('mock')) {
    const recommendations = [
      { id: 'demo-rec-101', type: 'coverage_gap' as const, type_label: 'Coverage Gap', text: 'Add coverage for Tuesday evening', detail: 'Peak traffic is expected between 5–7 PM.', severity: 'critical' as const, target: { date: addDays(weekStartDate, 1), day_part: 'evening', suggested_employee_id: 'EMP-103' }, status: 'active' as const, created_at: `${weekStartDate}T09:00:00Z` },
      { id: 'demo-rec-102', type: 'weak_pairing' as const, type_label: 'Team Pairing', text: 'Pair Marcus with Jessica', detail: 'This pairing has a strong customer service score.', severity: 'warning' as const, target: { date: addDays(weekStartDate, 2), employee_ids: ['EMP-101', 'EMP-102'] }, status: 'active' as const, created_at: `${weekStartDate}T09:05:00Z` },
      { id: 'demo-rec-103', type: 'fatigue_shift' as const, type_label: 'Fatigue Risk', text: 'Review Avery’s evening shift', detail: 'Consider reducing consecutive evening shifts.', severity: 'warning' as const, target: { date: addDays(weekStartDate, 2), employee_id: 'EMP-103' }, status: 'active' as const, created_at: `${weekStartDate}T09:10:00Z` },
    ]
    return {
      store_id: storeId,
      week_start_date: weekStartDate,
      generation_status: 'done',
      generated_at: `${weekStartDate}T09:00:00Z`,
      critical_alert: { recommendation_id: 'demo-rec-101', text: 'Tuesday evening needs additional coverage', detail: 'One high traffic segment has no scheduled staff.' },
      recommendations,
    }
  }
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
