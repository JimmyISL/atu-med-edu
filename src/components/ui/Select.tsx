import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  options: SelectOption[]
  placeholder?: string
}

export function Select({ label, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block font-mono text-[14px] font-medium text-[var(--color-foreground)] mb-[8px]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full appearance-none border border-[var(--color-input)] rounded-[6px] px-[12px] py-[10px] pr-[36px] font-mono text-[14px] bg-[var(--color-background)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[var(--color-muted-foreground)] pointer-events-none"
        />
      </div>
    </div>
  )
}
