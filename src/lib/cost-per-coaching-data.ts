import type { CostPerCoachingData } from '@/types/cost-per-coaching'

export const COST_PER_COACHING_DATA: CostPerCoachingData = {
  title: 'Cost Per Coaching Moment vs. Performance Gain',
  subtitle: 'How efficiently is each coaching dollar converting to score improvement?',
  badge: 'Team avg: N/A',
  items: [
    { name: 'Tara C.',   cost: '$0', quality: 'good', gain: 'N/A', gainType: 'up' },
    { name: 'Marcus R.', cost: '$0', quality: 'good', gain: 'N/A', gainType: 'up' },
    { name: 'Devon W.',  cost: '$0', quality: 'good', gain: 'N/A', gainType: 'up' },
    { name: 'Sofia K.',  cost: '$0', quality: 'ok',   gain: 'N/A', gainType: 'up' },
    { name: 'Jamie L.',  cost: '$0', quality: 'bad',  gain: 'N/A', gainType: 'flat' },
  ],
  insightEmoji: '\uD83D\uDCA1',
  insightText: "Coaching cost and score impact data is **N/A** for this period \u2014 figures will populate once live data is connected.",
}
