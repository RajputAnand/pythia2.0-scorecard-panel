export interface MetricData {
  label: string
  value: string
  change: string
  changeClass: 'up' | 'down' | 'flat'
  valueClass: 'good' | 'great' | 'ok' | 'gold'
}

export interface TimelineEvent {
  time: string
  dotColor: string
  scoreColor: string
  score: string
  /** Use **text** for bold segments */
  text: string
}

export interface ShiftSummaryData {
  title: string
  subtitle: string
  shiftComplete: boolean
  metrics: MetricData[]
  timeline: TimelineEvent[]
}
