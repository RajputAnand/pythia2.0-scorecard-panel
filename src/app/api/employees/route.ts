import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'
import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { ApiEmployee } from '@/types/employee'

// The Pythia-2 backend is served over plain HTTP; the browser cannot call it
// directly from an HTTPS-deployed app (mixed-content block). This route runs
// server-side (Node has no such restriction) and proxies the request.
export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  const { searchParams } = new URL(request.url)

  try {
    const { data } = await pythia2Client.get<ApiResponseV2Paginated<ApiEmployee[]>>(
      PYTHIA_2_API.employees.list,
      {
        headers: authorization ? { Authorization: authorization } : undefined,
        params: {
          search: searchParams.get('search') || undefined,
          skip: searchParams.get('skip') ?? undefined,
          limit: searchParams.get('limit') ?? undefined,
        },
      },
    )
    return NextResponse.json(data)
  } catch (err) {
    const status = axios.isAxiosError(err) ? (err.response?.status ?? 500) : 500
    const message = axios.isAxiosError(err)
      ? (err.response?.data?.message ?? 'Failed to fetch employees')
      : 'Failed to fetch employees'
    return NextResponse.json({ success: false, message }, { status })
  }
}
