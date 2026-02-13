import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function Card({ title, subtitle, children, className = '' }: CardProps) {
  return (
    <div className={`bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-[24px] py-[20px] border-b border-[var(--color-border)]">
          {title && (
            <h3 className="font-headline text-[16px] font-bold text-[var(--color-foreground)] uppercase tracking-wide">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="font-mono text-[13px] text-[var(--color-muted-foreground)] mt-[4px]">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="px-[24px] py-[20px]">
        {children}
      </div>
    </div>
  )
}
