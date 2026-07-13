'use client'

import Select from '@/components/shared/Select/Select'
import type { DataTableProps } from '@/types/data-table'

export default function DataTable<T,>({ columns, rows, getRowKey, pagination }: DataTableProps<T>) {
  return (
    // overflow-x-auto only — an overflow-hidden here would also clip
    // overflow-y, silently cutting off rows instead of letting the page
    // grow/scroll. Rounded corners come from rounding the outer cells
    // directly instead of relying on container clipping.
    <div className="rounded-[10px] border border-border bg-surface overflow-x-auto">
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="bg-surface-alt text-left">
            {columns.map((col, i) => (
              <th
                key={col.key}
                className={`px-4 py-[10px] font-medium text-secondary text-[11px] uppercase tracking-[.06em] ${
                  col.align === 'right' ? 'text-right' : ''
                } ${i === 0 ? 'rounded-tl-[10px]' : ''} ${i === columns.length - 1 ? 'rounded-tr-[10px]' : ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const isLastRow = rowIndex === rows.length - 1
            return (
              <tr key={getRowKey(row)} className="border-t border-border">
                {columns.map((col, i) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : ''} ${
                      !pagination && isLastRow && i === 0 ? 'rounded-bl-[10px]' : ''
                    } ${!pagination && isLastRow && i === columns.length - 1 ? 'rounded-br-[10px]' : ''}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>

        {pagination && (
          <tfoot>
            <tr className="border-t border-border bg-surface">
              <td colSpan={columns.length} className="px-4 py-[10px] rounded-b-[10px]">
                <div className="flex items-center justify-between gap-3">
                  {pagination.pageSizeOptions && pagination.onPageSizeChange ? (
                    <label className="flex items-center gap-[7px] text-[11.5px] text-secondary">
                      Rows per page
                      <Select
                        value={pagination.pageSize ?? pagination.pageSizeOptions[0]}
                        options={pagination.pageSizeOptions.map((size) => ({ label: String(size), value: size }))}
                        onChange={(v) => pagination.onPageSizeChange?.(Number(v))}
                        ariaLabel="Rows per page"
                      />
                    </label>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-4 ml-auto">
                    <span className="text-[11.5px] text-muted whitespace-nowrap">
                      Page {pagination.page + 1} of {pagination.totalPages} · {pagination.totalCount} results
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={pagination.onPrev}
                        disabled={pagination.page <= 0}
                        className="text-[12px] font-medium text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-default cursor-pointer"
                      >
                        ‹ Prev
                      </button>
                      <button
                        type="button"
                        onClick={pagination.onNext}
                        disabled={pagination.page + 1 >= pagination.totalPages}
                        className="text-[12px] font-medium text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-default cursor-pointer"
                      >
                        Next ›
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
