import type { CheckoutSpeedData } from '@/types/checkout-speed'

export const CHECKOUT_SPEED_DATA: CheckoutSpeedData = {
  title: 'Checkout Speed vs. Customers Served Per Hour',
  subtitle: 'Monthly average · Node 1 transaction data',
  badge: 'Direct throughput impact',
  legend: [
    { label: 'Avg checkout time (s)', color: '#C47F18' },
    { label: 'Customers/hr', color: '#1E4D7A' },
  ],
  viewBox: '0 0 460 120',
  gridLines: [{ y: 20 }, { y: 55 }, { y: 90 }],
  yLabels: [],
  series: [
    {
      path: 'M 20 38 L 135 45 L 250 60 L 345 72',
      color: '#C47F18',
      strokeWidth: 2.5,
      dots: [
        { cx: 20, cy: 38, r: 4 },
        { cx: 135, cy: 45, r: 4 },
        { cx: 250, cy: 60, r: 4 },
        { cx: 345, cy: 72, r: 4 },
        { cx: 440, cy: 82, r: 4, fill: 'white', stroke: '#C47F18', strokeWidth: 2 },
      ],
      labels: [
        { x: 14, y: 33, value: 'N/A' },
        { x: 129, y: 40, value: 'N/A' },
        { x: 244, y: 55, value: 'N/A' },
        { x: 339, y: 67, value: 'N/A' },
      ],
      extension: { path: 'M 345 72 L 440 82', strokeWidth: 2, strokeDasharray: '5,4' },
    },
    {
      path: 'M 20 85 L 135 78 L 250 65 L 345 50',
      color: '#1E4D7A',
      strokeWidth: 2.5,
      dots: [
        { cx: 20, cy: 85, r: 4 },
        { cx: 135, cy: 78, r: 4 },
        { cx: 250, cy: 65, r: 4 },
        { cx: 345, cy: 50, r: 4 },
        { cx: 440, cy: 38, r: 4, fill: 'white', stroke: '#1E4D7A', strokeWidth: 2 },
      ],
      labels: [
        { x: 12, y: 100, value: 'N/A' },
        { x: 123, y: 100, value: 'N/A' },
        { x: 237, y: 100, value: 'N/A' },
        { x: 330, y: 100, value: 'N/A' },
        { x: 420, y: 100, value: 'N/A', opacity: 0.6 },
      ],
      extension: { path: 'M 345 50 L 440 38', strokeWidth: 2, strokeDasharray: '5,4' },
    },
  ],
  verticalMarker: { x: 345, height: 120, label: '', strokeDasharray: '4,3' },
  xLabels: [
    { label: 'Nov' },
    { label: 'Dec' },
    { label: 'Jan' },
    { label: 'Feb' },
    { label: 'Mar \u203a', color: '#1E4D7A', opacity: 0.6 },
  ],
  insights: [
    {
      emoji: '\u26A1',
      text: 'Checkout speed trend is **N/A** for this period — meaning line abandonment and completed transactions cannot yet be estimated.',
      variant: 'default',
    },
    {
      emoji: '\uD83D\uDCB0',
      text: 'Estimated captured revenue from checkout speed improvements is **N/A** until live data is connected.',
      variant: 'blue',
    },
  ],
}
