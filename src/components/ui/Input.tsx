import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block font-mono text-[14px] font-medium text-[var(--color-foreground)] mb-[8px]">
          {label}
        </label>
      )}
      <input
        className={`w-full border border-[var(--color-input)] rounded-[6px] px-[12px] py-[10px] font-mono text-[14px] bg-[var(--color-background)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors ${className}`}
        {...props}
      />
    </div>
  )
}
