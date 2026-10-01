import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { 
  AgeDistributionResponse, 
  GenderDistributionResponse, 
  CustomerSegmentsResponse 
} from '@/types/demographics'

interface FetchParams {
  token: string;
  storeId?: string;
}

export async function fetchAgeDistribution({ token, storeId }: FetchParams): Promise<AgeDistributionResponse | null> {
  if (token.includes('demo-mock')) return {
    store_id: storeId || 'STORE-001', total_people: 128, windows: { baseline: { label: 'Previous period', start: '2026-09-01' }, current: { label: 'Current period', start: '2026-10-01' } },
    age_ranges: [
      { age_range: '18-34', baseline: { label: 'Previous', count: 42, percentage: 35 }, current: { label: 'Current', count: 48, percentage: 37.5 }, change: 2.5 },
      { age_range: '35-54', baseline: { label: 'Previous', count: 51, percentage: 42.5 }, current: { label: 'Current', count: 52, percentage: 40.6 }, change: -1.9 },
      { age_range: '55+', baseline: { label: 'Previous', count: 27, percentage: 22.5 }, current: { label: 'Current', count: 28, percentage: 21.9 }, change: -0.6 },
    ],
  }
  const params = storeId ? { store_id: storeId } : undefined
  const res = await pythia2Client.get(PYTHIA_2_API.demographics.ageDistribution, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  })
  return res.data.data
}

export async function fetchGenderDistribution({ token, storeId }: FetchParams): Promise<GenderDistributionResponse | null> {
  if (token.includes('demo-mock')) return {
    store_id: storeId || 'STORE-001', total_people: 128, windows: { baseline: { label: 'Previous period', start: '2026-09-01' }, current: { label: 'Current period', start: '2026-10-01' } },
    genders: [
      { gender: 'Female', baseline: { label: 'Previous', count: 65, percentage: 54.2 }, current: { label: 'Current', count: 70, percentage: 54.7 }, change: 0.5 },
      { gender: 'Male', baseline: { label: 'Previous', count: 52, percentage: 43.3 }, current: { label: 'Current', count: 54, percentage: 42.2 }, change: -1.1 },
      { gender: 'Other', baseline: { label: 'Previous', count: 3, percentage: 2.5 }, current: { label: 'Current', count: 4, percentage: 3.1 }, change: 0.6 },
    ],
  }
  const params = storeId ? { store_id: storeId } : undefined
  const res = await pythia2Client.get(PYTHIA_2_API.demographics.genderDistribution, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  })
  return res.data.data
}

export async function fetchCustomerSegments({ token, storeId }: FetchParams): Promise<CustomerSegmentsResponse | null> {
  if (token.includes('demo-mock')) return {
    store_id: storeId || 'STORE-001', windows: { baseline: { label: 'Previous period', start: '2026-09-01' }, current: { label: 'Current period', start: '2026-10-01' } },
    segments: [
      { segment_key: 'young_adults', age_range: '18-34', baseline_count: 42, current_count: 48, visit_growth_percentage: 14.3, avg_basket: 38.5 },
      { segment_key: 'adults', age_range: '35-54', baseline_count: 51, current_count: 52, visit_growth_percentage: 2, avg_basket: 52.1 },
      { segment_key: 'seniors', age_range: '55+', baseline_count: 27, current_count: 28, visit_growth_percentage: 3.7, avg_basket: 44.2 },
    ],
  }
  const params = storeId ? { store_id: storeId } : undefined
  const res = await pythia2Client.get(PYTHIA_2_API.demographics.customerSegments, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  })
  return res.data.data
}
