import type { JSX } from 'react'
import type { z } from 'zod'

/** A single field descriptor passed to DynamicForm. */
export type FormField = {
  /** Unique HTML id — also used as the RHF field name, so must match your Zod schema key. */
  id: string
  /** Input type. "password" fields automatically receive a show/hide toggle button. */
  type: 'text' | 'email' | 'password'
  /** Label text or a JSX element (e.g. a label + link side-by-side). */
  label: string | JSX.Element
  /** Optional extra elements rendered beside the label (e.g. a "Forgot password?" link). */
  labelSiblings?: JSX.Element[]
  placeholder: string
}

/** Props accepted by DynamicForm. */
export type DynamicFormProps<T extends z.ZodTypeAny = any> = {
  /** Field descriptors — order determines render order. */
  fields: FormField[]
  /**
   * Optional Zod schema.  When provided:
   *  - validation runs on blur
   *  - field-level errors are displayed inline
   *  - the validated, typed data is passed to `onSubmit`
   *
   * When omitted the raw `Record<string, string>` values are passed instead.
   */
  zodSchema?: T
  /**
   * Called after successful validation (or immediately if no schema).
   * Receives the resolved field values keyed by `field.id`.
   */
  onSubmit: (values: z.infer<T>) => void | Promise<void>
  /** Label for the primary submit button. */
  submitLabel: string
  /** When true the submit button shows a loading state. */
  loading?: boolean
  /** A server-side error string displayed above the submit button. */
  serverError?: string
}
