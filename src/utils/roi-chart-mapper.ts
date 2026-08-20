import type { RoiChartData, RoiChartPoint } from '@/types/owner-roi'
import type { ScoreVsTransactionsData } from '@/types/score-vs-transactions'

const X_POINTS = [20, 135, 250, 345, 440]
const Y_MIN = 20
const Y_MAX = 110
const DRAWABLE_HEIGHT = Y_MAX - Y_MIN

function formatLabel(periodStr: string): string {
  // E.g., "May 01, 2026 \u2013 May 31, 2026" -> "May"
  return periodStr.split(' ')[0]
}

function scaleY(value: number, min: number, max: number): number {
  if (max === min) return Y_MAX - DRAWABLE_HEIGHT / 2
  const pct = (value - min) / (max - min)
  return Y_MAX - pct * DRAWABLE_HEIGHT
}

export function mapRoiChartData(
  apiData: RoiChartData,
  title: string,
  subtitle: string,
  colorA: string,
  colorB: string,
  insightEmoji: string,
  view: 'both' | 'actual' | 'projected' = 'both'
): ScoreVsTransactionsData {
  // The API always sends a real (non-null) projected point object — even in 'actual'
  // view it just zeroes the point's value rather than nulling the object (see
  // roi_service.py's _apply_view_filter) — so "should we draw a projected point at
  // all" has to fold in the view filter, not just check the object's presence.
  const hasProjectedData = apiData.metric_a_projected !== null && apiData.metric_b_projected !== null
  const hasProjected = hasProjectedData && view !== 'actual'
  // 'projected' view keeps the historical points in the data (the dashed extension
  // still needs the last historical point as its start coordinate) but hides their
  // solid line/dots/labels, showing only the projected point and the dashed segment
  // leading into it.
  const isProjectedOnly = view === 'projected'

  const pointsA: (number | null)[] = apiData.metric_a_series.map((p) => p.value)
  if (hasProjected) pointsA.push(apiData.metric_a_projected!.value)

  const pointsB: (number | null)[] = apiData.metric_b_series.map((p) => p.value)
  if (hasProjected) pointsB.push(apiData.metric_b_projected!.value)

  const validA = pointsA.filter(v => v !== null) as number[]
  const validB = pointsB.filter(v => v !== null) as number[]

  const minA = validA.length ? Math.min(...validA) : 0
  const maxA = validA.length ? Math.max(...validA) : 100
  const minB = validB.length ? Math.min(...validB) : 0
  const maxB = validB.length ? Math.max(...validB) : 100

  // Use a slight padding so lines don't hit the absolute top/bottom edges
  const paddingA = (maxA - minA) * 0.1
  const paddingB = (maxB - minB) * 0.1

  const absMinA = minA - paddingA
  const absMaxA = maxA + paddingA
  const absMinB = minB - paddingB
  const absMaxB = maxB + paddingB

  const getDots = (points: (number | null)[], min: number, max: number, color: string) => {
    return points.map((val, i) => {
      if (val === null) return null
      if (isProjectedOnly && i < points.length - 1) return null
      const cy = scaleY(val, min, max)
      const isProjected = i === points.length - 1 && hasProjected
      return {
        cx: X_POINTS[i],
        cy,
        r: 4,
        ...(isProjected ? { fill: 'white', stroke: color, strokeWidth: 2 } : {}),
      }
    }).filter(Boolean) as any[]
  }

  const getPath = (points: (number | null)[], min: number, max: number) => {
    if (isProjectedOnly) return ''

    // Return path only for historical points
    const historicalPoints = hasProjected ? points.slice(0, points.length - 1) : points
    const validSegments: string[] = []
    let isFirst = true
    for (let i = 0; i < historicalPoints.length; i++) {
      const val = historicalPoints[i]
      if (val !== null) {
        const cx = X_POINTS[i]
        const cy = scaleY(val, min, max)
        validSegments.push(`${isFirst ? 'M' : 'L'} ${cx} ${cy}`)
        isFirst = false
      }
    }
    return validSegments.join(' ')
  }

  const getExtensionPath = (points: (number | null)[], min: number, max: number) => {
    if (!hasProjected) return undefined

    let lastValidIdx = -1
    for (let i = points.length - 2; i >= 0; i--) {
      if (points[i] !== null) {
        lastValidIdx = i
        break
      }
    }

    if (lastValidIdx === -1) return undefined

    const cx1 = X_POINTS[lastValidIdx]
    const cy1 = scaleY(points[lastValidIdx]!, min, max)
    const projIdx = points.length - 1
    const cx2 = X_POINTS[projIdx]
    const cy2 = scaleY(points[projIdx]!, min, max)

    return { path: `M ${cx1} ${cy1} L ${cx2} ${cy2}`, strokeWidth: 2, strokeDasharray: '5,4' }
  }

  const getLabelY = (
    val: number,
    min: number,
    max: number,
    otherVal: number | null,
    otherMin: number,
    otherMax: number,
    isSeriesA: boolean
  ) => {
    const cy = scaleY(val, min, max)
    let yOffset = isSeriesA ? -10 : 20
    if (otherVal !== null) {
      const otherCy = scaleY(otherVal, otherMin, otherMax)
      // cy is pixels from top. Larger cy = lower on screen.
      if (isSeriesA) {
        yOffset = cy > otherCy ? 20 : -10
      } else {
        yOffset = cy >= otherCy ? 20 : -10
      }
    }
    return cy + yOffset
  }

  const getLabels = (
    points: (number | null)[],
    min: number,
    max: number,
    otherPoints: (number | null)[],
    otherMin: number,
    otherMax: number,
    isSeriesA: boolean,
    formatFn?: (val: number | null) => string
  ) => {
    return points.map((val, i) => {
      if (val === null) return null
      if (isProjectedOnly && i < points.length - 1) return null

      const isProjected = i === points.length - 1 && hasProjected
      let formattedVal = formatFn ? formatFn(val) : val.toLocaleString('en-US', { maximumFractionDigits: 1 })

      return {
        x: X_POINTS[i] - 5,
        y: getLabelY(val, min, max, otherPoints[i], otherMin, otherMax, isSeriesA),
        value: formattedVal,
        ...(isProjected ? { opacity: 0.6 } : {}),
      }
    }).filter(Boolean) as any[]
  }

  const formatShortValue = (val: number | null) => {
    if (val === null || val === undefined) return 'N/A'
    if (Math.abs(val) >= 1000) {
      return (val / 1000).toFixed(1) + 'k'
    }
    return val.toLocaleString('en-US', { maximumFractionDigits: 1 })
  }

  // The last historical point (just before the projected one) sits right next to the
  // vertical marker line — its value label can land in the same spot as the marker's
  // "Projected →" text. Push the marker label right (past that label's text) and, if the
  // label is riding high near the default marker height, up as well, so the two never collide.
  const getMarkerLabelPosition = () => {
    const defaultLabelX = 345 + 3
    const defaultLabelY = 12
    const lastHistoricalIdx = pointsA.length - 2
    if (lastHistoricalIdx < 0) return { labelX: defaultLabelX, labelY: defaultLabelY }

    const valA = pointsA[lastHistoricalIdx]
    const valB = pointsB[lastHistoricalIdx]
    const adjacentLabelYs: number[] = []
    if (valA !== null) adjacentLabelYs.push(getLabelY(valA, absMinA, absMaxA, valB, absMinB, absMaxB, true))
    if (valB !== null) adjacentLabelYs.push(getLabelY(valB, absMinB, absMaxB, valA, absMinA, absMaxA, false))

    const topmostAdjacentY = adjacentLabelYs.length ? Math.min(...adjacentLabelYs) : defaultLabelY
    return {
      labelX: X_POINTS[lastHistoricalIdx] + 25,
      labelY: Math.max(8, Math.min(defaultLabelY, topmostAdjacentY - 9)),
    }
  }

  const badgeText = apiData.correlation_status === 'available' && apiData.correlation_r !== null
    ? `${apiData.correlation_r.toFixed(2)} correlation`
    : 'N/A correlation'

  const xLabels: { label: string; color?: string; opacity?: number }[] = apiData.metric_a_series.map((p, i) => ({
    label: formatLabel(p.period.label)
  }))
  if (hasProjected) {
    xLabels.push({
      label: `${formatLabel(apiData.metric_a_projected!.period.label)} ›`,
      color: colorB,
      opacity: 0.6
    })
  }

  return {
    title,
    subtitle,
    badge: badgeText,
    legend: [
      { label: apiData.metric_a_label, color: colorA },
      { label: apiData.metric_b_label, color: colorB },
      ...(hasProjected ? [{ label: 'Projected', color: colorA, dashed: true }] : []),
    ],
    viewBox: '0 0 460 140',
    gridLines: [{ y: 20 }, { y: 50 }, { y: 80 }, { y: 110 }],
    yLabels: [], // The component doesn't actually need strict yLabels if inline labels are used, returning empty
    series: [
      {
        path: getPath(pointsA, absMinA, absMaxA),
        color: colorA,
        strokeWidth: 2.5,
        dots: getDots(pointsA, absMinA, absMaxA, colorA),
        labels: getLabels(pointsA, absMinA, absMaxA, pointsB, absMinB, absMaxB, true, formatShortValue),
        extension: getExtensionPath(pointsA, absMinA, absMaxA),
      },
      {
        path: getPath(pointsB, absMinB, absMaxB),
        color: colorB,
        strokeWidth: 2.5,
        dots: getDots(pointsB, absMinB, absMaxB, colorB),
        labels: getLabels(pointsB, absMinB, absMaxB, pointsA, absMinA, absMaxA, false, formatShortValue),
        extension: getExtensionPath(pointsB, absMinB, absMaxB),
      },
    ],
    verticalMarker: hasProjected
      ? { x: 345, height: 140, label: 'Projected \u2192', ...getMarkerLabelPosition(), strokeDasharray: '4,3' }
      : { x: -100, height: 0, label: '' },
    xLabels,
    insightEmoji,
    insightText: apiData.callout || 'Correlation data is not available yet.',
  }
}
