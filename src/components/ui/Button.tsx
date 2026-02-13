import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function Button({ variant = 'default', size = 'default', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-mono text-[14px] font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

  const variants: Record<string, string> = {
    default: 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 rounded-[6px]',
    outline: 'border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] rounded-[6px] shadow-sm',
    ghost: 'text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] rounded-[6px]',
    destructive: 'bg-[var(--color-destructive)] text-white hover:opacity-90 rounded-[6px]',
  }

  const sizes: Record<string, string> = {
    default: 'px-[16px] py-[8px] gap-[6px]',
    sm: 'px-[12px] py-[6px] gap-[4px] text-[13px]',
    lg: 'px-[24px] py-[12px] gap-[8px] text-[16px]',
    icon: 'w-[36px] h-[36px] p-0',
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
