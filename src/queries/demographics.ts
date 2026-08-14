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
  try {
    const params = storeId ? { store_id: storeId } : undefined
    const res = await pythia2Client.get(PYTHIA_2_API.demographics.ageDistribution, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    })
    return res.data.data
  } catch (err) {
    console.error('Failed to fetch age distribution', err)
    return null
  }
}

export async function fetchGenderDistribution({ token, storeId }: FetchParams): Promise<GenderDistributionResponse | null> {
  try {
    const params = storeId ? { store_id: storeId } : undefined
    const res = await pythia2Client.get(PYTHIA_2_API.demographics.genderDistribution, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    })
    return res.data.data
  } catch (err) {
    console.error('Failed to fetch gender distribution', err)
    return null
  }
}

export async function fetchCustomerSegments({ token, storeId }: FetchParams): Promise<CustomerSegmentsResponse | null> {
  try {
    const params = storeId ? { store_id: storeId } : undefined
    const res = await pythia2Client.get(PYTHIA_2_API.demographics.customerSegments, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    })
    return res.data.data
  } catch (err) {
    console.error('Failed to fetch customer segments', err)
    return null
  }
}
