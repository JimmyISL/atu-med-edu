import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const transcriptData = [
  {
    id: 1,
    activity: 'Annual Cardiology Conference',
    course: 'CME-2025-001',
    provider: 'AMA',
    type: 'Category 1',
    credits: 24.0,
    value: 4800,
    date: 'Mar 15, 2025',
    status: 'COMPLETED',
  },
  {
    id: 2,
    activity: 'Advanced Surgical Techniques',
    course: 'CME-2025-002',
    provider: 'ACCME',
    type: 'Category 1',
    credits: 16.0,
    value: 3200,
    date: 'Mar 10, 2025',
    status: 'COMPLETED',
  },
  {
    id: 3,
    activity: 'Clinical Research Methodology',
    course: 'CME-2025-003',
    provider: 'NIH',
    type: 'Category 2',
    credits: 12.0,
    value: 2400,
    date: 'Mar 5, 2025',
    status: 'COMPLETED',
  },
  {
    id: 4,
    activity: 'Patient Safety & Quality',
    course: 'CME-2025-004',
    provider: 'Joint Commission',
    type: 'Category 1',
    credits: 8.0,
    value: 1600,
    date: 'Feb 28, 2025',
    status: 'COMPLETED',
  },
  {
    id: 5,
    activity: 'Medical Ethics Seminar',
    course: 'CME-2025-005',
    provider: 'AMA',
    type: 'Category 2',
    credits: 6.0,
    value: 1200,
    date: 'Feb 20, 2025',
    status: 'COMPLETED',
  },
  {
    id: 6,
    activity: 'Emergency Medicine Update',
    course: 'CME-2025-006',
    provider: 'ACEP',
    type: 'Category 1',
    credits: 20.0,
    value: 4000,
    date: 'Feb 15, 2025',
    status: 'COMPLETED',
  },
];

export default function Transcript() {
  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-headline text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">
              CME TRANSCRIPT
            </h1>
            <p className="mt-[4px] text-[14px] text-[var(--color-muted-foreground)]">
              Complete CME credit history.
            </p>
          </div>
          <button className="flex items-center gap-[8px] rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[10px] text-[14px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-secondary)]">
            <FileText className="h-[16px] w-[16px]" />
            EXPORT PDF
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px]">
        <div className="grid grid-cols-4 gap-[24px]">
          <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[20px]">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
              TOTAL CREDITS
            </p>
            <p className="mt-[8px] font-mono text-[32px] font-bold text-[var(--color-foreground)]">
              156.5
            </p>
          </div>
          <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[20px]">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
              CATEGORY 1
            </p>
            <p className="mt-[8px] font-mono text-[32px] font-bold text-[var(--color-foreground)]">
              120.0
            </p>
          </div>
          <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[20px]">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
              CATEGORY 2
            </p>
            <p className="mt-[8px] font-mono text-[32px] font-bold text-[var(--color-foreground)]">
              36.5
            </p>
          </div>
          <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[20px]">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
              TOTAL VALUE
            </p>
            <p className="mt-[8px] font-mono text-[32px] font-bold text-[var(--color-foreground)]">
              $31,200
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-[var(--color-background)] px-[32px] py-[24px]">
        <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  ACTIVITY
                </th>
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  COURSE
                </th>
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  PROVIDER
                </th>
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  TYPE
                </th>
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  CREDITS
                </th>
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  VALUE
                </th>
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  DATE
                </th>
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {transcriptData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-secondary)] last:border-0"
                >
                  <td className="px-[24px] py-[16px] text-[14px] font-medium text-[var(--color-foreground)]">
                    {item.activity}
                  </td>
                  <td className="px-[24px] py-[16px] font-mono text-[14px] text-[var(--color-muted-foreground)]">
                    {item.course}
                  </td>
                  <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                    {item.provider}
                  </td>
                  <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                    {item.type}
                  </td>
                  <td className="px-[24px] py-[16px] font-mono text-[14px] text-[var(--color-foreground)]">
                    {item.credits.toFixed(1)}
                  </td>
                  <td className="px-[24px] py-[16px] font-mono text-[14px] text-[var(--color-foreground)]">
                    ${item.value.toLocaleString()}
                  </td>
                  <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                    {item.date}
                  </td>
                  <td className="px-[24px] py-[16px]">
                    <span className="inline-flex rounded-[6px] bg-green-50 px-[8px] py-[4px] text-[12px] font-semibold uppercase text-green-600">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-[24px] flex items-center justify-between">
          <p className="text-[14px] text-[var(--color-muted-foreground)]">
            Showing <span className="font-medium text-[var(--color-foreground)]">1-6</span> of{' '}
            <span className="font-medium text-[var(--color-foreground)]">6</span> records
          </p>
          <div className="flex items-center gap-[8px]">
            <button className="flex h-[36px] w-[36px] items-center justify-center rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-secondary)]">
              <ChevronLeft className="h-[16px] w-[16px]" />
            </button>
            <button className="flex h-[36px] w-[36px] items-center justify-center rounded-[6px] bg-[var(--color-brand-accent)] font-medium text-[var(--color-foreground)]">
              1
            </button>
            <button className="flex h-[36px] w-[36px] items-center justify-center rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-secondary)]">
              <ChevronRight className="h-[16px] w-[16px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
