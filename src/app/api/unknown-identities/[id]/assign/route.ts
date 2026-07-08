import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'
import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2 } from '@/types/api'
import type { UnknownIdentity } from '@/types/unknown-identity'

// See src/app/api/employees/route.ts — same mixed-content proxy rationale.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const authorization = request.headers.get('authorization')
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')

  try {
    const { data } = await pythia2Client.post<ApiResponseV2<UnknownIdentity>>(
      PYTHIA_2_API.unknownIdentities.assign(id),
      undefined,
      {
        headers: authorization ? { Authorization: authorization } : undefined,
        params: { user_id: userId },
      },
    )
    return NextResponse.json(data)
  } catch (err) {
    const status = axios.isAxiosError(err) ? (err.response?.status ?? 500) : 500
    const message = axios.isAxiosError(err)
      ? (err.response?.data?.message ?? 'Failed to assign identity')
      : 'Failed to assign identity'
    return NextResponse.json({ success: false, message }, { status })
  }
}
