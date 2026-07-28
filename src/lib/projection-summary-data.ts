import type { ProjectionSummaryData } from '@/types/projection-summary'

export const PROJECTION_SUMMARY_DATA: ProjectionSummaryData = {
  stats: [
    {
      eyebrow: 'If current trajectory holds',
      value: '+$25,200',
      highlight: true,
      sub: 'Projected net revenue impact over next **4 months**',
    },
    {
      eyebrow: 'If team score reaches 88',
      value: '+$34,800',
      highlight: true,
      sub: 'Estimated impact if **all 5 stalled issues resolve**',
    },
    {
      eyebrow: 'Breakeven on platform',
      value: '3.2 days',
      highlight: false,
      sub: 'Platform pays for itself in under **4 days of operation**',
    },
    {
      eyebrow: 'Annual ROI projection',
      value: '15.4\u00D7',
      highlight: true,
      sub: 'Based on current improvement rate **sustained 12 months**',
    },
  ],
  footnote: '* Projections assume current score improvement rate of +1.5 pts/month continues. Revenue correlations based on 4 months of observed store data. Basket size assumption: $8.40 avg. These are estimates, not guarantees.',
}
