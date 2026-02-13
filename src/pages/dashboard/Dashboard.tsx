import { Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../../auth';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col h-full bg-background">
      {/* TopBar */}
      <div className="flex justify-between items-center px-[32px] py-[16px] border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-headline text-[20px] font-bold tracking-[2px] text-foreground">
            DASHBOARD
          </h1>
          <p className="font-mono text-[13px] text-muted-foreground">
            Overview of your institution's activity.
          </p>
        </div>
        <div className="flex items-center gap-[16px]">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="font-mono text-[13px] pl-[36px] pr-[12px] py-[8px] w-[200px] bg-background border border-border rounded-[4px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          {/* Filter Dropdown */}
          <button className="font-mono text-[13px] px-[16px] py-[8px] bg-background border border-border rounded-[4px] text-foreground flex items-center gap-[8px] hover:bg-muted">
            This Week
            <ChevronDown className="w-[16px] h-[16px]" />
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-[12px]">
            <div className="w-[36px] h-[36px] rounded-full bg-[#FACC15] flex items-center justify-center font-mono text-[13px] font-bold text-black">
              {user?.initials ?? '??'}
            </div>
            <div className="font-mono text-[13px] text-foreground">
              {user?.name ?? 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-[24px] px-[32px] py-[24px]">
        {/* Stat Card 1 */}
        <div className="border border-border rounded-[8px] p-[20px] flex-1">
          <div className="font-mono text-[12px] text-muted-foreground tracking-[0.05em] uppercase mb-[8px]">
            TOTAL PERSONNEL
          </div>
          <div className="font-headline text-[32px] font-bold text-foreground">
            1,247
          </div>
          <div className="font-mono text-[12px] text-[#22C55E]">
            ↑ +4.2%
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="border border-border rounded-[8px] p-[20px] flex-1">
          <div className="font-mono text-[12px] text-muted-foreground tracking-[0.05em] uppercase mb-[8px]">
            ACTIVE COURSES
          </div>
          <div className="font-headline text-[32px] font-bold text-foreground">
            38
          </div>
          <div className="font-mono text-[12px] text-[#22C55E]">
            +3 this month
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="border border-border rounded-[8px] p-[20px] flex-1">
          <div className="font-mono text-[12px] text-muted-foreground tracking-[0.05em] uppercase mb-[8px]">
            MEETINGS THIS WEEK
          </div>
          <div className="font-headline text-[32px] font-bold text-foreground">
            12
          </div>
          <div className="font-mono text-[12px] text-muted-foreground">
            -2/3 ↓
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="border border-border rounded-[8px] p-[20px] flex-1">
          <div className="font-mono text-[12px] text-muted-foreground tracking-[0.05em] uppercase mb-[8px]">
            CME CREDITS PENDING
          </div>
          <div className="font-headline text-[32px] font-bold text-foreground">
            156
          </div>
          <div className="font-mono text-[12px] text-muted-foreground">
            24 awaiting review
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex gap-[24px] px-[32px] pb-[32px]">
        {/* Recent Meetings Table */}
        <div className="flex-1 border border-border rounded-[8px] p-[20px]">
          <h2 className="font-headline text-[16px] font-bold tracking-[1.5px] text-foreground mb-[16px]">
            RECENT MEETINGS
          </h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="font-mono text-[12px] text-muted-foreground tracking-[0.05em] uppercase text-left pb-[12px]">
                  MEETING
                </th>
                <th className="font-mono text-[12px] text-muted-foreground tracking-[0.05em] uppercase text-left pb-[12px]">
                  DATE
                </th>
                <th className="font-mono text-[12px] text-muted-foreground tracking-[0.05em] uppercase text-left pb-[12px]">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="font-mono text-[13px] text-foreground py-[12px]">
                  Anatomy Lab Review
                </td>
                <td className="font-mono text-[13px] text-muted-foreground py-[12px]">
                  2025-01-12
                </td>
                <td className="font-mono text-[13px] py-[12px]">
                  {/* No badge */}
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="font-mono text-[13px] text-foreground py-[12px]">
                  Cardiology Seminar
                </td>
                <td className="font-mono text-[13px] text-muted-foreground py-[12px]">
                  2025-03-04
                </td>
                <td className="font-mono text-[13px] py-[12px]">
                  <span className="inline-block px-[8px] py-[2px] bg-amber-500/20 text-amber-600 rounded-[4px] text-[11px] font-bold tracking-[0.05em]">
                    ALERT
                  </span>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="font-mono text-[13px] text-foreground py-[12px]">
                  Pharmacology Workshop
                </td>
                <td className="font-mono text-[13px] text-muted-foreground py-[12px]">
                  2025-02-26
                </td>
                <td className="font-mono text-[13px] py-[12px]">
                  <span className="inline-block px-[8px] py-[2px] bg-green-500/20 text-green-600 rounded-[4px] text-[11px] font-bold tracking-[0.05em]">
                    DONE
                  </span>
                </td>
              </tr>
              <tr>
                <td className="font-mono text-[13px] text-foreground py-[12px]">
                  Ethics Board Meeting
                </td>
                <td className="font-mono text-[13px] text-muted-foreground py-[12px]">
                  2025-03-05
                </td>
                <td className="font-mono text-[13px] py-[12px]">
                  <span className="inline-block px-[8px] py-[2px] bg-blue-500/20 text-blue-600 rounded-[4px] text-[11px] font-bold tracking-[0.05em]">
                    SCH
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Recent Activity */}
        <div className="w-[320px] border border-border rounded-[8px] p-[20px]">
          <h2 className="font-headline text-[16px] font-bold tracking-[1.5px] text-foreground mb-[16px]">
            RECENT ACTIVITY
          </h2>
          <div className="space-y-[8px]">
            {/* Activity Item 1 */}
            <div className="border-l-[4px] border-l-green-500 py-[12px] pl-[16px]">
              <div className="font-mono text-[13px] font-medium text-foreground">
                CME Credit Approved
              </div>
              <div className="font-mono text-[11px] text-muted-foreground mt-[4px]">
                Dr. Sarah Mitchell | Cat 1 Credits
              </div>
              <div className="font-mono text-[11px] text-muted-foreground mt-[2px]">
                2h ago
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="border-l-[4px] border-l-[#FACC15] py-[12px] pl-[16px]">
              <div className="font-mono text-[13px] font-medium text-foreground">
                New Doctor Added
              </div>
              <div className="font-mono text-[11px] text-muted-foreground mt-[4px]">
                Dr. James Wilson added to faculty
              </div>
              <div className="font-mono text-[11px] text-muted-foreground mt-[2px]">
                6h ago
              </div>
            </div>

            {/* Activity Item 3 */}
            <div className="border-l-[4px] border-l-amber-500 py-[12px] pl-[16px]">
              <div className="font-mono text-[13px] font-medium text-foreground">
                Meeting Pending
              </div>
              <div className="font-mono text-[11px] text-muted-foreground mt-[4px]">
                Cardiology dept meeting needs approval
              </div>
              <div className="font-mono text-[11px] text-muted-foreground mt-[2px]">
                1d ago
              </div>
            </div>

            {/* Activity Item 4 */}
            <div className="border-l-[4px] border-l-red-500 py-[12px] pl-[16px]">
              <div className="font-mono text-[13px] font-medium text-foreground">
                Credential Expired
              </div>
              <div className="font-mono text-[11px] text-muted-foreground mt-[4px]">
                Dr. Chen's board certification
              </div>
              <div className="font-mono text-[11px] text-muted-foreground mt-[2px]">
                2d ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
