import type { ProgressOverTimeData } from '@/types/overview'

export const PROGRESS_CHART_DATA: ProgressOverTimeData = {
  points_change_total: 12,
  weeks: [
    { week_start: '2025-11-03', week_end: '2025-11-09', overall: 72, hospitality: 78, checkout_speed: 68 },
    { week_start: '2025-11-24', week_end: '2025-11-30', overall: 75, hospitality: 80, checkout_speed: 71 },
    { week_start: '2025-12-15', week_end: '2025-12-21', overall: 78, hospitality: 83, checkout_speed: 74 },
    { week_start: '2026-01-05', week_end: '2026-01-11', overall: 80, hospitality: 85, checkout_speed: 77 },
    { week_start: '2026-01-26', week_end: '2026-02-01', overall: 82, hospitality: 86, checkout_speed: 80 },
    { week_start: '2026-02-16', week_end: '2026-02-22', overall: 84, hospitality: 88, checkout_speed: 82 },
    { week_start: '2026-03-09', week_end: '2026-03-15', overall: 83, hospitality: 87, checkout_speed: 84 },
    { week_start: '2026-03-30', week_end: '2026-04-05', overall: 84, hospitality: 88, checkout_speed: 86 },
  ],
}
