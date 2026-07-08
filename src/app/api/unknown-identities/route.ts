import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'
import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { UnknownIdentity } from '@/types/unknown-identity'

// See src/app/api/employees/route.ts — same mixed-content proxy rationale,
// needed here for the client-side background refetch (server prefetch in
// page.tsx calls pythia2Client directly and doesn't go through this route).
export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  const { searchParams } = new URL(request.url)

  try {
    const { data } = await pythia2Client.get<ApiResponseV2Paginated<UnknownIdentity[]>>(
      PYTHIA_2_API.unknownIdentities.list,
      {
        headers: authorization ? { Authorization: authorization } : undefined,
        params: {
          skip: searchParams.get('skip') ?? undefined,
          limit: searchParams.get('limit') ?? undefined,
        },
      },
    )
    return NextResponse.json(data)
  } catch (err) {
    const status = axios.isAxiosError(err) ? (err.response?.status ?? 500) : 500
    const message = axios.isAxiosError(err)
      ? (err.response?.data?.message ?? 'Failed to fetch unknown identities')
      : 'Failed to fetch unknown identities'
    return NextResponse.json({ success: false, message }, { status })
  }
}
