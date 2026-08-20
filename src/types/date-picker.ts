export interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  ariaLabel?: string
  min?: string
  max?: string
}
