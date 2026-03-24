export interface MetricData {
  label: string
  value: string
  change: string
  valueColor?: string
}

export interface HeroBannerData {
  name: string
  greeting: string
  streakWeeks: number
  score: number
  scoreSubtitle: string
  metrics: MetricData[]
  teamRank: string
}
