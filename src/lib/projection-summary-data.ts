import type { ProjectionSummaryData } from '@/types/projection-summary'

export const PROJECTION_SUMMARY_DATA: ProjectionSummaryData = {
  stats: [
    {
      eyebrow: 'If current trajectory holds',
      value: '$0',
      highlight: false,
      sub: 'Projected net revenue impact is **N/A** for this period',
    },
    {
      eyebrow: 'If team score reaches target',
      value: '$0',
      highlight: false,
      sub: 'Estimated impact is **N/A** until stalled issues are resolved',
    },
    {
      eyebrow: 'Breakeven on platform',
      value: 'N/A',
      highlight: false,
      sub: 'Breakeven timeline is **N/A** for this period',
    },
    {
      eyebrow: 'Annual ROI projection',
      value: 'N/A',
      highlight: false,
      sub: 'Annual ROI projection is **N/A** for this period',
    },
  ],
  footnote: '* Projections are not available for this period. Figures will populate once live data is connected.',
}
