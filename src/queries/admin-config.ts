import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'

export interface FieldConfig {
  role_name: string
  fields: Record<string, boolean>
}

interface FieldConfigsResponse {
  configs: FieldConfig[]
}

interface FieldConfigResponse {
  success: boolean
  config: FieldConfig
}

export async function fetchFieldConfigs(token: string): Promise<FieldConfig[]> {
  const { data } = await pythia2Client.get<FieldConfigsResponse>(PYTHIA_2_API.superAdmin.fieldConfig, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data.configs
}

export async function updateFieldConfig(
  roleName: string,
  fields: Record<string, boolean>,
  token: string
): Promise<FieldConfig> {
  const { data } = await pythia2Client.put<FieldConfigResponse>(
    PYTHIA_2_API.superAdmin.fieldConfigForRole(roleName),
    { fields },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return data.config
}
