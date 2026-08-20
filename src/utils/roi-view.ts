import type { RoiAttributionParams } from '@/types/owner-roi'

const VIEW_MAP: Record<string, NonNullable<RoiAttributionParams['view']>> = {
  'Actuals + Projected': 'both',
  'Actuals Only': 'actual',
  'Projected Only': 'projected',
}

// The backend's view filter only zeroes out fields it's already computed — it never
// changes what's real (see roi_service.py's _apply_view_filter docstring) — so the
// frontend always fetches the full 'both' payload once and applies this filter
// entirely client-side. Shared by every component that needs to read the current
// view straight off the URL (via its own useSearchParams()) rather than through a
// prop, so switching views never triggers a server navigation/refetch.
export function resolveRoiView(viewParam: string | null): NonNullable<RoiAttributionParams['view']> {
  return (viewParam && VIEW_MAP[viewParam]) || 'both'
}
