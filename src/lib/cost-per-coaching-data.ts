import type { CostPerCoachingData } from '@/types/cost-per-coaching'

export const COST_PER_COACHING_DATA: CostPerCoachingData = {
  title: 'Cost Per Coaching Moment vs. Performance Gain',
  subtitle: 'How efficiently is each coaching dollar converting to score improvement?',
  badge: 'Team avg: $2.14 / point gained',
  items: [
    { name: 'Tara C.',   cost: '$0.84', quality: 'good', gain: '\u2191 +17 pts \u00B7 2 issues resolved', gainType: 'up' },
    { name: 'Marcus R.', cost: '$1.20', quality: 'good', gain: '\u2191 +12 pts \u00B7 3 resolved',         gainType: 'up' },
    { name: 'Devon W.',  cost: '$1.54', quality: 'good', gain: '\u2191 +10 pts \u00B7 2 resolved',         gainType: 'up' },
    { name: 'Sofia K.',  cost: '$3.20', quality: 'ok',   gain: '\u2191 +5 pts \u00B7 1 resolved',          gainType: 'up' },
    { name: 'Jamie L.',  cost: '$8.60', quality: 'bad',  gain: '\u2192 \u221212 pts \u00B7 2 stalled',     gainType: 'flat' },
  ],
  insightEmoji: '\uD83D\uDCA1',
  insightText: "Jamie\u2019s coaching cost is **4\u00D7 the team average** with declining scores \u2014 a signal that AI coaching alone is not the right tool here. A single manager conversation (est. 30 min \u00D7 $22/hr = **$11**) is more cost-effective than continued automated coaching at current trajectory.",
}
