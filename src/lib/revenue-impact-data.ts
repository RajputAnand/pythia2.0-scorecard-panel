import type { RevenueImpactData } from '@/types/revenue-impact'

export const REVENUE_IMPACT_DATA: RevenueImpactData = {
  title: 'Estimated Revenue Impact by Metric',
  subtitle: 'Actuals Nov–Feb · Projections based on current trajectory',
  badge: '4-month view',
  rows: [
    {
      metric: 'Team Hospitality Score',
      sub: 'Greeting rate, tone, engagement',
      scoreBefore: '0', scoreAfter: '0', scoreColor: '#1D5C3A',
      barWidth: '0%', barColor: '#1D5C3A',
      outcome: 'N/A',
      actual: '$0', projected: '$0',
    },
    {
      metric: 'Checkout Speed',
      sub: 'Avg transaction time per customer',
      scoreBefore: 'N/A', scoreAfter: 'N/A', scoreColor: '#C47F18',
      barWidth: '0%', barColor: '#C47F18',
      outcome: 'N/A',
      actual: '$0', projected: '$0',
    },
    {
      metric: 'Time to Service',
      sub: 'Greeting delay reduction',
      scoreBefore: '0', scoreAfter: '0', scoreColor: '#1E4D7A',
      barWidth: '0%', barColor: '#1E4D7A',
      outcome: 'N/A',
      actual: '$0', projected: '$0',
    },
  ],
  costRow: {
    label: 'Pythia Platform Cost',
    sub: 'All-in monthly subscription',
    outcome: 'Coaching, analytics, hardware',
    cost: '$0',
  },
  netRoiRow: {
    label: 'Net ROI',
    outcome: 'N/A',
    actual: '$0',
    projected: '$0',
  },
}
