import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { api } from '../../api';

interface DashboardStats {
  totalPersonnel: number;
  activeCourses: number;
  meetingsThisWeek: number;
  pendingCredits: number;
  incompletePeople: number;
}

interface RecentMeeting {
  id: number;
  title: string;
  meeting_date: string;
  status: string;
}

interface ActivityItem {
  type: string;
  title: string;
  detail: string;
  created_at: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentMeetings: RecentMeeting[];
  recentActivity: ActivityItem[];
  dateFiltered?: boolean;
}

type PresetKey = 'today' | 'week' | 'month' | 'custom';

function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekRange(): { from: string; to: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // shift to Monday
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: toLocalDateString(monday), to: toLocalDateString(sunday) };
}

function getMonthRange(): { from: string; to: string } {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: toLocalDateString(firstDay), to: toLocalDateString(lastDay) };
}

function getTodayRange(): { from: string; to: string } {
  const today = toLocalDateString(new Date());
  return { from: today, to: today };
}

function getMeetingsLabel(preset: PresetKey): string {
  switch (preset) {
    case 'today':
      return 'MEETINGS TODAY';
    case 'week':
      return 'MEETINGS THIS WEEK';
    case 'month':
      return 'MEETINGS THIS MONTH';
    case 'custom':
      return 'MEETINGS IN RANGE';
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

function getActivityBorderClass(type: string): string {
  switch (type) {
    case 'cme_credit':
      return 'border-l-green-500';
    case 'person_added':
      return 'border-l-[#FACC15]';
    case 'meeting_scheduled':
      return 'border-l-blue-500';
    default:
      return 'border-l-amber-500';
  }
}

function getMeetingStatusBadge(status: string): React.ReactNode {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');
  switch (normalized) {
    case 'COMPLETED':
      return (
        <span className="inline-block px-[8px] py-[2px] bg-green-500/20 text-green-600 rounded-[4px] text-[11px] font-bold tracking-[0.05em]">
          DONE
        </span>
      );
    case 'SCHEDULED':
      return (
        <span className="inline-block px-[8px] py-[2px] bg-blue-500/20 text-blue-600 rounded-[4px] text-[11px] font-bold tracking-[0.05em]">
          SCH
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-block px-[8px] py-[2px] bg-amber-500/20 text-amber-600 rounded-[4px] text-[11px] font-bold tracking-[0.05em]">
          ALERT
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-block px-[8px] py-[2px] bg-red-500/20 text-red-600 rounded-[4px] text-[11px] font-bold tracking-[0.05em]">
          CANCELLED
        </span>
      );
    default:
      return null;
  }
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Date range filter state - default to "This Week"
  const [activePreset, setActivePreset] = useState<PresetKey>('week');
  const [fromDate, setFromDate] = useState(() => getWeekRange().from);
  const [toDate, setToDate] = useState(() => getWeekRange().to);

  const fetchDashboard = useCallback((from: string, to: string) => {
    setLoading(true);
    api.dashboard({ from, to }).then((res: DashboardData) => {
      setData(res);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  // Initial load with "This Week" default
  useEffect(() => {
    fetchDashboard(fromDate, toDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePreset = (preset: PresetKey) => {
    let range: { from: string; to: string };
    switch (preset) {
      case 'today':
        range = getTodayRange();
        break;
      case 'week':
        range = getWeekRange();
        break;
      case 'month':
        range = getMonthRange();
        break;
      default:
        return;
    }
    setActivePreset(preset);
    setFromDate(range.from);
    setToDate(range.to);
    fetchDashboard(range.from, range.to);
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    const newFrom = field === 'from' ? value : fromDate;
    const newTo = field === 'to' ? value : toDate;
    if (field === 'from') setFromDate(value);
    if (field === 'to') setToDate(value);
    setActivePreset('custom');
    if (newFrom && newTo) {
      fetchDashboard(newFrom, newTo);
    }
  };

  const stats = data?.stats;
  const recentMeetings = data?.recentMeetings ?? [];
  const recentActivity = data?.recentActivity ?? [];
  const meetingsLabel = getMeetingsLabel(activePreset);

  return (
    <div className="flex flex-col h-full bg-[var(--color-background)]">
      {/* TopBar */}
      <div className="flex justify-between items-center px-[32px] py-[16px] border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-headline text-[20px] font-bold tracking-[2px] text-[var(--color-foreground)]">
            DASHBOARD
          </h1>
          <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
            Overview of your institution's activity.
          </p>
        </div>
        <div className="flex items-center gap-[16px]">
          {/* User Avatar */}
          <div className="flex items-center gap-[12px]">
            <div className="w-[36px] h-[36px] rounded-full bg-[#FACC15] flex items-center justify-center font-mono text-[13px] font-bold text-black">
              {user?.initials ?? '??'}
            </div>
            <div className="font-mono text-[13px] text-[var(--color-foreground)]">
              {user?.name ?? 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="flex items-center gap-[12px] px-[32px] py-[12px] border-b border-[var(--color-border)]">
        <span className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mr-[4px]">
          RANGE
        </span>

        {/* Preset Buttons */}
        {([
          { key: 'today' as PresetKey, label: 'Today' },
          { key: 'week' as PresetKey, label: 'This Week' },
          { key: 'month' as PresetKey, label: 'This Month' },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handlePreset(key)}
            className={`font-mono text-[12px] tracking-[0.05em] px-[12px] py-[6px] rounded-[6px] border transition-colors cursor-pointer ${
              activePreset === key
                ? 'bg-[#FACC15] text-[#09090B] border-[#FACC15] font-bold'
                : 'bg-transparent text-[var(--color-muted-foreground)] border-[var(--color-border)] hover:border-[#FACC15]/50 hover:text-[var(--color-foreground)]'
            }`}
          >
            {label}
          </button>
        ))}

        <div className="w-[1px] h-[24px] bg-[var(--color-border)] mx-[4px]" />

        {/* Date Inputs */}
        <label className="font-mono text-[11px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase">
          FROM
        </label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => handleDateChange('from', e.target.value)}
          className="font-mono text-[12px] bg-[var(--color-background)] text-[var(--color-foreground)] border border-[var(--color-border)] rounded-[6px] px-[8px] py-[5px] outline-none focus:border-[#FACC15] transition-colors"
        />
        <label className="font-mono text-[11px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase">
          TO
        </label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => handleDateChange('to', e.target.value)}
          className="font-mono text-[12px] bg-[var(--color-background)] text-[var(--color-foreground)] border border-[var(--color-border)] rounded-[6px] px-[8px] py-[5px] outline-none focus:border-[#FACC15] transition-colors"
        />
      </div>

      {/* Stats Row */}
      <div className="flex gap-[24px] px-[32px] py-[24px]">
        {/* Stat Card 1 */}
        <div className="border border-[var(--color-border)] rounded-[8px] p-[20px] flex-1">
          <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[8px]">
            TOTAL PERSONNEL
          </div>
          <div className="font-headline text-[32px] font-bold text-[var(--color-foreground)]">
            {stats?.totalPersonnel?.toLocaleString() ?? '—'}
          </div>
          <div className="font-mono text-[12px] text-[var(--color-muted-foreground)]">
            {stats?.incompletePeople ? `${stats.incompletePeople} incomplete` : '\u00A0'}
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="border border-[var(--color-border)] rounded-[8px] p-[20px] flex-1">
          <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[8px]">
            ACTIVE COURSES
          </div>
          <div className="font-headline text-[32px] font-bold text-[var(--color-foreground)]">
            {stats?.activeCourses?.toLocaleString() ?? '—'}
          </div>
          <div className="font-mono text-[12px] text-[var(--color-muted-foreground)]">
            &nbsp;
          </div>
        </div>

        {/* Stat Card 3 - dynamic label */}
        <div className="border border-[var(--color-border)] rounded-[8px] p-[20px] flex-1">
          <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[8px]">
            {meetingsLabel}
          </div>
          <div className="font-headline text-[32px] font-bold text-[var(--color-foreground)]">
            {loading ? '...' : (stats?.meetingsThisWeek?.toLocaleString() ?? '—')}
          </div>
          <div className="font-mono text-[12px] text-[var(--color-muted-foreground)]">
            &nbsp;
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="border border-[var(--color-border)] rounded-[8px] p-[20px] flex-1">
          <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[8px]">
            CME CREDITS PENDING
          </div>
          <div className="font-headline text-[32px] font-bold text-[var(--color-foreground)]">
            {stats?.pendingCredits?.toLocaleString() ?? '—'}
          </div>
          <div className="font-mono text-[12px] text-[var(--color-muted-foreground)]">
            &nbsp;
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex gap-[24px] px-[32px] pb-[32px]">
        {/* Recent Meetings Table */}
        <div className="flex-1 border border-[var(--color-border)] rounded-[8px] p-[20px]">
          <h2 className="font-headline text-[16px] font-bold tracking-[1.5px] text-[var(--color-foreground)] mb-[16px]">
            RECENT MEETINGS
          </h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase text-left pb-[12px]">
                  MEETING
                </th>
                <th className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase text-left pb-[12px]">
                  DATE
                </th>
                <th className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase text-left pb-[12px]">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {recentMeetings.map((meeting, idx) => (
                <tr
                  key={meeting.id}
                  onClick={() => navigate(`/meetings/${meeting.id}`)}
                  className={`cursor-pointer hover:bg-[var(--color-muted)] transition-colors ${idx < recentMeetings.length - 1 ? 'border-b border-[var(--color-border)]' : ''}`}
                >
                  <td className="font-mono text-[13px] text-[var(--color-foreground)] py-[12px]">
                    {meeting.title}
                  </td>
                  <td className="font-mono text-[13px] text-[var(--color-muted-foreground)] py-[12px]">
                    {formatDate(meeting.meeting_date)}
                  </td>
                  <td className="font-mono text-[13px] py-[12px]">
                    {getMeetingStatusBadge(meeting.status)}
                  </td>
                </tr>
              ))}
              {recentMeetings.length === 0 && (
                <tr>
                  <td colSpan={3} className="font-mono text-[13px] text-[var(--color-muted-foreground)] py-[12px] text-center">
                    No meetings in selected range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Activity */}
        <div className="w-[320px] border border-[var(--color-border)] rounded-[8px] p-[20px]">
          <h2 className="font-headline text-[16px] font-bold tracking-[1.5px] text-[var(--color-foreground)] mb-[16px]">
            RECENT ACTIVITY
          </h2>
          <div className="space-y-[8px]">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className={`border-l-[4px] ${getActivityBorderClass(activity.type)} py-[12px] pl-[16px]`}>
                <div className="font-mono text-[13px] font-medium text-[var(--color-foreground)]">
                  {activity.title}
                </div>
                <div className="font-mono text-[11px] text-[var(--color-muted-foreground)] mt-[4px]">
                  {activity.detail}
                </div>
                <div className="font-mono text-[11px] text-[var(--color-muted-foreground)] mt-[2px]">
                  {formatRelativeTime(activity.created_at)}
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="font-mono text-[13px] text-[var(--color-muted-foreground)] py-[12px] text-center">
                No activity in selected range
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
