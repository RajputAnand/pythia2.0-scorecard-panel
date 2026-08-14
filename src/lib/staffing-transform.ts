import { getEmployeeInitials, getAvatarColor } from '@/utils/common'
import type {
  ApiScheduleResponse,
  ApiShift,
  ApiRosterMember,
  ApiTrafficHeatmap,
  ApiRecommendation,
  StaffEmployee,
  Shift,
  ShiftVariant,
  ScoreColor,
  Recommendation,
  TeamScoreMember,
} from '@/types/staff'

const DAY_PART_LABELS: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
}

/** Merges an employee's day-parts on one date into one display label ("Morning" or
 * "Afternoon + Evening") — the day-part name(s), not a computed clock-time range. */
function mergeDayPartsToLabel(dayParts: string[]): string {
  const unique = Array.from(new Set(dayParts))
  const labels = unique.map((dp) => DAY_PART_LABELS[dp] ?? dp)
  return labels.join(' + ')
}

/**
 * Adds `days` calendar days to a "YYYY-MM-DD" date string, returning the same format.
 *
 * Does the arithmetic entirely in UTC (Date.UTC + getUTCDate/setUTCDate), never parsing
 * the string as local time. `new Date(dateStr + 'T00:00:00')` followed by
 * `.toISOString()` — the previous implementation — silently shifts the date back by
 * one day for any browser whose local UTC offset is positive (e.g. IST, UTC+5:30):
 * local midnight becomes the previous day in UTC, so the schedule grid's day columns
 * end up looking up the wrong date and every employee's shifts appear one column late
 * ("Day Off" under the correct day, real data under the next one).
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function variantForShift(shifts: ApiShift[], scoreTier?: string): ShiftVariant {
  const flagTypes = shifts.flatMap((s) => s.flags?.map((f) => f.type) ?? [])
  if (flagTypes.includes('coverage_gap') || flagTypes.includes('alone_at_peak')) return 'gap'
  if (flagTypes.includes('fatigue_shift') || flagTypes.includes('fatigue_weekly')) return 'fatigue'
  if (shifts.some((s) => s.source === 'suggested' || s.source === 'ai_recommendation')) return 'suggested'
  if (scoreTier === 'high') return 'high'
  if (scoreTier === 'needs_support') return 'low'
  return 'mid'
}

function flagLabelFor(type: string): string {
  const labels: Record<string, string> = {
    coverage_gap: '⚠ Coverage gap',
    alone_at_peak: '⚠ Alone at peak',
    weak_pairing: '⚠ Weak pairing',
    fatigue_shift: '😓 Fatigue risk',
    fatigue_weekly: '😓 Overtime risk',
  }
  return labels[type] ?? type
}

function flagVariantFor(type: string): 'gap' | 'fatigue' | 'suggested' {
  if (type === 'coverage_gap' || type === 'alone_at_peak' || type === 'weak_pairing') return 'gap'
  return 'fatigue'
}

function scoreColorForTier(tier?: string): ScoreColor {
  if (tier === 'high') return 'good'
  if (tier === 'needs_support') return 'bad'
  return 'ok'
}

/**
 * Backend records (per day_part, grouped by employee_id, `date` field) -> the UI's
 * positional 7-entry-per-employee Shift[] shape. `weekStartDate` ("YYYY-MM-DD" Monday)
 * is used to map each date back to a Mon..Sun index.
 */
export function transformScheduleToStaffEmployees(
  schedule: ApiScheduleResponse,
  roster: ApiRosterMember[],
  weekStartDate: string
): StaffEmployee[] {
  const weekDates = Array.from({ length: 7 }, (_, i) => addDaysToDateString(weekStartDate, i))

  return roster.map((member) => {
    const apiShifts = schedule.by_employee[member.employee_id] ?? []
    const byDate = new Map<string, ApiShift[]>()
    for (const s of apiShifts) {
      const arr = byDate.get(s.date) ?? []
      arr.push(s)
      byDate.set(s.date, arr)
    }

    const shifts: Shift[] = weekDates.map((dateStr) => {
      const dayShifts = byDate.get(dateStr) ?? []
      if (dayShifts.length === 0) return { time: 'Day Off', variant: 'off' as ShiftVariant }

      const variant = variantForShift(dayShifts, member.score_tier)
      const flagEntry = dayShifts.flatMap((s) => s.flags ?? [])[0]
      return {
        time: mergeDayPartsToLabel(dayShifts.map((s) => s.day_part)),
        variant,
        flag: flagEntry ? flagLabelFor(flagEntry.type) : undefined,
        flagVariant: flagEntry ? flagVariantFor(flagEntry.type) : undefined,
      }
    })

    const name = `${member.first_name} ${member.last_name.charAt(0)}${member.last_name ? '.' : ''}`.trim()

    return {
      id: member.employee_id,
      initials: getEmployeeInitials({ first_name: member.first_name, last_name: member.last_name }),
      avatarColor: getAvatarColor(member.employee_id),
      name: name || 'Unnamed',
      score: member.score,
      scoreColor: scoreColorForTier(member.score_tier),
      shifts,
    }
  })
}

export function transformRosterToTeamScores(roster: ApiRosterMember[]): TeamScoreMember[] {
  const maxScore = Math.max(1, ...roster.map((r) => r.score))
  return roster.map((member) => ({
    id: member.employee_id,
    initials: getEmployeeInitials({ first_name: member.first_name, last_name: member.last_name }),
    avatarColor: getAvatarColor(member.employee_id),
    name: `${member.first_name} ${member.last_name.charAt(0)}${member.last_name ? '.' : ''}`.trim() || 'Unnamed',
    score: member.score,
    barWidth: `${Math.max(4, Math.round((member.score / maxScore) * 100))}%`,
    barColor: member.score_tier === 'high' ? 'var(--color-accent)' : 'var(--color-amber)',
    scoreColor: scoreColorForTier(member.score_tier),
  }))
}

// ---------------------------------------------------------------------------
// Heatmap + peak-bar color/width scale utilities — none of this exists in the
// backend response (which returns raw counts + an intensity label); the mock
// data hand-baked hex colors and CSS-% widths, so this replicates that mapping
// from real intensity levels instead.
// ---------------------------------------------------------------------------

const INTENSITY_COLOR_SCALE: Record<string, string> = {
  moderate: '#D8EDE2',
  high: '#7EC8A0',
  very_high: '#2D8A58',
  critical: '#156030',
}

export function intensityToColor(intensity: string): string {
  return INTENSITY_COLOR_SCALE[intensity] ?? INTENSITY_COLOR_SCALE.moderate
}

const PEAK_BAR_COLOR: Record<string, string> = {
  moderate: '#5AB888',
  high: 'var(--color-accent-mid)',
  very_high: 'var(--color-accent)',
  critical: '#B52B1E',
}

const PEAK_BAR_LABEL: Record<string, string> = {
  moderate: 'Moderate',
  high: 'High',
  very_high: 'Very High',
  critical: 'Critical ⚠',
}

export function intensityToBarColor(intensity: string): string {
  return PEAK_BAR_COLOR[intensity] ?? PEAK_BAR_COLOR.moderate
}

export function intensityToBarLabel(intensity: string): string {
  return PEAK_BAR_LABEL[intensity] ?? 'Moderate'
}

function intensityToBarWidth(count: number, maxCountThisWeek: number): string {
  if (maxCountThisWeek <= 0) return '4%'
  return `${Math.max(8, Math.round((count / maxCountThisWeek) * 100))}%`
}

const SEGMENT_LABELS: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
}
const SEGMENT_ORDER = ['morning', 'afternoon', 'evening', 'night']

export function transformHeatmapToRows(heatmap: ApiTrafficHeatmap): { label: string; cells: string[] }[] {
  return SEGMENT_ORDER.map((segment) => ({
    label: SEGMENT_LABELS[segment] ?? segment,
    cells: heatmap.days.map((day) => {
      const cell = day.cells.find((c) => c.segment === segment)
      return intensityToColor(cell?.intensity ?? 'moderate')
    }),
  }))
}

export function transformHeatmapToPeakBars(
  heatmap: ApiTrafficHeatmap
): { label: string; width: string; color: string }[] {
  const maxCount = Math.max(1, ...heatmap.days.flatMap((d) => d.cells.map((c) => c.count)))
  return heatmap.days.map((day) => {
    const peakCell = day.cells.find((c) => c.segment === day.peak_segment) ?? day.cells[0]
    return {
      label: intensityToBarLabel(peakCell?.intensity ?? 'moderate'),
      width: intensityToBarWidth(peakCell?.count ?? 0, maxCount),
      color: intensityToBarColor(peakCell?.intensity ?? 'moderate'),
    }
  })
}

/** Day-header labels for the schedule grid, derived from the heatmap response so they
 * always match the requested week rather than a hardcoded "Mon 2/23" string. Marks
 * today with ● and any day whose peak intensity is "critical" with ⚠. */
export function transformHeatmapToDayLabels(heatmap: ApiTrafficHeatmap): string[] {
  const todayStr = new Date().toISOString().slice(0, 10)
  return heatmap.days.map((day) => {
    const d = new Date(day.date_local + 'T00:00:00')
    const shortDate = `${d.getMonth() + 1}/${d.getDate()}`
    let label = `${day.day_label} ${shortDate}`
    if (day.date_local === todayStr) label += ' ●'
    if (day.peak_intensity === 'critical') label += ' ⚠'
    return label
  })
}

export function transformApiRecommendation(r: ApiRecommendation): Recommendation {
  return { id: r.id, type: r.type, typeLabel: r.type_label, text: r.text, detail: r.detail }
}
