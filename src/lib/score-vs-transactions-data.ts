import type { ScoreVsTransactionsData } from '@/types/score-vs-transactions'

export const SCORE_VS_TRANSACTIONS_DATA: ScoreVsTransactionsData = {
  title: 'Team Score vs. Monthly Transactions',
  subtitle: 'Monthly · Node 1 + Node 2 combined',
  badge: 'N/A correlation',
  legend: [
    { label: 'Team score', color: '#1D5C3A' },
    { label: 'Transactions/mo', color: '#1E4D7A' },
    { label: 'Projected', color: '#1D5C3A', dashed: true },
  ],
  viewBox: '0 0 460 140',
  gridLines: [{ y: 20 }, { y: 50 }, { y: 80 }, { y: 110 }],
  yLabels: [
    { x: 0, y: 24, value: '0' },
    { x: 0, y: 54, value: '0' },
    { x: 0, y: 84, value: '0' },
    { x: 0, y: 114, value: '0' },
  ],
  series: [
    {
      path: 'M 20 105 L 135 95 L 250 80 L 345 62',
      color: '#1D5C3A',
      strokeWidth: 2.5,
      dots: [
        { cx: 20, cy: 105, r: 4 },
        { cx: 135, cy: 95, r: 4 },
        { cx: 250, cy: 80, r: 4 },
        { cx: 345, cy: 62, r: 4 },
        { cx: 440, cy: 48, r: 4, fill: 'white', stroke: '#1D5C3A', strokeWidth: 2 },
      ],
      labels: [
        { x: 15, y: 100, value: '0' },
        { x: 130, y: 90, value: '0' },
        { x: 245, y: 75, value: '0' },
        { x: 340, y: 57, value: '0' },
        { x: 435, y: 43, value: '0', opacity: 0.6 },
      ],
      extension: { path: 'M 345 62 L 440 48', strokeWidth: 2, strokeDasharray: '5,4' },
    },
    {
      path: 'M 20 108 L 135 97 L 250 83 L 345 66',
      color: '#1E4D7A',
      strokeWidth: 2.5,
      dots: [
        { cx: 20, cy: 108, r: 4 },
        { cx: 135, cy: 97, r: 4 },
        { cx: 250, cy: 83, r: 4 },
        { cx: 345, cy: 66, r: 4 },
        { cx: 440, cy: 50, r: 4, fill: 'white', stroke: '#1E4D7A', strokeWidth: 2 },
      ],
      labels: [
        { x: 15, y: 130, value: '0' },
        { x: 118, y: 130, value: '0' },
        { x: 232, y: 130, value: '0' },
        { x: 327, y: 130, value: '0' },
        { x: 420, y: 130, value: '0', opacity: 0.6 },
      ],
      extension: { path: 'M 345 66 L 440 50', strokeWidth: 2, strokeDasharray: '5,4' },
    },
  ],
  verticalMarker: { x: 345, height: 140, label: 'Projected \u2192', labelY: 12, strokeDasharray: '4,3' },
  xLabels: [
    { label: 'Nov' },
    { label: 'Dec' },
    { label: 'Jan' },
    { label: 'Feb' },
    { label: 'Mar \u203a', color: '#1E4D7A', opacity: 0.6 },
  ],
  insightEmoji: '\u{1F4C8}',
  insightText: 'Correlation between **team score** and **monthly transactions** is not yet available. Score and transaction figures will populate once live data is connected.',
}
