interface ChartDot {
    cx: number
    cy: number
    r: number
    stroke?: string
    strokeWidth?: number
}

interface ChartLabel {
    x: number
    y: number
    value: string
}

interface ChartSeries {
    path: string
    color: string
    strokeWidth: number
    dots: ChartDot[]
    labels: ChartLabel[]
}

interface CoachingMarker {
    x: number
    label: string
}

interface StreakBadge {
    x: number
    y: number
    width: number
    height: number
    text: string
}

interface MilestoneData {
    icon: string
    status: string
    label: string
    variant: 'reached' | 'next'
}

interface ProgressChartData {
    title: string
    subtitle: string
    badgeText: string
    xLabels: Array<{ label: string; highlight?: boolean }>
    series: {
        overall: ChartSeries
        hospitality: ChartSeries
        checkout: ChartSeries
    }
    coachingMarker: CoachingMarker
    streakBadge: StreakBadge
    milestones: MilestoneData[]
}
