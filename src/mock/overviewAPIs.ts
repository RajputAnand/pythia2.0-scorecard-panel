
// ---------------------------------------------------------------------------
// Fake API layer — replace with real fetch calls when the backend is ready

import { HERO_BANNER_DATA } from '@/lib/hero-banner-data'
import { SHIFT_SUMMARY_DATA } from '@/lib/shift-data'
import { PROGRESS_CHART_DATA } from '@/lib/progress-chart-data'
import { LEADERBOARD_DATA } from '@/lib/leaderboard-data'
import { OverviewPageData } from '@/types/overview'

// ---------------------------------------------------------------------------
export function fakeGetOverview(): Promise<OverviewPageData> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          heroBanner: HERO_BANNER_DATA,
          shiftSummary: SHIFT_SUMMARY_DATA,
          progressChart: PROGRESS_CHART_DATA,
          leaderboard: LEADERBOARD_DATA,
        }),
      800,
    ),
  )
}
// ---------------------------------------------------------------------------
