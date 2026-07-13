'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { createEmployee, fetchEmployee } from '@/queries/employees'
import { createEmployeeSchema, type CreateEmployeeSchema } from '@/schemas/employee'
import DynamicForm from '@/components/shared/DynamicForm/DynamicForm'
import CredentialsReveal from '@/components/shared/CredentialsReveal/CredentialsReveal'
import { extractApiErrorMessage, getS3AssetUrl } from '@/utils/common'
import type { FormField } from '@/types/dynamic-form'
import type { ApiEmployee } from '@/types/employee'
import type { UnknownIdentityImage } from '@/types/unknown-identity'

const MAX_IMAGES = 5
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const FIELDS: FormField[] = [
  { id: 'firstName', type: 'text', label: 'First Name', placeholder: 'Jane' },
  { id: 'lastName', type: 'text', label: 'Last Name', placeholder: 'Doe' },
  { id: 'email', type: 'email', label: 'Email (optional)', placeholder: 'jane@example.com' },
  { id: 'phone', type: 'text', label: 'Phone (optional)', placeholder: '+1 555 0100' },
]

interface CreateEmployeeModalProps {
  token: string
  onClose: () => void
  onCreated: (employee: ApiEmployee) => void
  /** The unknown identity's own captured photos — prefilled as this employee's photos. */
  sourceImages?: UnknownIdentityImage[]
}

async function toFile(img: UnknownIdentityImage): Promise<File> {
  const res = await fetch(getS3AssetUrl(img.s3_key))
  if (!res.ok) throw new Error(`Failed to fetch ${img.s3_key}`)
  const blob = await res.blob()
  if (blob.size > MAX_IMAGE_SIZE) throw new Error(`${img.s3_key} exceeds the 5MB size limit`)
  const filename = img.s3_key.split('/').pop() || `photo-${img.photo_index}.jpg`
  return new File([blob], filename, { type: blob.type || 'image/jpeg' })
}

export default function CreateEmployeeModal({ token, onClose, onCreated, sourceImages }: CreateEmployeeModalProps) {
  const [step, setStep] = useState<'form' | 'credentials'>('form')
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | undefined>()
  const [images, setImages] = useState<File[]>([])
  const [imageError, setImageError] = useState<string | undefined>()
  const [isPrefillingPhotos, setIsPrefillingPhotos] = useState(!!sourceImages?.length)
  const [previews, setPreviews] = useState<string[]>([])
  const [tempPassword, setTempPassword] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const createdEmployeeRef = useRef<ApiEmployee | null>(null)

  // Pull this identity's own captured photos in as the new employee's photos,
  // so the manager doesn't have to re-upload what's already on file. Non-fatal
  // per-photo — a failed fetch (e.g. a CORS-restricted bucket) just falls back
  // to letting the manager add photos manually below.
  useEffect(() => {
    if (!sourceImages || sourceImages.length === 0) return
    let cancelled = false

    Promise.allSettled(sourceImages.slice(0, MAX_IMAGES).map(toFile)).then((results) => {
      if (cancelled) return
      const files = results
        .filter((r): r is PromiseFulfilledResult<File> => r.status === 'fulfilled')
        .map((r) => r.value)
      if (files.length > 0) setImages(files)
      if (files.length < sourceImages.length) {
        setImageError(
          files.length === 0
            ? "Couldn't load this identity's photos automatically — add them manually below."
            : `Loaded ${files.length} of ${sourceImages.length} photos from this identity.`,
        )
      }
      setIsPrefillingPhotos(false)
    })

    return () => {
      cancelled = true
    }
  }, [sourceImages])

  // Object URLs for thumbnail previews — regenerated whenever the file list changes.
  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [images])

  function handleFilesSelected(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return

    setImageError(undefined)
    const next = [...images]
    for (const file of files) {
      if (next.length >= MAX_IMAGES) {
        setImageError(`Maximum ${MAX_IMAGES} images allowed.`)
        break
      }
      if (!file.type.startsWith('image/')) {
        setImageError(`${file.name} is not a valid image.`)
        continue
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setImageError(`${file.name} exceeds the 5MB size limit.`)
        continue
      }
      next.push(file)
    }
    setImages(next)
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(values: CreateEmployeeSchema) {
    setServerError(undefined)
    setIsPending(true)
    try {
      const response = await createEmployee({
        token,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email || undefined,
        phone: values.phone || undefined,
        images,
      })
      // The create response only returns `user_id`, not the Mongo `_id` the
      // assign endpoint actually needs — fetch the full record so "select for
      // assignment" works. Non-fatal: if this lookup fails, the employee was
      // still created successfully; the manager just won't get auto-selected.
      try {
        createdEmployeeRef.current = await fetchEmployee({ token, userId: response.user_id })
      } catch {
        createdEmployeeRef.current = null
      }
      setTempPassword(response.temp_password)
      setStep('credentials')
    } catch (err) {
      setServerError(extractApiErrorMessage(err, 'Failed to create employee. Please try again.'))
    } finally {
      setIsPending(false)
    }
  }

  function handleDone() {
    if (createdEmployeeRef.current) onCreated(createdEmployeeRef.current)
    else onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-[440px] bg-surface border border-border rounded-2xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'form' ? (
          <>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[16px] font-semibold text-primary">New Employee</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-muted hover:text-primary cursor-pointer"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-[12.5px] text-muted mb-4">
              They&apos;ll be added to your store with a temporary password you can share below.
            </p>

            <DynamicForm
              fields={FIELDS}
              zodSchema={createEmployeeSchema}
              onSubmit={handleSubmit}
              submitLabel="Create Employee"
              loading={isPending}
              serverError={serverError}
            />

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-medium text-secondary uppercase tracking-[.07em]">
                  Photos (optional)
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= MAX_IMAGES}
                  className="text-[11.5px] font-semibold text-accent hover:text-accent-mid disabled:opacity-40 disabled:cursor-default cursor-pointer"
                >
                  + Add photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleFilesSelected}
                />
              </div>

              {isPrefillingPhotos && (
                <p className="text-[11.5px] text-muted mb-1">Loading photos from this identity…</p>
              )}

              {images.length > 0 && (
                <ul className="flex flex-wrap gap-2 mb-1">
                  {images.map((file, i) => (
                    <li
                      key={`${file.name}-${i}`}
                      className="relative w-14 h-14 rounded-[8px] overflow-hidden border border-border bg-surface-alt"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {previews[i] && (
                        <img src={previews[i]} alt={file.name} className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        aria-label={`Remove ${file.name}`}
                        className="absolute top-[2px] right-[2px] flex items-center justify-center w-[16px] h-[16px] rounded-full bg-black/60 text-white hover:bg-danger cursor-pointer"
                      >
                        <svg className="w-[9px] h-[9px]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {imageError && <p className="text-[11.5px] text-danger">{imageError}</p>}
              <p className="text-[11px] text-muted">Up to 5 images, 5MB each.</p>
            </div>
          </>
        ) : (
          <CredentialsReveal
            heading="Employee created"
            message="Share this temporary password with them securely — it can only be viewed again from the employee list until they change it."
            password={tempPassword}
            actionLabel="Done — select for assignment"
            onAction={handleDone}
          />
        )}
      </div>
    </div>
  )
}
