import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import {
  type SwagProduct,
  type SwagOrder,
  type SwagStoreStats,
  type SwagRewardApi,
  type SwagRedemptionApi,
  type CreateSwagRewardInput,
  type UpdateSwagRewardInput,
  fromApiReward,
  fromApiRedemption,
} from '@/types/swagstore'
import { SWAG_STORE, INITIAL_SWAG_ORDERS } from '@/lib/swagstore-data'
import axios from 'axios'

function isMockToken(token?: string): boolean {
  return !token || token.includes('mock') || token.includes('test')
}

function isNetworkError(err: unknown): boolean {
  if (axios.isAxiosError(err)) {
    return !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error'
  }
  return false
}

// In-memory mock storage for fallback / offline / mock sessions
let mockCatalog: SwagProduct[] = [...SWAG_STORE.catalog]
let mockOrders: SwagOrder[] = [...INITIAL_SWAG_ORDERS]

export async function fetchSwagRewards({
  token,
  storeId,
  status = 'active',
}: {
  token?: string
  storeId: string
  status?: 'active' | 'archived'
}): Promise<SwagProduct[]> {
  if (isMockToken(token)) {
    return mockCatalog.filter((item) => (item.status ?? 'active') === status)
  }

  try {
    const { data } = await pythia2Client.get<{ rewards: SwagRewardApi[]; count: number; success: boolean }>(
      PYTHIA_2_API.swagStore.rewards,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { store_id: storeId, status },
      }
    )
    return (data.rewards || []).map(fromApiReward)
  } catch {
    return mockCatalog.filter((item) => (item.status ?? 'active') === status)
  }
}

export async function createSwagReward({
  token,
  storeId,
  data,
}: {
  token?: string
  storeId: string
  data: CreateSwagRewardInput
}): Promise<SwagProduct> {
  const localCreate = () => {
    const newProduct: SwagProduct = {
      id: `swag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: data.name,
      emoji: data.icon,
      desc: data.description || '',
      cost: data.cost_points,
      category: data.category,
      status: 'active',
      stock: data.stock_unlimited ? null : (data.stock_remaining ?? null),
      createdAt: new Date().toISOString(),
    }
    mockCatalog = [newProduct, ...mockCatalog]
    return newProduct
  }

  if (isMockToken(token)) {
    return localCreate()
  }

  const payload = {
    name: data.name,
    icon: data.icon,
    category: data.category,
    cost_points: data.cost_points,
    description: data.description || '',
    stock_unlimited: data.stock_unlimited ?? true,
    stock_remaining: data.stock_unlimited ? null : (data.stock_remaining ?? null),
  }

  try {
    const { data: res } = await pythia2Client.post<{ reward: SwagRewardApi; success: boolean }>(
      PYTHIA_2_API.swagStore.rewards,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { store_id: storeId },
      }
    )
    return fromApiReward(res.reward)
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      return localCreate()
    }
    if (axios.isAxiosError(err) && err.response?.data?.detail) {
      throw new Error(err.response.data.detail)
    }
    throw err
  }
}

export async function updateSwagReward({
  token,
  storeId,
  rewardId,
  data,
}: {
  token?: string
  storeId: string
  rewardId: string
  data: UpdateSwagRewardInput
}): Promise<SwagProduct> {
  const localUpdate = () => {
    let updated: SwagProduct | undefined
    mockCatalog = mockCatalog.map((p) => {
      if (p.id === rewardId) {
        updated = {
          ...p,
          name: data.name ?? p.name,
          emoji: data.icon ?? p.emoji,
          desc: data.description ?? p.desc,
          cost: data.cost_points ?? p.cost,
          category: data.category ?? p.category,
          stock: data.stock_unlimited !== undefined
            ? (data.stock_unlimited ? null : (data.stock_remaining ?? null))
            : p.stock,
        }
        return updated
      }
      return p
    })
    if (!updated) throw new Error('Reward not found')
    return updated
  }

  if (isMockToken(token)) {
    return localUpdate()
  }

  const payload: Record<string, unknown> = {}
  if (data.name !== undefined) payload.name = data.name
  if (data.icon !== undefined) payload.icon = data.icon
  if (data.category !== undefined) payload.category = data.category
  if (data.cost_points !== undefined) payload.cost_points = data.cost_points
  if (data.description !== undefined) payload.description = data.description
  if (data.stock_unlimited !== undefined) payload.stock_unlimited = data.stock_unlimited
  if (data.stock_remaining !== undefined) payload.stock_remaining = data.stock_remaining

  try {
    const { data: res } = await pythia2Client.patch<{ reward: SwagRewardApi; success: boolean }>(
      PYTHIA_2_API.swagStore.reward(rewardId),
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { store_id: storeId },
      }
    )
    return fromApiReward(res.reward)
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      return localUpdate()
    }
    if (axios.isAxiosError(err) && err.response?.data?.detail) {
      throw new Error(err.response.data.detail)
    }
    throw err
  }
}

export async function archiveSwagReward({
  token,
  storeId,
  rewardId,
}: {
  token?: string
  storeId: string
  rewardId: string
}): Promise<SwagProduct> {
  const localArchive = () => {
    let target: SwagProduct | undefined
    mockCatalog = mockCatalog.map((p) => {
      if (p.id === rewardId) {
        target = { ...p, status: 'archived' }
        return target
      }
      return p
    })
    if (!target) throw new Error('Reward not found')
    return target
  }

  if (isMockToken(token)) {
    return localArchive()
  }

  try {
    const { data: res } = await pythia2Client.post<{ reward: SwagRewardApi; success: boolean }>(
      PYTHIA_2_API.swagStore.archiveReward(rewardId),
      null,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { store_id: storeId },
      }
    )
    return fromApiReward(res.reward)
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      return localArchive()
    }
    if (axios.isAxiosError(err) && err.response?.data?.detail) {
      throw new Error(err.response.data.detail)
    }
    throw err
  }
}

export async function unarchiveSwagReward({
  token,
  storeId,
  rewardId,
}: {
  token?: string
  storeId: string
  rewardId: string
}): Promise<SwagProduct> {
  const localUnarchive = () => {
    let target: SwagProduct | undefined
    mockCatalog = mockCatalog.map((p) => {
      if (p.id === rewardId) {
        target = { ...p, status: 'active' }
        return target
      }
      return p
    })
    if (!target) throw new Error('Reward not found')
    return target
  }

  if (isMockToken(token)) {
    return localUnarchive()
  }

  try {
    const { data: res } = await pythia2Client.post<{ reward: SwagRewardApi; success: boolean }>(
      PYTHIA_2_API.swagStore.unarchiveReward(rewardId),
      null,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { store_id: storeId },
      }
    )
    return fromApiReward(res.reward)
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      return localUnarchive()
    }
    if (axios.isAxiosError(err) && err.response?.data?.detail) {
      throw new Error(err.response.data.detail)
    }
    throw err
  }
}

export async function deleteSwagReward({
  token,
  storeId,
  rewardId,
}: {
  token?: string
  storeId: string
  rewardId: string
}): Promise<{ success: boolean; reason?: string }> {
  const localDelete = () => {
    const pendingOrders = mockOrders.filter((o) => o.productId === rewardId && o.status === 'pending')
    if (pendingOrders.length > 0) {
      return {
        success: false,
        reason: `Cannot delete — this reward has ${pendingOrders.length} pending order(s). Fulfill or reject first.`,
      }
    }
    mockCatalog = mockCatalog.filter((p) => p.id !== rewardId)
    return { success: true }
  }

  if (isMockToken(token)) {
    return localDelete()
  }

  try {
    await pythia2Client.delete(PYTHIA_2_API.swagStore.reward(rewardId), {
      headers: { Authorization: `Bearer ${token}` },
      params: { store_id: storeId },
    })
    return { success: true }
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      return localDelete()
    }
    if (axios.isAxiosError(err) && err.response?.data?.detail) {
      return { success: false, reason: err.response.data.detail }
    }
    return { success: false, reason: 'Failed to delete reward.' }
  }
}

export async function redeemSwagReward({
  token,
  storeId,
  rewardId,
}: {
  token?: string
  storeId: string
  rewardId: string
}): Promise<SwagOrder> {
  const localRedeem = () => {
    const item = mockCatalog.find((i) => i.id === rewardId)
    if (!item) throw new Error('Reward not found')
    if (item.stock != null && item.stock <= 0) throw new Error('This reward is out of stock.')

    if (item.stock != null) {
      item.stock = Math.max(0, item.stock - 1)
    }

    const order: SwagOrder = {
      id: `ord_${Date.now()}`,
      productId: item.id,
      productName: item.name,
      productEmoji: item.emoji,
      category: item.category,
      employeeId: 'emp_current',
      employeeName: 'Marcus Reynolds',
      pointsCost: item.cost,
      status: 'pending',
      orderedAt: new Date().toISOString(),
    }
    mockOrders = [order, ...mockOrders]
    return order
  }

  if (isMockToken(token)) {
    return localRedeem()
  }

  try {
    const { data: res } = await pythia2Client.post<{ redemption: SwagRedemptionApi; success: boolean }>(
      PYTHIA_2_API.swagStore.redemptions,
      { reward_id: rewardId },
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { store_id: storeId },
      }
    )
    return fromApiRedemption(res.redemption)
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      return localRedeem()
    }
    if (axios.isAxiosError(err) && err.response?.data?.detail) {
      throw new Error(err.response.data.detail)
    }
    throw err
  }
}

export async function fetchMyRedemptions({
  token,
  storeId,
}: {
  token?: string
  storeId: string
}): Promise<SwagOrder[]> {
  if (isMockToken(token)) {
    return mockOrders
  }

  try {
    const { data } = await pythia2Client.get<{ redemptions: SwagRedemptionApi[]; count: number; success: boolean }>(
      PYTHIA_2_API.swagStore.myRedemptions,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { store_id: storeId },
      }
    )
    return (data.redemptions || []).map(fromApiRedemption)
  } catch {
    return mockOrders
  }
}

export async function fetchRedemptions({
  token,
  storeId,
  status,
}: {
  token?: string
  storeId: string
  status?: string
}): Promise<SwagOrder[]> {
  if (isMockToken(token)) {
    if (status && status !== 'all') {
      return mockOrders.filter((o) => o.status === status)
    }
    return mockOrders
  }

  try {
    const { data } = await pythia2Client.get<{ redemptions: SwagRedemptionApi[]; count: number; success: boolean }>(
      PYTHIA_2_API.swagStore.redemptions,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          store_id: storeId,
          status: status && status !== 'all' ? status : undefined,
        },
      }
    )
    return (data.redemptions || []).map(fromApiRedemption)
  } catch {
    if (status && status !== 'all') {
      return mockOrders.filter((o) => o.status === status)
    }
    return mockOrders
  }
}

export async function fulfillRedemption({
  token,
  storeId,
  redemptionId,
}: {
  token?: string
  storeId: string
  redemptionId: string
}): Promise<SwagOrder> {
  const localFulfill = () => {
    let target: SwagOrder | undefined
    mockOrders = mockOrders.map((o) => {
      if (o.id === redemptionId) {
        target = {
          ...o,
          status: 'completed',
          completedAt: new Date().toISOString(),
          fulfilledBy: 'Manager',
        }
        return target
      }
      return o
    })
    if (!target) throw new Error('Order not found')
    return target
  }

  if (isMockToken(token)) {
    return localFulfill()
  }

  try {
    const { data: res } = await pythia2Client.post<{ redemption: SwagRedemptionApi; success: boolean }>(
      PYTHIA_2_API.swagStore.fulfillRedemption(redemptionId),
      null,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { store_id: storeId },
      }
    )
    return fromApiRedemption(res.redemption)
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      return localFulfill()
    }
    if (axios.isAxiosError(err) && err.response?.data?.detail) {
      throw new Error(err.response.data.detail)
    }
    throw err
  }
}

export async function rejectRedemption({
  token,
  storeId,
  redemptionId,
}: {
  token?: string
  storeId: string
  redemptionId: string
}): Promise<SwagOrder> {
  const localReject = () => {
    let target: SwagOrder | undefined
    mockOrders = mockOrders.map((o) => {
      if (o.id === redemptionId) {
        target = {
          ...o,
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: 'Manager',
        }
        return target
      }
      return o
    })
    if (!target) throw new Error('Order not found')
    return target
  }

  if (isMockToken(token)) {
    return localReject()
  }

  try {
    const { data: res } = await pythia2Client.post<{ redemption: SwagRedemptionApi; success: boolean }>(
      PYTHIA_2_API.swagStore.rejectRedemption(redemptionId),
      null,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { store_id: storeId },
      }
    )
    return fromApiRedemption(res.redemption)
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      return localReject()
    }
    if (axios.isAxiosError(err) && err.response?.data?.detail) {
      throw new Error(err.response.data.detail)
    }
    throw err
  }
}

export async function cancelRedemption({
  token,
  storeId,
  redemptionId,
}: {
  token?: string
  storeId: string
  redemptionId: string
}): Promise<SwagOrder> {
  const localCancel = () => {
    let target: SwagOrder | undefined
    mockOrders = mockOrders.map((o) => {
      if (o.id === redemptionId) {
        target = {
          ...o,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancelledBy: 'Employee',
        }
        return target
      }
      return o
    })
    if (!target) throw new Error('Order not found')
    return target
  }

  if (isMockToken(token)) {
    return localCancel()
  }

  try {
    const { data: res } = await pythia2Client.post<{ redemption: SwagRedemptionApi; success: boolean }>(
      PYTHIA_2_API.swagStore.cancelRedemption(redemptionId),
      null,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { store_id: storeId },
      }
    )
    return fromApiRedemption(res.redemption)
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      return localCancel()
    }
    if (axios.isAxiosError(err) && err.response?.data?.detail) {
      throw new Error(err.response.data.detail)
    }
    throw err
  }
}

export async function fetchSwagStoreStats({
  token,
  storeId,
}: {
  token?: string
  storeId: string
}): Promise<SwagStoreStats> {
  const localCompute = () => {
    const activeRewards = mockCatalog.filter((i) => (i.status ?? 'active') === 'active').length
    const archivedRewards = mockCatalog.filter((i) => i.status === 'archived').length
    const pendingOrders = mockOrders.filter((o) => o.status === 'pending').length
    const completedOrders = mockOrders.filter((o) => o.status === 'completed').length
    const totalPointsClaimed = mockOrders.reduce((sum, o) => sum + (o.pointsCost || 0), 0)
    const employeesRewarded = new Set(
      mockOrders.filter((o) => o.status === 'completed').map((o) => o.employeeId || o.employeeName)
    ).size

    return {
      active_rewards: activeRewards,
      archived_rewards: archivedRewards,
      pending_fulfillment: pendingOrders,
      fulfilled_orders: completedOrders,
      total_orders: mockOrders.length,
      total_points_claimed: totalPointsClaimed,
      employees_rewarded: employeesRewarded,
    }
  }

  if (isMockToken(token)) {
    return localCompute()
  }

  try {
    const { data } = await pythia2Client.get<SwagStoreStats & { success: boolean }>(
      PYTHIA_2_API.swagStore.stats,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { store_id: storeId },
      }
    )
    return {
      active_rewards: data.active_rewards,
      archived_rewards: data.archived_rewards,
      pending_fulfillment: data.pending_fulfillment,
      fulfilled_orders: data.fulfilled_orders,
      total_orders: data.total_orders,
      total_points_claimed: data.total_points_claimed,
      employees_rewarded: data.employees_rewarded,
    }
  } catch {
    return localCompute()
  }
}
