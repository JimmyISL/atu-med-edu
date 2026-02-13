import { ChevronLeft, ChevronRight } from 'lucide-react';

const distributions = [
  {
    id: 1,
    recipient: 'Dr. James Wilson',
    template: 'Certificate of Completion - Category 1',
    credentialNr: 'CRED-2025-001',
    credits: 24.0,
    value: 4800,
    issueDate: 'Mar 15, 2025',
    status: 'ISSUED',
  },
  {
    id: 2,
    recipient: 'Dr. Sarah Chen',
    template: 'Certificate of Completion - Category 1',
    credentialNr: 'CRED-2025-002',
    credits: 24.0,
    value: 4800,
    issueDate: 'Mar 15, 2025',
    status: 'ISSUED',
  },
  {
    id: 3,
    recipient: 'Dr. Michael Brown',
    template: 'Certificate of Completion - Category 2',
    credentialNr: 'CRED-2025-003',
    credits: 12.0,
    value: 2400,
    issueDate: 'Mar 10, 2025',
    status: 'PENDING',
  },
  {
    id: 4,
    recipient: 'Dr. Emily Davis',
    template: 'Advanced Training Certificate',
    credentialNr: 'CRED-2025-004',
    credits: 16.0,
    value: 3200,
    issueDate: 'Mar 8, 2025',
    status: 'ISSUED',
  },
  {
    id: 5,
    recipient: 'Dr. Robert Taylor',
    template: 'Professional Development Certificate',
    credentialNr: 'CRED-2025-005',
    credits: 8.0,
    value: 1600,
    issueDate: 'Mar 5, 2025',
    status: 'REVOKED',
  },
  {
    id: 6,
    recipient: 'Dr. Lisa Anderson',
    template: 'Certificate of Completion - Category 1',
    credentialNr: 'CRED-2025-006',
    credits: 20.0,
    value: 4000,
    issueDate: 'Mar 1, 2025',
    status: 'ISSUED',
  },
];

export default function Distribution() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return 'text-green-600 bg-green-50';
      case 'PENDING':
        return 'text-amber-600 bg-amber-50';
      case 'REVOKED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px]">
        <div>
          <h1 className="font-headline text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">
            CREDENTIAL DISTRIBUTION
          </h1>
          <p className="mt-[4px] text-[14px] text-[var(--color-muted-foreground)]">
            Issue and track credential distribution.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-[var(--color-background)] px-[32px] py-[24px]">
        <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  RECIPIENT
                </th>
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  TEMPLATE
                </th>
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  CREDENTIAL NR
                </th>
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  CREDITS
                </th>
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  VALUE
                </th>
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  ISSUE DATE
                </th>
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {distributions.map((item) => (
                <tr
                  key={item.id}
                  className="cursor-pointer border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-secondary)] last:border-0"
                >
                  <td className="px-[24px] py-[16px] text-[14px] font-medium text-[var(--color-foreground)]">
                    {item.recipient}
                  </td>
                  <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                    {item.template}
                  </td>
                  <td className="px-[24px] py-[16px] font-mono text-[14px] text-[var(--color-foreground)]">
                    {item.credentialNr}
                  </td>
                  <td className="px-[24px] py-[16px] font-mono text-[14px] text-[var(--color-foreground)]">
                    {item.credits.toFixed(1)}
                  </td>
                  <td className="px-[24px] py-[16px] font-mono text-[14px] text-[var(--color-foreground)]">
                    ${item.value.toLocaleString()}
                  </td>
                  <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                    {item.issueDate}
                  </td>
                  <td className="px-[24px] py-[16px]">
                    <span
                      className={`inline-flex rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold uppercase ${getStatusColor(
                        item.status
                      )}`}
                    >
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
            <span className="font-medium text-[var(--color-foreground)]">6</span> credentials
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
