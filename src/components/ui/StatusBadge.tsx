interface StatusBadgeProps {
  status: string
  color: 'green' | 'red' | 'blue' | 'amber' | 'yellow' | 'purple'
  className?: string
}

export function StatusBadge({ status, color, className = '' }: StatusBadgeProps) {
  const colorStyles: Record<string, string> = {
    green: 'bg-[#22C55E]/10 text-[#22C55E]',
    red: 'bg-[#EF4444]/10 text-[#EF4444]',
    blue: 'bg-[#3B82F6]/10 text-[#3B82F6]',
    amber: 'bg-[#D97706]/10 text-[#D97706]',
    yellow: 'bg-[#2596be]/10 text-[#2596be]',
    purple: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-[10px] py-[2px] font-mono text-[12px] font-medium tracking-wide uppercase ${colorStyles[color]} ${className}`}
    >
      {status}
    </span>
  )
}
