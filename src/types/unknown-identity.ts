export type UnknownIdentityStatus = 'unresolved' | 'resolved'

export interface UnknownIdentityImage {
  s3_bucket: string
  s3_key: string
  photo_index: number
  embedding_id: string | null
  captured_at_utc: string
}

export interface UnknownIdentityEmbedding {
  embedding_id: string
  path: string
  dim: number
  model: string
}

// Raw shape returned by the Pythia-2 /unknown-identities endpoint
export interface UnknownIdentity {
  id: string
  name: string
  role: string
  store_id: string
  device_id: string
  session_id: string
  video_source: string
  status: UnknownIdentityStatus
  user_id: string | null
  images: UnknownIdentityImage[]
  embeddings: UnknownIdentityEmbedding[]
}
