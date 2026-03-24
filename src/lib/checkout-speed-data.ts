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
        { x: 14, y: 33, value: '38s' },
        { x: 129, y: 40, value: '36s' },
        { x: 244, y: 55, value: '33s' },
        { x: 339, y: 67, value: '29s' },
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
        { x: 12, y: 100, value: '72/hr' },
        { x: 123, y: 100, value: '76/hr' },
        { x: 237, y: 100, value: '81/hr' },
        { x: 330, y: 100, value: '87/hr' },
        { x: 420, y: 100, value: '93/hr', opacity: 0.6 },
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
      text: 'Checkout speed improved from **38s \u2192 29s average** over 4 months. That\'s **+15 additional customers served per hour** — meaning less line abandonment and more completed transactions.',
      variant: 'default',
    },
    {
      emoji: '\uD83D\uDCB0',
      text: '**At $8.40 avg basket size,** serving 15 more customers/hr during a 6-hour peak window adds an estimated **$756/day** in captured revenue.',
      variant: 'blue',
    },
  ],
}
