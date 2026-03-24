import type { RevenueImpactData } from '@/types/revenue-impact'

export const REVENUE_IMPACT_DATA: RevenueImpactData = {
  title: 'Estimated Revenue Impact by Metric',
  subtitle: 'Actuals Nov–Feb · Projections based on current trajectory',
  badge: '4-month view',
  rows: [
    {
      metric: 'Team Hospitality Score',
      sub: 'Greeting rate, tone, engagement',
      scoreBefore: '71', scoreAfter: '84', scoreColor: '#1D5C3A',
      barWidth: '84%', barColor: '#1D5C3A',
      outcome: '+46s avg dwell time · +2.3% basket',
      actual: '+$6,840', projected: '+$9,200',
    },
    {
      metric: 'Checkout Speed',
      sub: 'Avg transaction time per customer',
      scoreBefore: '38s', scoreAfter: '29s', scoreColor: '#C47F18',
      barWidth: '70%', barColor: '#C47F18',
      outcome: '+15 customers/hr · less abandonment',
      actual: '+$8,400', projected: '+$11,200',
    },
    {
      metric: 'Time to Service',
      sub: 'Greeting delay reduction',
      scoreBefore: '75', scoreAfter: '82', scoreColor: '#1E4D7A',
      barWidth: '82%', barColor: '#1E4D7A',
      outcome: '+8% repeat visit intent (survey)',
      actual: '+$3,000', projected: '+$4,800',
    },
  ],
  costRow: {
    label: 'Pythia Platform Cost',
    sub: 'All-in monthly subscription',
    outcome: 'Coaching, analytics, hardware',
    cost: '\u2212$1,440',
  },
  netRoiRow: {
    label: 'Net ROI',
    outcome: '12.7\u00D7 return on platform investment',
    actual: '+$16,800',
    projected: '+$23,760',
  },
}
