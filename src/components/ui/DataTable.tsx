import type { ReactNode } from 'react'

interface Column {
  key: string
  label: string
  width?: string
}

interface DataTableProps<T = any> {
  columns: Column[]
  data: T[]
  onRowClick?: (row: T) => void
  renderCell?: (column: Column, row: T, value: any) => ReactNode
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  renderCell,
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[var(--color-secondary)]">
            {columns.map((column) => (
              <th
                key={column.key}
                className="font-mono text-[12px] font-medium text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase px-[16px] py-[10px] text-left"
                style={column.width ? { width: column.width } : undefined}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-[var(--color-border)] transition-colors ${
                onRowClick ? 'hover:bg-[var(--color-secondary)]/50 cursor-pointer' : ''
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="font-mono text-[13px] text-[var(--color-foreground)] px-[16px] py-[12px]"
                >
                  {renderCell ? renderCell(column, row, row[column.key]) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
