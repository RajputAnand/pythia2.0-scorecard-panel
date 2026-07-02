export interface SwagItem {
  id: string
  emoji: string
  name: string
  desc: string
  cost: number
  redeemed?: boolean
}

export interface SwagStoreConfig {
  title: string
  subtitle: string
  /** Use **text** for bold segments */
  earnRateText: string
  catalog: SwagItem[]
}
