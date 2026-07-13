import type { ReactNode } from 'react'

export interface DataTableColumn<T> {
  key: string
  header: string
  align?: 'left' | 'right'
  render: (row: T) => ReactNode
}

export interface DataTablePagination {
  page: number
  totalPages: number
  totalCount: number
  onPrev: () => void
  onNext: () => void
  // Omit all three to pin a fixed page size with no "Rows per page" selector.
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  pagination?: DataTablePagination
}
