import type { HospitalityVsDwellData } from '@/types/hospitality-vs-dwell'

export const HOSPITALITY_VS_DWELL_DATA: HospitalityVsDwellData = {
  title: 'Hospitality Score vs. Avg Dwell Time',
  subtitle: 'Monthly · Node 2 customer tracking',
  badge: 'r = 0.87 correlation',
  legend: [
    { label: 'Hospitality score', color: '#1D5C3A' },
    { label: 'Avg dwell (min)', color: '#5C3A8C' },
    { label: 'Score projected', color: '#1D5C3A', dashed: true },
  ],
  viewBox: '0 0 460 140',
  gridLines: [{ y: 20 }, { y: 50 }, { y: 80 }, { y: 110 }],
  yLabels: [],
  series: [
    {
      path: 'M 20 108 L 135 100 L 250 82 L 345 65',
      color: '#1D5C3A',
      strokeWidth: 2.5,
      dots: [
        { cx: 20, cy: 108, r: 4 },
        { cx: 135, cy: 100, r: 4 },
        { cx: 250, cy: 82, r: 4 },
        { cx: 345, cy: 65, r: 4 },
        { cx: 440, cy: 50, r: 4, fill: 'white', stroke: '#1D5C3A', strokeWidth: 2 },
      ],
      labels: [
        { x: 15, y: 103, value: '71' },
        { x: 130, y: 95, value: '74' },
        { x: 245, y: 77, value: '79' },
        { x: 340, y: 60, value: '84' },
      ],
      extension: { path: 'M 345 65 L 440 50', strokeWidth: 2, strokeDasharray: '5,4' },
    },
    {
      path: 'M 20 115 L 135 105 L 250 88 L 345 70',
      color: '#5C3A8C',
      strokeWidth: 2.5,
      dots: [
        { cx: 20, cy: 115, r: 4 },
        { cx: 135, cy: 105, r: 4 },
        { cx: 250, cy: 88, r: 4 },
        { cx: 345, cy: 70, r: 4 },
        { cx: 440, cy: 54, r: 4, fill: 'white', stroke: '#5C3A8C', strokeWidth: 2 },
      ],
      labels: [
        { x: 9, y: 128, value: '3:42' },
        { x: 122, y: 128, value: '3:58' },
        { x: 237, y: 128, value: '4:11' },
        { x: 330, y: 128, value: '4:28' },
        { x: 422, y: 128, value: '4:45', opacity: 0.6 },
      ],
      extension: { path: 'M 345 70 L 440 54', strokeWidth: 2, strokeDasharray: '5,4' },
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
  insightEmoji: '\u{1F550}',
  insightText: 'Each **5-point hospitality improvement** adds approximately **18 seconds of dwell time.** Longer dwell correlates to +2.3% basket size — customers who stay longer buy more.',
}
