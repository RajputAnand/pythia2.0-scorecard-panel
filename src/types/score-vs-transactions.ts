import type { LineChartSeries, ChartGridLine, ChartYLabel, ChartXLabel, ChartVerticalMarker } from './line-chart'

export interface LegendSwatch {
  label: string
  color: string
  dashed?: boolean
}

export interface ScoreVsTransactionsData {
  title: string
  subtitle: string
  badge: string
  legend: LegendSwatch[]
  viewBox: string
  gridLines: ChartGridLine[]
  yLabels: ChartYLabel[]
  series: LineChartSeries[]
  verticalMarker: ChartVerticalMarker
  xLabels: ChartXLabel[]
  insightEmoji: string
  insightText: string
}
