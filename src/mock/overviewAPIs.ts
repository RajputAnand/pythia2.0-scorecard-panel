
// ---------------------------------------------------------------------------
// Fake API layer — replace with real fetch calls when the backend is ready

import { HERO_BANNER_DATA } from '@/lib/hero-banner-data'
import { OverviewPageData } from '@/types/overview'

// ---------------------------------------------------------------------------
export function fakeGetOverview(): Promise<OverviewPageData> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          heroBanner: HERO_BANNER_DATA,
        }),
      800,
    ),
  )
}
// ---------------------------------------------------------------------------
