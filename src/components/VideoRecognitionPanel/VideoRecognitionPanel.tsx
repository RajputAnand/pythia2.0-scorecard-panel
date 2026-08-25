'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { fetchVideoIdentities, fetchVideoIdentityStats, presignVideoIdentityKeys } from '@/queries/video-identities'
import { getAvatarColor, getInitialsFromDisplayName } from '@/utils/common'
import type { ApiResponseV2Paginated } from '@/types/api'
import type {
  VideoIdentityEntry,
  VideoIdentityMatch,
  VideoIdentityReason,
  VideoIdentityStats,
  VideoIdentityStatus,
} from '@/types/video-identity'

interface VideoRecognitionPanelProps {
  initialData: ApiResponseV2Paginated<VideoIdentityEntry[]> | null
  initialStats: VideoIdentityStats | null
}

const PAGE_SIZE = 50

const STATUS_FILTERS: { value: VideoIdentityStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'identified', label: 'Identified' },
  { value: 'unknown', label: 'Unmatched' },
]

const REASON_LABEL: Record<VideoIdentityReason, string> = {
  identified: 'Identified',
  ambiguous_margin: 'Ambiguous match',
  no_face_matched: 'No face matched',
  unregistered_face: 'Unregistered face',
}

function formatRecordedAt(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-[14px] p-4 flex gap-4">
          <div className="shrink-0 w-[168px] h-[104px] rounded-[10px] bg-border" />
          <div className="flex-1 flex flex-col gap-3">
            <div className="h-4 w-56 rounded bg-border" />
            <div className="h-3 w-40 rounded bg-border" />
            <div className="h-9 w-40 rounded-[10px] bg-border" />
          </div>
        </div>
      ))}
    </div>
  )
}

function PanelError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">⚠️</span>
      <p className="font-semibold text-[14px]">Failed to load video identities</p>
      <p className="text-[12px] text-muted">Check your connection and try again.</p>
      <button
        className="mt-1 rounded-[8px] border-0 bg-accent px-4 py-2 text-[12.5px] font-semibold text-white hover:opacity-85 cursor-pointer"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  )
}

interface MediaModalState {
  type: 'video' | 'images'
  urls: string[] | null
  loading: boolean
  error: boolean
}

// Wraps a `<video>`/`<img>` so the modal holds a fixed placeholder size (and
// shows a spinner) until the media element itself fires loaded/loadeddata —
// resolving the presigned URL only means the *link* is ready, not that the
// browser has finished downloading the file, so rendering the element at its
// natural size immediately made the modal flash small/collapsed first.
function MediaFrame({ loaded, children }: { loaded: boolean; children: React.ReactNode }) {
  return (
    <div className={`relative flex items-center justify-center ${loaded ? '' : 'h-56 w-56'}`}>
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      )}
      {children}
    </div>
  )
}

function MediaLightbox({ state, onClose }: { state: MediaModalState; onClose: () => void }) {
  const label = state.type === 'video' ? 'video' : 'photo'
  const [activeIndex, setActiveIndex] = useState(0)
  const [loadedUrls, setLoadedUrls] = useState<Set<string>>(new Set())
  const urls = state.urls ?? []

  function markLoaded(url: string) {
    setLoadedUrls((prev) => (prev.has(url) ? prev : new Set(prev).add(url)))
  }

  function goTo(index: number) {
    setActiveIndex((index + urls.length) % urls.length)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={state.type === 'video' ? 'Video playback' : 'Captured photos'}
    >
      <div className="relative max-h-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-surface text-secondary shadow-[0_2px_8px_rgba(26,23,20,0.25)] hover:text-primary cursor-pointer"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="max-h-full overflow-auto rounded-[14px] bg-surface p-4">
          {state.loading ? (
            <div className="flex h-56 w-56 items-center justify-center text-muted text-[12.5px]">Loading {label}…</div>
          ) : state.error || urls.length === 0 ? (
            <div className="flex h-56 w-56 flex-col items-center justify-center gap-2 text-muted">
              <span className="text-[24px]">⚠️</span>
              <span className="text-[12.5px]">{state.type === 'video' ? 'Video unavailable' : 'Photo unavailable'}</span>
            </div>
          ) : state.type === 'video' ? (
            <MediaFrame loaded={loadedUrls.has(urls[0])}>
              <video
                src={urls[0]}
                controls
                autoPlay
                onLoadedData={() => markLoaded(urls[0])}
                className={
                  loadedUrls.has(urls[0])
                    ? 'max-h-[70vh] max-w-full rounded-[10px]'
                    : 'absolute inset-0 h-full w-full object-contain opacity-0'
                }
              />
            </MediaFrame>
          ) : urls.length === 1 ? (
            <MediaFrame loaded={loadedUrls.has(urls[0])}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urls[0]}
                alt="Captured detection"
                onLoad={() => markLoaded(urls[0])}
                className={
                  loadedUrls.has(urls[0])
                    ? 'max-h-[70vh] max-w-full rounded-[10px] object-contain'
                    : 'absolute inset-0 h-full w-full object-contain opacity-0'
                }
              />
            </MediaFrame>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => goTo(activeIndex - 1)}
                  aria-label="Previous photo"
                  className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-border bg-surface text-secondary hover:text-primary hover:border-accent transition-colors duration-150 cursor-pointer"
                >
                  <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                <MediaFrame loaded={loadedUrls.has(urls[activeIndex])}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={urls[activeIndex]}
                    alt={`Captured detection ${activeIndex + 1} of ${urls.length}`}
                    onLoad={() => markLoaded(urls[activeIndex])}
                    className={
                      loadedUrls.has(urls[activeIndex])
                        ? 'max-h-[65vh] max-w-full rounded-[10px] object-contain'
                        : 'absolute inset-0 h-full w-full object-contain opacity-0'
                    }
                  />
                </MediaFrame>

                <button
                  type="button"
                  onClick={() => goTo(activeIndex + 1)}
                  aria-label="Next photo"
                  className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-border bg-surface text-secondary hover:text-primary hover:border-accent transition-colors duration-150 cursor-pointer"
                >
                  <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10.5px] text-muted mr-1">
                  {activeIndex + 1} of {urls.length}
                </span>
                {urls.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to photo ${i + 1}`}
                    className={`rounded-full shrink-0 transition-all duration-150 cursor-pointer ${
                      i === activeIndex ? 'w-5 h-2 bg-accent' : 'w-2 h-2 bg-border hover:bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VideoRecognitionPanel({ initialData, initialStats }: VideoRecognitionPanelProps) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [renderedSearch, setRenderedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<VideoIdentityStatus | 'all'>('all')

  const [entries, setEntries] = useState<VideoIdentityEntry[]>(initialData?.data ?? [])
  const [total, setTotal] = useState(initialData?.meta.total ?? 0)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isError, setIsError] = useState(false)

  const [stats, setStats] = useState<VideoIdentityStats | null>(initialStats)
  const [mediaModal, setMediaModal] = useState<MediaModalState | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  // Guards against overlapping requests landing out of order (e.g. React
  // Strict Mode's dev-only double-invoke of this effect fires two identical
  // fetches). Only the response from the latest dispatched request is ever
  // applied to state.
  const requestIdRef = useRef(0)

  const loadFirstPage = useCallback(() => {
    if (!token) return
    const requestId = ++requestIdRef.current
    setIsLoading(true)
    setIsError(false)
    fetchVideoIdentities({
      token,
      skip: 0,
      limit: PAGE_SIZE,
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: debouncedSearch,
    })
      .then((response) => {
        if (requestId !== requestIdRef.current) return
        setEntries(response.data)
        setTotal(response.meta.total)
      })
      .catch(() => {
        if (requestId === requestIdRef.current) setIsError(true)
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setIsLoading(false)
      })
  }, [token, statusFilter, debouncedSearch])

  // Reruns whenever the filter/search actually changes. Skips only the very
  // first run when server-fetched initialData already matches the default (no
  // filter, no search) state — must NOT also skip a later return to that same
  // default state (e.g. filter → All), or entries is left showing the stale
  // filtered list, which Load More would then append fresh unfiltered results
  // onto, producing overlapping/duplicate entries.
  const hasFetchedRef = useRef(false)
  useEffect(() => {
    const isInitialDefaultView = !hasFetchedRef.current && statusFilter === 'all' && debouncedSearch === '' && initialData
    hasFetchedRef.current = true
    if (isInitialDefaultView) return
    loadFirstPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter, debouncedSearch])

  useEffect(() => {
    if (!token || initialStats) return
    fetchVideoIdentityStats({ token })
      .then(setStats)
      .catch(() => {})
  }, [token, initialStats])

  if (debouncedSearch !== renderedSearch) {
    setRenderedSearch(debouncedSearch)
  }

  function loadMore() {
    if (!token || isLoadingMore) return
    const requestId = ++requestIdRef.current
    setIsLoadingMore(true)
    fetchVideoIdentities({
      token,
      skip: entries.length,
      limit: PAGE_SIZE,
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: debouncedSearch,
    })
      .then((response) => {
        if (requestId !== requestIdRef.current) return
        setEntries((prev) => [...prev, ...response.data])
        setTotal(response.meta.total)
      })
      .catch(() => {})
      .finally(() => {
        if (requestId === requestIdRef.current) setIsLoadingMore(false)
      })
  }

  // Presigns the video's key only now, on click — not eagerly for every listed
  // row — and plays it inline in a modal rather than opening a new tab: any
  // window.open (or a pre-opened blank tab's location reassigned later) issued
  // after the async presign call resolves gets silently blocked by Chromium's
  // popup blocker, since real network latency (even ~500-800ms) is enough for
  // the browser to no longer treat it as tied to the original click.
  function handleOpenVideo(videoKey: string) {
    if (!token) return
    setMediaModal({ type: 'video', urls: null, loading: true, error: false })
    presignVideoIdentityKeys({ token, keys: [videoKey] })
      .then((results) => {
        const url = results[0]?.url
        setMediaModal({ type: 'video', urls: url ? [url] : [], loading: false, error: !url })
      })
      .catch(() => setMediaModal({ type: 'video', urls: null, loading: false, error: true }))
  }

  function handleViewImages(keys: string[]) {
    if (!token) return
    setMediaModal({ type: 'images', urls: null, loading: true, error: false })
    presignVideoIdentityKeys({ token, keys })
      .then((results) => {
        const urls = keys.map((k) => results.find((r) => r.key === k)?.url).filter((u): u is string => Boolean(u))
        setMediaModal({ type: 'images', urls, loading: false, error: urls.length === 0 })
      })
      .catch(() => setMediaModal({ type: 'images', urls: null, loading: false, error: true }))
  }

  const statCards = [
    { key: 'videos', icon: '🎥', iconBg: 'bg-cobalt-light', label: 'Videos Received', value: stats?.total_videos ?? '—', valueColor: 'text-cobalt' },
    { key: 'identified', icon: '🪪', iconBg: 'bg-accent-light', label: 'Employees Identified', value: stats?.identities_matched ?? '—', valueColor: 'text-accent' },
    { key: 'unmatched', icon: '⚠️', iconBg: 'bg-amber-light', label: 'Employees Unidentified', value: stats?.unmatched ?? '—', valueColor: 'text-amber' },
    {
      key: 'similarity',
      icon: '🎯',
      iconBg: 'bg-purple-light',
      label: 'Avg. Similarity Score',
      value: stats?.avg_similarity != null ? stats.avg_similarity.toFixed(2) : '—',
      valueColor: 'text-purple',
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      {mediaModal && <MediaLightbox state={mediaModal} onClose={() => setMediaModal(null)} />}

      {/* Stat strip */}
      <div className="grid grid-cols-4 gap-[14px]">
        {statCards.map((card) => (
          <div key={card.key} className="bg-surface border border-border rounded-[13px] px-5 py-[18px] flex flex-col gap-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-medium text-muted uppercase tracking-[.07em]">{card.label}</span>
              <div className={`w-[27px] h-[27px] rounded-[8px] flex items-center justify-center text-[13px] ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>
            <div className={`text-[30px] font-semibold tracking-[-0.02em] leading-none ${card.valueColor}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-[320px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name or ID"
            className="w-full bg-surface border border-border rounded-lg pl-8 pr-3 py-[7px] text-[12.5px] text-primary placeholder:text-muted focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {STATUS_FILTERS.map((filter) => {
            const active = statusFilter === filter.value
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full px-[12px] py-[6px] text-[11.5px] font-medium cursor-pointer transition-colors duration-150 ${
                  active ? 'bg-primary text-white' : 'bg-surface-alt text-secondary hover:text-primary'
                }`}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Video list */}
      {isError ? (
        <PanelError onRetry={loadFirstPage} />
      ) : isLoading ? (
        <PanelSkeleton />
      ) : entries.length === 0 ? (
        <div className="bg-surface border border-border rounded-[14px] py-16 flex flex-col items-center justify-center gap-2 text-muted">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <rect x="2" y="5" width="15" height="14" rx="2" />
            <path d="M17 9l5-3v12l-5-3" />
          </svg>
          <span className="text-[12.5px]">No videos match your filters</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((entry) => (
            <VideoRecognitionCard
              key={entry.video_key}
              entry={entry}
              onOpenVideo={() => handleOpenVideo(entry.video_key)}
              onViewImages={handleViewImages}
            />
          ))}
          {entries.length < total && (
            <button
              type="button"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="self-center rounded-[8px] border border-border bg-surface px-4 py-2 text-[12.5px] font-semibold text-secondary hover:text-primary hover:bg-surface-alt transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-default"
            >
              {isLoadingMore ? 'Loading…' : `Load more (${entries.length} of ${total})`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

interface VideoRecognitionCardProps {
  entry: VideoIdentityEntry
  onOpenVideo: () => void
  onViewImages: (keys: string[]) => void
}

function VideoRecognitionCard({ entry, onOpenVideo, onViewImages }: VideoRecognitionCardProps) {
  const thumbColor = getAvatarColor(entry.video_key)

  return (
    <div className="bg-surface border border-border rounded-[14px] p-4 flex gap-4 flex-col sm:flex-row">
      {/* Thumbnail — presigns and plays the source clip inline on click */}
      <button
        type="button"
        onClick={onOpenVideo}
        aria-label={`Play video recorded ${formatRecordedAt(entry.recorded_at)}`}
        className="group shrink-0 relative w-full sm:w-[168px] h-[104px] rounded-[10px] overflow-hidden flex items-center justify-center cursor-pointer border-0 p-0"
        style={{ backgroundImage: `linear-gradient(135deg, ${thumbColor}, #1A1714)` }}
      >
        <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
          <svg className="w-3.5 h-3.5 text-primary translate-x-px" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </button>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <button
              type="button"
              onClick={onOpenVideo}
              className="cursor-pointer border-0 bg-transparent p-0 text-[13.5px] font-semibold text-primary hover:text-accent hover:underline underline-offset-2"
            >
              {formatRecordedAt(entry.recorded_at)}
            </button>
            <div className="text-[11.5px] text-secondary mt-0.5">Device {entry.device_id}</div>
          </div>
        </div>

        {/* Matched identities — a video can carry more than one */}
        <div className="flex flex-wrap gap-2">
          {entry.matches.map((match) => (
            <MatchChip key={match.id} match={match} onViewImages={onViewImages} />
          ))}
        </div>
      </div>
    </div>
  )
}

function MatchChip({ match, onViewImages }: { match: VideoIdentityMatch; onViewImages: (keys: string[]) => void }) {
  if (match.status === 'unknown') {
    return (
      <div className="flex items-center gap-2 bg-surface-alt border border-border rounded-[10px] pl-[7px] pr-[10px] py-[6px]">
        <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-border text-muted font-semibold text-[10.5px]">
          ?
        </div>
        <span className="rounded-full px-[8px] py-[2px] text-[9.5px] font-semibold whitespace-nowrap bg-amber-light text-amber">
          {REASON_LABEL[match.reason ?? 'no_face_matched']}
        </span>
        {match.images.length > 0 && (
          <ViewPhotoButton count={match.images.length} onClick={() => onViewImages(match.images.map((i) => i.key))} />
        )}
      </div>
    )
  }

  const avatarColor = getAvatarColor(match.user_id ?? match.id)
  const displayName = match.employee_name || 'Unknown'

  return (
    <div className="flex items-center gap-2 bg-surface-alt border border-border rounded-[10px] pl-[7px] pr-[10px] py-[6px]">
      <div
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-[10.5px]"
        style={{ backgroundColor: avatarColor }}
        title={displayName}
      >
        {getInitialsFromDisplayName(displayName)}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[12px] font-medium text-primary truncate">{displayName}</span>
        {match.user_id && <span className="font-mono text-[10px] text-muted truncate">{match.user_id}</span>}
      </div>
      <span className="rounded-full px-[8px] py-[2px] text-[9.5px] font-semibold whitespace-nowrap bg-accent-light text-accent">
        Identified
      </span>
      {match.images.length > 0 && (
        <ViewPhotoButton count={match.images.length} onClick={() => onViewImages(match.images.map((i) => i.key))} />
      )}
    </div>
  )
}

function ViewPhotoButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="View captured photo"
      aria-label="View captured photo"
      className="ml-1 flex shrink-0 items-center gap-1 rounded-full border border-accent/40 bg-accent-light px-[8px] py-[3px] text-[9.5px] font-semibold text-accent hover:bg-accent hover:text-white hover:border-accent transition-colors duration-150 cursor-pointer"
    >
      <svg className="w-[10px] h-[10px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      Photo{count > 1 ? ` (${count})` : ''}
    </button>
  )
}
