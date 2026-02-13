import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  width?: string
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 'w-[560px]',
  className = '',
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-[16px]"
      onClick={onClose}
    >
      <div
        className={`bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] shadow-xl ${width} max-w-full ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-[24px] py-[16px] border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-headline font-bold text-[18px] text-[var(--color-foreground)] uppercase tracking-wide">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <X className="w-[20px] h-[20px]" />
          </button>
        </div>

        <div className="px-[24px] py-[20px] overflow-y-auto max-h-[60vh]">
          {children}
        </div>

        {footer && (
          <div className="px-[24px] py-[16px] border-t border-[var(--color-border)] flex justify-end gap-[12px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
