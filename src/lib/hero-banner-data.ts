import { HeroBannerData } from '@/types/hero-banner'

export const HERO_BANNER_DATA: HeroBannerData = {
  name: 'Marcus',
  greeting: 'Good morning',
  streakWeeks: 3,
  score: 84,
  scoreSubtitle: "Your score is up 6 points since November. You're in the top 25% of your team this week.",
  metrics: [
    { label: 'Hospitality', value: '88', change: '↑ +4 this week', valueColor: '#78C99A' },
    { label: 'Checkout Spd', value: '76', change: '→ Coaching active', valueColor: '#F5C842' },
    { label: 'Time to Svc', value: '86', change: '↑ +2 this week', valueColor: '#78C99A' },
    { label: 'Shift Hours', value: '36h', change: 'This week' },
  ],
  teamRank: '#2 / 5',
}
