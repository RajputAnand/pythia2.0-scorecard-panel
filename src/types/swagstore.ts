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

export type SwagOrderStatus = 'pending' | 'completed' | 'cancelled' | 'rejected'

export interface SwagOrder {
  id: string
  productId: string
  productName: string
  productEmoji: string
  category?: string
  employeeId: string
  employeeName: string
  pointsCost: number
  status: SwagOrderStatus
  orderedAt: string
  completedAt?: string
  fulfilledBy?: string
  cancelledAt?: string
  cancelledBy?: string
  rejectedAt?: string
  rejectedBy?: string
  rejectionReason?: string
}

export interface SwagStoreConfig {
  title: string
  subtitle: string
  /** Use **text** for bold segments */
  earnRateText: string
  catalog: SwagItem[]
}

