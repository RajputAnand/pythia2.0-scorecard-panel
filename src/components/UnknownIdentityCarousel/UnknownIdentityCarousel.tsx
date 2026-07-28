'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { trashUnknownIdentity } from '@/queries/unknown-identities'
import { useToast } from '@/context/ToastContext'
import type { UnknownIdentity } from '@/types/unknown-identity'
import { getS3AssetUrl } from '@/utils/common'

interface UnknownIdentityCarouselProps {
  identities: UnknownIdentity[]
  /** Overall count across all pages — may exceed identities.length while later pages are still loading. */
  total?: number
  activeIndex: number
  onSelectIndex: (index: number) => void
  /** Show the trash-can action in the header — off for the trashed-identities view (nothing left to trash there). */
  showTrashAction?: boolean
  /** Called after a successful trash, so the parent can refetch/advance past the now-removed identity. */
  onTrashed?: () => void
}

const STATUS_STYLES: Record<string, string> = {
  unresolved: 'bg-danger-light text-danger',
  resolved: 'bg-accent-light text-accent',
  trashed: 'bg-border text-muted',
}

// Beyond this count, showing one dot per identity overflows/wraps badly —
// collapse to a first…window…last layout instead (standard truncated pagination).
const MAX_DOTS = 12
const DOT_WINDOW = 5

function visibleDotIndices(total: number, activeIndex: number): (number | 'ellipsis')[] {
  if (total <= MAX_DOTS) return Array.from({ length: total }, (_, i) => i)

  const half = Math.floor(DOT_WINDOW / 2)
  let start = Math.max(1, activeIndex - half)
  const end = Math.min(total - 2, start + DOT_WINDOW - 1)
  start = Math.max(1, end - DOT_WINDOW + 1)

  const indices: (number | 'ellipsis')[] = [0]
  if (start > 1) indices.push('ellipsis')
  for (let i = start; i <= end; i++) indices.push(i)
  if (end < total - 2) indices.push('ellipsis')
  indices.push(total - 1)
  return indices
}

export default function UnknownIdentityCarousel({
  identities,
  total,
  activeIndex,
  onSelectIndex,
  showTrashAction = false,
  onTrashed,
}: UnknownIdentityCarouselProps) {
  const active = identities[activeIndex]
  const [renderedIndex, setRenderedIndex] = useState(activeIndex)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [renderedPhotoKey, setRenderedPhotoKey] = useState(`${activeIndex}-0`)
  const [imgFailed, setImgFailed] = useState(false)
  const [isTrashing, setIsTrashing] = useState(false)
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token
  const { showToast } = useToast()

  async function handleTrash() {
    if (!active || !token || isTrashing) return
    setIsTrashing(true)
    try {
      await trashUnknownIdentity({ token, identityId: active.id })
      showToast('Identity moved to trash')
      onTrashed?.()
    } catch {
      showToast('Failed to trash this identity. Please try again.')
    } finally {
      setIsTrashing(false)
    }
  }

  // Reset the photo carousel whenever the active identity changes.
  if (activeIndex !== renderedIndex) {
    setRenderedIndex(activeIndex)
    setPhotoIndex(0)
  }

  // Reset the broken-image fallback whenever the displayed photo changes.
  const photoKey = `${activeIndex}-${photoIndex}`
  if (photoKey !== renderedPhotoKey) {
    setRenderedPhotoKey(photoKey)
    setImgFailed(false)
  }

  if (!active) return null

  const loaded = identities.length
  const totalCount = total ?? loaded
  const photo = active.images[photoIndex]
  // Later pages may not be loaded yet — don't wrap past the end of what's
  // loaded so far if there's still more to fetch (see UnknownIdentitiesPanel).
  const hasMoreToLoad = totalCount > loaded
  const atLastLoaded = activeIndex === loaded - 1

  function goTo(index: number) {
    if (index >= loaded) {
      if (hasMoreToLoad) return
      onSelectIndex(0)
      return
    }
    onSelectIndex((index + loaded) % loaded)
  }

  return (
    <div className="min-w-0 bg-surface border border-border rounded-[14px] overflow-hidden flex flex-col">
      {/* Header — count only; the page Header already carries the section title */}
      <div className="flex items-center justify-between px-5 py-[10px] border-b border-border bg-surface-alt">
        <span className={`rounded-full px-[10px] py-[3px] text-[10px] font-semibold capitalize ${STATUS_STYLES[active.status] ?? 'bg-surface-alt text-secondary'}`}>
          {active.status}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-muted whitespace-nowrap">
            Identity {activeIndex + 1} of {totalCount}
          </span>
          {showTrashAction && (
            <div className="relative group">
              <button
                type="button"
                onClick={handleTrash}
                disabled={isTrashing}
                aria-label="Trash Id"
                className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full border border-border bg-surface text-secondary hover:text-danger hover:border-danger transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-default"
              >
                <svg className="w-[13px] h-[13px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
              <span className="pointer-events-none absolute top-full right-0 mt-1.5 whitespace-nowrap rounded-md bg-primary px-2 py-1 text-[10.5px] font-medium text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 z-10">
                Trash Id
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Slide */}
      <div className="flex items-center gap-3 px-5 py-5">
        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          disabled={loaded <= 1}
          aria-label="Previous identity"
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-border bg-surface text-secondary hover:text-primary hover:border-accent transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-default"
        >
          <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="flex-1 min-w-0 flex flex-col items-center gap-3">
          {/* Main photo */}
          <div className="relative w-full max-w-[320px] aspect-square rounded-[12px] overflow-hidden bg-surface-alt border border-border">
            {photo && !imgFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getS3AssetUrl(photo.s3_key)}
                alt={`${active.name} — photo ${photoIndex + 1}`}
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span className="text-[11px]">{photo ? 'Photo unavailable' : 'No photo'}</span>
              </div>
            )}
          </div>

          {/* Photo thumbnails — scrolls horizontally instead of forcing the card wider than its grid column */}
          {active.images.length > 1 && (
            <div className="w-full max-w-[320px] flex gap-2 overflow-x-auto pb-1">
              {active.images.map((img, i) => (
                <button
                  key={img.embedding_id ?? i}
                  type="button"
                  onClick={() => setPhotoIndex(i)}
                  className={`shrink-0 w-9 h-9 rounded-[7px] overflow-hidden border-2 cursor-pointer transition-colors duration-150 bg-surface-alt ${
                    i === photoIndex ? 'border-accent' : 'border-transparent hover:border-border'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getS3AssetUrl(img.s3_key)}
                    alt=""
                    onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="w-full max-w-[320px] flex flex-col gap-1 text-[11.5px] text-secondary">
            <div className="flex justify-between gap-2 min-w-0">
              <span className="text-muted shrink-0">Device</span>
              <span className="font-mono truncate" title={active.device_id}>{active.device_id}</span>
            </div>
            <div className="flex justify-between gap-2 min-w-0">
              <span className="text-muted shrink-0">Session</span>
              <span className="font-mono truncate" title={active.session_id}>{active.session_id}</span>
            </div>
            {photo && (
              <div className="flex justify-between gap-2 min-w-0">
                <span className="text-muted shrink-0">Captured</span>
                <span className="truncate">{new Date(photo.captured_at_utc).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          disabled={loaded <= 1 || (atLastLoaded && hasMoreToLoad)}
          aria-label="Next identity"
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-border bg-surface text-secondary hover:text-primary hover:border-accent transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-default"
        >
          <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Dot indicators — windowed (first…current±2…last) once the list gets large, so it never wraps/overflows */}
      {loaded > 1 && (
        <div className="flex items-center justify-center gap-[6px] pb-[16px]">
          {visibleDotIndices(loaded, activeIndex).map((i, pos) =>
            i === 'ellipsis' ? (
              <span key={`ellipsis-${pos}`} className="text-muted text-[10px] px-px select-none">
                …
              </span>
            ) : (
              <button
                key={identities[i].id}
                type="button"
                onClick={() => onSelectIndex(i)}
                aria-label={`Go to identity ${i + 1}`}
                className={`rounded-full shrink-0 transition-all duration-150 cursor-pointer ${
                  i === activeIndex ? 'w-5 h-2 bg-accent' : 'w-2 h-2 bg-border hover:bg-muted'
                }`}
              />
            ),
          )}
        </div>
      )}
    </div>
  )
}
