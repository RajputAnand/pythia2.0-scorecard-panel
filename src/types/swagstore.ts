export type SwagCategory = 'Apparel' | 'Food & Drink' | 'Perks' | 'Gift Cards' | 'Lifestyle' | 'Merchandise'

export interface SwagItem {
  id: string
  emoji: string
  name: string
  desc: string
  cost: number // In points (no real money)
  category?: string
  status?: 'active' | 'archived'
  stock?: number | null // null = unlimited
  redeemed?: boolean
  createdAt?: string
}

export type SwagProduct = SwagItem

export interface SwagOrder {
  id: string
  productId: string
  productName: string
  productEmoji: string
  employeeId: string
  employeeName: string
  pointsCost: number
  status: 'pending' | 'completed'
  orderedAt: string
  completedAt?: string
}

export interface SwagStoreConfig {
  title: string
  subtitle: string
  /** Use **text** for bold segments */
  earnRateText: string
  catalog: SwagItem[]
}

