import type { LineChartSeries, ChartGridLine, ChartYLabel, ChartXLabel, ChartVerticalMarker } from './line-chart'
import type { LegendSwatch } from './score-vs-transactions'

export type { LegendSwatch }

export interface CheckoutSpeedInsight {
  emoji: string
  text: string
  variant: 'default' | 'blue'
}

export interface CheckoutSpeedData {
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
  insights: CheckoutSpeedInsight[]
}
