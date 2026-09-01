import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { CoachingMomentsResponse, CoachingMomentsResult, DashboardSummaryResponse } from '@/types/overview'
import type { ShiftHighlightsResponse, ShiftHighlightsResult } from '@/types/shift'
import {
  PREVIEW_WEEKLY_STATS,
  PREVIEW_SHIFT_SUMMARY,
  PREVIEW_TEAM_RANKING,
  PREVIEW_PROGRESS_DATA,
  PREVIEW_COACHING_MOMENTS,
  PREVIEW_SHIFT_HIGHLIGHTS,
} from '@/lib/kpi-preview-data'

const MOCK_SUMMARY: DashboardSummaryResponse = {
  success: true,
  weekly: {
    week_start: '2026-08-25',
    week_end: '2026-08-31',
    data: PREVIEW_WEEKLY_STATS,
  },
  today: {
    shift_start: '2026-09-01T08:00:00Z',
    shift_end: '2026-09-01T16:00:00Z',
    data: PREVIEW_SHIFT_SUMMARY,
  },
  leaderboard: {
    week_start: '2026-08-25',
    week_end: '2026-08-31',
    data: PREVIEW_TEAM_RANKING,
  },
  progress: PREVIEW_PROGRESS_DATA,
}

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
  if (token.includes('mock')) {
    return MOCK_SUMMARY
  }

  try {
    const { data } = await pythia2Client.get<DashboardSummaryResponse>(
      PYTHIA_2_API.dashboard.summary,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { week_offset: weekOffset, ...(employeeId ? { employee_id: employeeId } : {}) },
        signal,
      },
    )
    return data
  } catch {
    return MOCK_SUMMARY
  }
}

export async function fetchCoachingMoments(token: string): Promise<CoachingMomentsResult> {
  if (token.includes('mock')) {
    return {
      items: PREVIEW_COACHING_MOMENTS,
      generationInProgress: false,
    }
  }
  try {
    const { data: response } = await pythia2Client.post<CoachingMomentsResponse>(
      PYTHIA_2_API.coaching.moments,
      undefined,
      { headers: { Authorization: `Bearer ${token}` }, params: { use_cached: true } },
    )
    return {
      items: response.coaching_tips,
      generationInProgress: response.generation_in_progress ?? false,
    }
  } catch {
    return {
      items: PREVIEW_COACHING_MOMENTS,
      generationInProgress: false,
    }
  }
}

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
  if (token.includes('mock')) {
    return {
      items: PREVIEW_SHIFT_HIGHLIGHTS,
      generationInProgress: false,
    }
  }
  try {
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
  } catch {
    return {
      items: PREVIEW_SHIFT_HIGHLIGHTS,
      generationInProgress: false,
    }
  }
}
