import type { LineChartSeries, ChartVerticalMarker, ChartStreakBadge, ChartGridLine, ChartYLabel, ChartXLabel } from './line-chart'

export type { LineChartSeries, ChartVerticalMarker, ChartStreakBadge, ChartGridLine, ChartYLabel, ChartXLabel }

export interface MilestoneData {
  icon: string
  status: string
  label: string
  variant: 'reached' | 'next'
}

export interface ProgressChartData {
  title: string
  subtitle: string
  badgeText: string
  viewBox: string
  gridLines: ChartGridLine[]
  yLabels: ChartYLabel[]
  xLabels: ChartXLabel[]
  series: {
    overall: LineChartSeries
    hospitality: LineChartSeries
    checkout: LineChartSeries
  }
  coachingMarker: ChartVerticalMarker
  streakBadge: ChartStreakBadge
  milestones: MilestoneData[]
}
