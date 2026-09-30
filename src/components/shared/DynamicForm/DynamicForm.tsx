'use client'

import { useState } from 'react'
import { useForm, type FieldValues, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { DynamicFormProps } from '@/types/dynamic-form'
import type { z } from 'zod'

// ---------------------------------------------------------------------------
// Eye icons (inline SVG — no extra dep)
// ---------------------------------------------------------------------------
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

/**
 * A generic, fully self-contained form component.
 *
 * - All RHF state lives here — consumers just pass field config + a submit
 *   handler that receives the validated values.
 * - Pass a `zodSchema` to enable automatic field-level validation via
 *   `zodResolver`. When omitted, raw string values are forwarded.
 * - Password fields automatically get a show/hide toggle button.
 */
export default function DynamicForm<T extends z.ZodTypeAny>({
  fields,
  zodSchema,
  onSubmit,
  submitLabel,
  loading = false,
  serverError,
}: DynamicFormProps<T>) {
  // Per-field visibility map (only relevant for password inputs)
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({})

  const toggleVisibility = (id: string) =>
    setVisibleFields((prev) => ({ ...prev, [id]: !prev[id] }))

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FieldValues>({
    ...(zodSchema ? { resolver: zodResolver(zodSchema as Parameters<typeof zodResolver>[0]) as unknown as Resolver<FieldValues> } : {}),
    mode: 'onBlur',
    defaultValues: Object.fromEntries(fields.map((f) => [f.id, f.defaultValue ?? ''])),
  })

  const pending = isSubmitting || loading

  const handleFormSubmit = handleSubmit((data) => onSubmit(data as z.infer<T>))

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-4" noValidate>
      {fields.map((field) => {
        const isPassword = field.type === 'password'
        const isVisible = visibleFields[field.id] ?? false
        const inputType = isPassword ? (isVisible ? 'text' : 'password') : field.type
        const hasError = !!errors[field.id]

        return (
          <div key={field.id} className="flex flex-col gap-[6px]">
            {/* Label row */}
            <div className="flex items-center justify-between">
              <label
                htmlFor={field.id}
                className="text-[12px] font-medium text-secondary uppercase tracking-[.07em]"
              >
                {field.label}
              </label>
              {field.labelSiblings?.map((sibling, i) => (
                <span key={i}>{sibling}</span>
              ))}
            </div>

            {/* Input wrapper (relative so toggle button can be absolutely positioned) */}
            <div className="relative">
              <input
                id={field.id}
                type={inputType}
                placeholder={field.placeholder}
                {...register(field.id)}
                className={`w-full bg-surface-alt border rounded-lg px-3 py-[10px] text-[13.5px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors ${
                  isPassword ? 'pr-10' : ''
                } ${hasError ? 'border-danger' : 'border-border'}`}
              />

              {/* Show / hide toggle for password fields */}
              {isPassword && (
                <button
                  type="button"
                  onClick={() => toggleVisibility(field.id)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-secondary transition-colors"
                  aria-label={isVisible ? 'Hide password' : 'Show password'}
                >
                  {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              )}
            </div>

            {/* Inline field error */}
            {hasError && (
              <p className="text-[11.5px] text-danger">
                {errors[field.id]?.message as string}
              </p>
            )}
          </div>
        )
      })}

      {/* Server-side / action error */}
      {serverError && (
        <p className="text-[12.5px] text-danger">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-full bg-accent text-white font-semibold text-[13.5px] rounded-lg py-[11px] hover:bg-accent-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? 'Please wait…' : submitLabel}
      </button>
    </form>
  )
}
