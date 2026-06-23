import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2 } from '@/types/api'
import type { WeeklyStats } from '@/types/overview'

export async function fetchWeeklyStats(token: string): Promise<WeeklyStats> {
  const { data: response } = await pythia2Client.get<ApiResponseV2<WeeklyStats>>(
    PYTHIA_2_API.scorecard.weekly,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response.data
}
