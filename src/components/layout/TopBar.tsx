import type { ReactNode } from 'react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function TopBar({ title, subtitle, children }: TopBarProps) {
  return (
    <div className="w-full flex flex-row justify-between items-center px-[32px] py-[16px] border-b border-[var(--color-border)]">
      {/* Left side - Title and subtitle */}
      <div className="flex flex-col">
        <h1 className="font-headline text-[20px] font-bold tracking-[2px] uppercase text-[var(--color-foreground)]">
          {title}
        </h1>
        {subtitle && (
          <p className="font-mono text-[13px] text-[var(--color-muted-foreground)] mt-[4px]">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side - User info and optional children */}
      <div className="flex items-center gap-[16px]">
        {children}
        <span className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
          Dr. Sarah Mitchell
        </span>
        <div className="w-[36px] h-[36px] bg-[#2596be] rounded-full flex items-center justify-center flex-shrink-0">
          <span className="font-headline text-[14px] font-bold text-[var(--color-brand-dark)]">
            SM
          </span>
        </div>
      </div>
    </div>
  );
}
