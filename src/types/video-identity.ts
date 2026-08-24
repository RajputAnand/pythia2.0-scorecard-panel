// Pipeline verdict, straight off video_identity_metadata.status — the pipeline
// only exposes this binary decision, not a separate low/high-confidence tier
// within "identified".
export type VideoIdentityStatus = 'identified' | 'unknown'

// Only meaningful when status is "unknown": why no employee was matched.
// Always "identified" when status is "identified".
export type VideoIdentityReason = 'identified' | 'ambiguous_margin' | 'no_face_matched' | 'unregistered_face'

export interface VideoIdentityS3Ref {
  bucket: string
  key: string
}

// Raw shape returned by GET /video-identities — one entry per detection
// (a video can have more than one, hence grouped under VideoIdentityEntry.matches).
export interface VideoIdentityMatch {
  id: string
  user_id: string | null
  employee_name: string | null
  job_title: string | null
  status: VideoIdentityStatus
  reason: VideoIdentityReason | null
  // Raw pipeline match-scoring numbers, not a calibrated 0-100 confidence.
  similarity: number | null
  margin: number | null
  images: VideoIdentityS3Ref[]
  created_at: string
}

// One distinct video clip (video_identity_metadata documents grouped by video.key).
export interface VideoIdentityEntry {
  video_key: string
  video_bucket: string
  store_id: string
  device_id: string
  session_id: string
  recorded_at: string
  matches: VideoIdentityMatch[]
}

// Raw shape returned by GET /video-identities/stats
export interface VideoIdentityStats {
  total_videos: number
  identities_matched: number
  unmatched: number
  avg_similarity: number | null
}
