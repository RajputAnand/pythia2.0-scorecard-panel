export interface SelectOption {
  label: string
  value: string | number
}

export interface SelectProps {
  value: string | number
  options: SelectOption[]
  onChange: (value: string | number) => void
  ariaLabel?: string
}

export interface MultiSelectProps {
  /** Currently selected option values. */
  values: (string | number)[]
  options: SelectOption[]
  onChange: (values: (string | number)[]) => void
  /** Trigger text shown when nothing is selected. */
  placeholder?: string
  ariaLabel?: string
  /** Renders the trigger with a danger border to flag a validation error. */
  invalid?: boolean
}
