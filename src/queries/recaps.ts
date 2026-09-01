import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'

export interface Demo {
  id: string
  email: string
  name: string
  startTime: string
  eventName: string
}

export async function getRecentDemos(token: string, pageToken?: string, pageSize: number = 10): Promise<{ success: boolean; demos?: Demo[]; nextPageToken?: string | null; message?: string }> {
  try {
    const params = new URLSearchParams()
    params.append('pageSize', pageSize.toString())
    if (pageToken) params.append('pageToken', pageToken)

    const { data } = await pythia2Client.get(
      `${PYTHIA_2_API.superAdmin.demos}?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return data
  } catch (error: any) {
    return { success: false, message: error.response?.data?.detail || 'Server error' }
  }
}

export async function sendManualRecap(
  token: string,
  email: string,
  firstName: string,
  recap1: string,
  recap2: string,
  recap3: string = "",
  recap4: string = "",
  recap5: string = ""
): Promise<{ success: boolean; message?: string }> {
  try {
    const { data } = await pythia2Client.post(
      PYTHIA_2_API.superAdmin.manualSend,
      { email, firstName, recap1, recap2, recap3, recap4, recap5 },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return data
  } catch (error: any) {
    return { success: false, message: error.response?.data?.detail || 'Server error' }
  }
}

export async function triggerSequenceThreeBulk(token: string, emails: string[]): Promise<{ success: boolean; message?: string }> {
  try {
    const { data } = await pythia2Client.post(
      PYTHIA_2_API.superAdmin.bulkTrigger,
      { emails },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return data
  } catch (error: any) {
    return { success: false, message: error.response?.data?.detail || 'Server error' }
  }
}

export async function getSentRecapIds(token: string): Promise<{ success: boolean; data?: string[]; message?: string }> {
  try {
    const { data } = await pythia2Client.get(
      PYTHIA_2_API.superAdmin.sentStatus,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return data
  } catch (error: any) {
    return { success: false, message: error.response?.data?.detail || 'Server error' }
  }
}

export async function markRecapAsSentInDB(token: string, eventId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const { data } = await pythia2Client.post(
      PYTHIA_2_API.superAdmin.sentStatus,
      { calendly_event_id: eventId },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return data
  } catch (error: any) {
    return { success: false, message: error.response?.data?.detail || 'Server error' }
  }
}
