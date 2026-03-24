import type { ProgressChartData } from '@/types/progress-chart'

export const PROGRESS_CHART_DATA: ProgressChartData = {
  title: 'My Progress Over Time',
  subtitle: 'Weekly score · Nov 2025 – Feb 2026',
  badgeText: '↑ +12 pts total',
  viewBox: '0 0 500 160',
  gridLines: [{ y: 20 }, { y: 55 }, { y: 90 }, { y: 125 }],
  yLabels: [
    { x: 0, y: 24, value: '95' },
    { x: 0, y: 59, value: '85' },
    { x: 0, y: 94, value: '75' },
    { x: 0, y: 129, value: '65' },
  ],
  xLabels: [
    { label: 'Nov' },
    { label: 'Dec' },
    { label: 'Jan' },
    { label: 'Feb' },
    { label: 'Now', highlight: true },
  ],
  series: {
    overall: {
      path: 'M 28 115 L 90 108 L 150 102 L 210 95 L 270 88 L 330 82 L 390 78 L 450 68',
      color: '#1D5C3A',
      strokeWidth: 2.5,
      dots: [
        { cx: 28, cy: 115, r: 3.5 },
        { cx: 150, cy: 102, r: 3.5 },
        { cx: 270, cy: 88, r: 3.5 },
        { cx: 390, cy: 78, r: 3.5 },
        { cx: 450, cy: 68, r: 4.5, stroke: 'white', strokeWidth: 2 },
      ],
      labels: [
        { x: 22, y: 109, value: '72' },
        { x: 444, y: 62, value: '84' },
      ],
    },
    hospitality: {
      path: 'M 28 118 L 90 112 L 150 104 L 210 94 L 270 86 L 330 78 L 390 72 L 450 60',
      color: '#1E4D7A',
      strokeWidth: 2,
      dots: [{ cx: 450, cy: 60, r: 3.5 }],
      labels: [{ x: 444, y: 55, value: '88' }],
    },
    checkout: {
      path: 'M 28 122 L 90 120 L 150 115 L 210 110 L 270 105 L 330 100 L 390 96 L 450 92',
      color: '#C47F18',
      strokeWidth: 2,
      dots: [{ cx: 450, cy: 92, r: 3.5 }],
      labels: [{ x: 444, y: 87, value: '76' }],
    },
  },
  coachingMarker: { x: 210, height: 160, label: 'Coaching started', labelY: 14, strokeDasharray: '3,3' },
  streakBadge: { x: 320, y: 30, width: 110, height: 22, text: '🔥 3-week streak' },
  milestones: [
    { icon: '✅', status: 'Reached', label: 'Score 80', variant: 'reached' },
    { icon: '✅', status: 'Reached', label: '3-wk streak', variant: 'reached' },
    { icon: '🎯', status: 'Next goal', label: 'Score 90', variant: 'next' },
    { icon: '🏆', status: 'Next goal', label: 'Checkout 25s', variant: 'next' },
  ],
}
