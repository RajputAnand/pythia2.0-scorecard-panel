export type CostPerCoachingQuality = 'good' | 'ok' | 'bad'
export type CostPerCoachingGainType = 'up' | 'flat'

export interface CostPerCoachingItem {
  name: string
  cost: string
  quality: CostPerCoachingQuality
  gain: string
  gainType: CostPerCoachingGainType
}

export interface CostPerCoachingData {
  title: string
  subtitle: string
  badge: string
  items: CostPerCoachingItem[]
  insightEmoji: string
  insightText: string
}
