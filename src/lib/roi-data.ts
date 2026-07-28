import { RoiStat } from '@/types/roi'

export const ROI_STATS: RoiStat[] = [
  {
    label: 'Est. Revenue Impact',
    value: '+$18,240',
    valueVariant: 'green',
    pill: '+12.4%',
    pillVariant: 'up',
    sub: 'vs. prior 4 months',
  },
  {
    label: 'Team Score Avg',
    value: '76 → 82',
    valueVariant: '',
    pill: '+6 pts',
    pillVariant: 'up',
    sub: '4-month improvement',
  },
  {
    label: 'Pythia Platform Cost',
    value: '$1,440',
    valueVariant: 'amber',
    pill: '4 months',
    pillVariant: 'neutral',
    sub: '$360/mo all-in',
  },
  {
    label: 'Net ROI',
    value: '12.7×',
    valueVariant: 'green',
    pill: '$16,800 net',
    pillVariant: 'up',
    sub: 'after platform cost',
  },
]
