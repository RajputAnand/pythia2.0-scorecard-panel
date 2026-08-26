export interface ShiftHighlight {
  time: string
  score: number
  band: 'good' | 'warn' | 'bad'
  /** Use **text** for bold segments */
  text: string
}

// Raw shape of GET /dashboard/shift-summary/highlights.
export interface ShiftHighlightsResponse {
  success: boolean
  events: ShiftHighlight[]
  cached: boolean
  generation_in_progress: boolean
  generated_at: string | null
}

export interface ShiftHighlightsResult {
  items: ShiftHighlight[]
  generationInProgress: boolean
}
