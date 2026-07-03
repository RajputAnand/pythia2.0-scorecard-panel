'use client'

import { useState } from 'react'
import type { UnknownIdentity } from '@/types/unknown-identity'
import { getS3AssetUrl } from '@/utils/common'

interface UnknownIdentityCarouselProps {
  identities: UnknownIdentity[]
  activeIndex: number
  onSelectIndex: (index: number) => void
}

const STATUS_STYLES: Record<string, string> = {
  unresolved: 'bg-danger-light text-danger',
  resolved: 'bg-accent-light text-accent',
}

export default function UnknownIdentityCarousel({ identities, activeIndex, onSelectIndex }: UnknownIdentityCarouselProps) {
  const active = identities[activeIndex]
  const [renderedIndex, setRenderedIndex] = useState(activeIndex)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [renderedPhotoKey, setRenderedPhotoKey] = useState(`${activeIndex}-0`)
  const [imgFailed, setImgFailed] = useState(false)

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

  const total = identities.length
  const photo = active.images[photoIndex]

  function goTo(index: number) {
    onSelectIndex((index + total) % total)
  }

  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden flex flex-col">
      {/* Header — count only; the page Header already carries the section title */}
      <div className="flex items-center justify-between px-5 py-[10px] border-b border-border bg-surface-alt">
        <span className={`rounded-full px-[10px] py-[3px] text-[10px] font-semibold capitalize ${STATUS_STYLES[active.status] ?? 'bg-surface-alt text-secondary'}`}>
          {active.status}
        </span>
        <span className="font-mono text-[11px] text-muted whitespace-nowrap">
          Identity {activeIndex + 1} of {total}
        </span>
      </div>

      {/* Slide */}
      <div className="flex items-center gap-3 px-5 py-5">
        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          disabled={total <= 1}
          aria-label="Previous identity"
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-border bg-surface text-secondary hover:text-primary hover:border-accent transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-default"
        >
          <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="flex-1 flex flex-col items-center gap-3">
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

          {/* Photo thumbnails */}
          {active.images.length > 1 && (
            <div className="flex gap-2">
              {active.images.map((img, i) => (
                <button
                  key={img.embedding_id ?? i}
                  type="button"
                  onClick={() => setPhotoIndex(i)}
                  className={`w-9 h-9 rounded-[7px] overflow-hidden border-2 cursor-pointer transition-colors duration-150 bg-surface-alt ${
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
            <div className="flex justify-between">
              <span className="text-muted">Device</span>
              <span className="font-mono">{active.device_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Session</span>
              <span className="font-mono">{active.session_id}</span>
            </div>
            {photo && (
              <div className="flex justify-between">
                <span className="text-muted">Captured</span>
                <span>{new Date(photo.captured_at_utc).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          disabled={total <= 1}
          aria-label="Next identity"
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-border bg-surface text-secondary hover:text-primary hover:border-accent transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-default"
        >
          <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-[6px] pb-[16px]">
          {identities.map((identity, i) => (
            <button
              key={identity.id}
              type="button"
              onClick={() => onSelectIndex(i)}
              aria-label={`Go to identity ${i + 1}`}
              className={`rounded-full transition-all duration-150 cursor-pointer ${
                i === activeIndex ? 'w-5 h-2 bg-accent' : 'w-2 h-2 bg-border hover:bg-muted'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
