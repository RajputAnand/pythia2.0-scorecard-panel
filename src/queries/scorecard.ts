import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { CoachingMomentsResponse, CoachingMomentsResult, DashboardSummaryResponse } from '@/types/overview'
import type { ShiftHighlightsResponse, ShiftHighlightsResult } from '@/types/shift'

// GET /dashboard/summary returns weekly/today/leaderboard/progress in one call —
// success/weekly/today/leaderboard/progress are top-level siblings, not wrapped
// in ApiResponseV2's `data` field.
export async function fetchDashboardSummary({
  token,
  weekOffset = 0,
  employeeId,
  signal,
}: {
  token: string
  weekOffset?: number
  employeeId?: string
  signal?: AbortSignal
}): Promise<DashboardSummaryResponse> {
  const { data } = await pythia2Client.get<DashboardSummaryResponse>(
    PYTHIA_2_API.dashboard.summary,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { week_offset: weekOffset, ...(employeeId ? { employee_id: employeeId } : {}) },
      signal,
    },
  )
  return data
}

export async function fetchCoachingMoments(token: string): Promise<CoachingMomentsResult> {
  const { data: response } = await pythia2Client.post<CoachingMomentsResponse>(
    PYTHIA_2_API.coaching.moments,
    undefined,
    { headers: { Authorization: `Bearer ${token}` }, params: { use_cached: true } },
  )
  return {
    items: response.coaching_tips,
    // Only set on the "on_demand" branch — no cache found, generation was just queued.
    generationInProgress: response.generation_in_progress ?? false,
  }
}

// GET /dashboard/shift-summary/highlights — cache-or-generate, same shape of
// contract as fetchCoachingMoments: `items` may be empty with
// `generationInProgress: true` while the backend's Celery task runs; the caller
// re-fetches later (e.g. next page load) to pick up the finished result.
export async function fetchShiftHighlights({
  token,
  shiftStart,
  shiftStatus,
  signal,
}: {
  token: string
  shiftStart: string
  shiftStatus: 'complete' | 'in_progress'
  signal?: AbortSignal
}): Promise<ShiftHighlightsResult> {
  const { data: response } = await pythia2Client.get<ShiftHighlightsResponse>(
    PYTHIA_2_API.dashboard.shiftSummaryHighlights,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { shift_start: shiftStart, shift_status: shiftStatus },
      signal,
    },
  )
  return {
    items: response.events,
    generationInProgress: response.generation_in_progress,
  }
}
