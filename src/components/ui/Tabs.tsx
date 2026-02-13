interface Tab {
  key: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (key: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={`flex gap-0 border-b border-[var(--color-border)] ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-[16px] py-[8px] font-mono text-[13px] font-medium transition-colors ${
              isActive
                ? 'border-b-2 border-[var(--color-foreground)] text-[var(--color-foreground)]'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
