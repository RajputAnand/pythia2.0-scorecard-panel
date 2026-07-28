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
