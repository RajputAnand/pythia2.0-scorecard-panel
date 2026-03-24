export interface ChartDot {
  cx: number
  cy: number
  r: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}

export interface ChartLabel {
  x: number
  y: number
  value: string
  opacity?: number
}

export interface LineChartSeries {
  path: string
  color: string
  strokeWidth: number
  strokeDasharray?: string
  dots: ChartDot[]
  labels: ChartLabel[]
  extension?: {
    path: string
    strokeWidth?: number
    strokeDasharray: string
  }
}

export interface ChartGridLine {
  y: number
}

export interface ChartYLabel {
  x: number
  y: number
  value: string
}

export interface ChartXLabel {
  label: string
  highlight?: boolean
  color?: string
  opacity?: number
}

export interface ChartVerticalMarker {
  x: number
  height: number
  label: string
  labelY?: number
  strokeDasharray?: string
}

export interface ChartStreakBadge {
  x: number
  y: number
  width: number
  height: number
  text: string
}

export interface LineChartSvgProps {
  viewBox: string
  gridLines: ChartGridLine[]
  yLabels: ChartYLabel[]
  series: LineChartSeries[]
  xLabels: ChartXLabel[]
  verticalMarker?: ChartVerticalMarker
  streakBadge?: ChartStreakBadge
}
