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

// Backend API schemas & shapes

export interface SwagRewardApi {
  id: string
  name: string
  icon: string
  category: string
  cost_points: number
  description: string
  stock_unlimited: boolean
  stock_remaining: number | null
  status: 'active' | 'archived'
  store_id: string
  tenant_id?: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface SwagRedemptionApi {
  id: string
  reward_id: string
  reward_name: string
  reward_icon: string
  reward_category: string
  cost_points: number
  employee_id: string
  employee_user_id: string
  employee_name: string
  store_id: string
  tenant_id?: string | null
  status: SwagOrderStatus
  claimed_at: string
  resolved_at?: string | null
  resolved_by?: string | null
  resolved_by_name?: string | null
  resolved_by_role?: string | null
  created_at: string
  updated_at: string
}

export interface SwagStoreStats {
  active_rewards: number
  archived_rewards: number
  pending_fulfillment: number
  fulfilled_orders: number
  total_orders: number
  total_points_claimed: number
  employees_rewarded: number
}

export interface CreateSwagRewardInput {
  name: string
  icon: string
  category: string
  cost_points: number
  description?: string
  stock_unlimited?: boolean
  stock_remaining?: number | null
}

export interface UpdateSwagRewardInput {
  name?: string
  icon?: string
  category?: string
  cost_points?: number
  description?: string
  stock_unlimited?: boolean
  stock_remaining?: number | null
}

export function fromApiReward(api: SwagRewardApi): SwagProduct {
  return {
    id: api.id,
    emoji: api.icon || '🎁',
    name: api.name,
    desc: api.description || '',
    cost: api.cost_points,
    category: api.category,
    status: api.status,
    stock: api.stock_unlimited ? null : (api.stock_remaining ?? null),
    createdAt: api.created_at,
  }
}

export function fromApiRedemption(api: SwagRedemptionApi): SwagOrder {
  return {
    id: api.id,
    productId: api.reward_id,
    productName: api.reward_name,
    productEmoji: api.reward_icon || '🎁',
    category: api.reward_category,
    employeeId: api.employee_user_id || api.employee_id,
    employeeName: api.employee_name || 'Employee',
    pointsCost: api.cost_points,
    status: api.status,
    orderedAt: api.claimed_at,
    completedAt: api.status === 'completed' && api.resolved_at ? api.resolved_at : undefined,
    fulfilledBy: api.status === 'completed' ? (api.resolved_by_name || api.resolved_by || undefined) : undefined,
    cancelledAt: api.status === 'cancelled' && api.resolved_at ? api.resolved_at : undefined,
    cancelledBy: api.status === 'cancelled' ? (api.resolved_by_name || api.resolved_by || api.employee_name) : undefined,
    rejectedAt: api.status === 'rejected' && api.resolved_at ? api.resolved_at : undefined,
    rejectedBy: api.status === 'rejected' ? (api.resolved_by_name || api.resolved_by || undefined) : undefined,
  }
}
