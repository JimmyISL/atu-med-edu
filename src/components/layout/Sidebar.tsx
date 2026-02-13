import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Award,
  FileCheck,
  Settings,
  ChevronsUpDown,
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Users, label: 'HR / People', path: '/hr' },
      { icon: BookOpen, label: 'Courses', path: '/courses' },
      { icon: Calendar, label: 'Meetings', path: '/meetings' },
      { icon: Award, label: 'CME', path: '/cme' },
      { icon: FileCheck, label: 'Credentials', path: '/credentials' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [{ icon: Settings, label: 'Settings', path: '/settings' }],
  },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="w-[256px] h-full flex flex-col bg-[var(--color-sidebar)] border-r border-[var(--color-sidebar-border)]">
      {/* Header */}
      <div className="p-[8px]">
        <div className="flex items-center gap-[12px] mb-[8px]">
          <div className="w-[32px] h-[32px] bg-[#FACC15] rounded-[4px] flex-shrink-0"></div>
          <span className="font-headline text-[16px] font-bold tracking-[2px] text-[var(--color-sidebar-foreground)]">
            ATU MedEd
          </span>
        </div>
        <div className="flex items-center justify-center p-[4px]">
          <ChevronsUpDown className="w-[16px] h-[16px] text-[var(--color-sidebar-foreground)]" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-[8px] flex flex-col gap-[2px]">
        {navSections.map((section) => (
          <div key={section.title} className="mb-[8px]">
            <div className="font-mono text-[12px] font-medium text-[var(--color-muted-foreground)] tracking-wide uppercase px-[8px] py-[8px]">
              {section.title}
            </div>
            <div className="flex flex-col gap-[2px]">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <div
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-[8px] px-[8px] py-[6px] rounded-[6px] font-mono text-[14px] cursor-pointer ${
                      isActive
                        ? 'bg-[var(--color-sidebar-accent)] text-[var(--color-sidebar-accent-foreground)]'
                        : 'text-[var(--color-sidebar-foreground)] hover:bg-[var(--color-sidebar-accent)]'
                    }`}
                  >
                    <Icon className="w-[16px] h-[16px]" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-[8px]">
        <div className="flex items-center justify-between gap-[12px]">
          <div className="flex items-center gap-[12px]">
            <div className="w-[40px] h-[40px] bg-[#FACC15] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="font-headline text-[16px] font-bold text-[var(--color-brand-dark)]">
                SM
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-[13px] font-medium text-[var(--color-sidebar-foreground)] truncate">
                Dr. Sarah Mitchell
              </span>
              <span className="font-mono text-[11px] text-[var(--color-muted-foreground)] truncate">
                Program Director
              </span>
            </div>
          </div>
          <ChevronsUpDown className="w-[16px] h-[16px] text-[var(--color-sidebar-foreground)] flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
