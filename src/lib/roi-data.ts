import { RoiStat } from '@/types/roi'

export const ROI_STATS: RoiStat[] = [
  {
    label: 'Est. Revenue Impact',
    value: '$0',
    valueVariant: 'green',
    pill: '0%',
    pillVariant: 'neutral',
    sub: 'vs. prior period',
  },
  {
    label: 'Team Score Avg',
    value: '0 → 0',
    valueVariant: '',
    pill: '0 pts',
    pillVariant: 'neutral',
    sub: 'no change recorded',
  },
  {
    label: 'Pythia Platform Cost',
    value: '$0',
    valueVariant: 'amber',
    pill: 'N/A',
    pillVariant: 'neutral',
    sub: 'N/A',
  },
  {
    label: 'Net ROI',
    value: 'N/A',
    valueVariant: 'green',
    pill: '$0 net',
    pillVariant: 'neutral',
    sub: 'after platform cost',
  },
]
