import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../api';

interface DistributionTemplate {
  name: string;
  category: string;
  issued_count: number;
  active_count: number;
  expired_count: number;
}

interface DistributionSummary {
  total: number;
  active: number;
  expired: number;
}

interface DistributionData {
  templates: DistributionTemplate[];
  summary: DistributionSummary;
}

export default function Distribution() {
  const navigate = useNavigate();
  const [data, setData] = useState<DistributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    api.credentials
      .distribution()
      .then((res: DistributionData) => {
        setData(res);
      })
      .catch(() => {
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

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

  const allTemplates = data?.templates ?? [];
  const summary = data?.summary ?? { total: 0, active: 0, expired: 0 };
  const totalRecords = allTemplates.length;

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
  const showingFrom = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, totalRecords);
  const templates = allTemplates.slice((page - 1) * limit, page * limit);

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

      {/* Summary */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[16px]">
        <div className="flex gap-[24px]">
          <div className="flex items-center gap-[8px]">
            <span className="text-[14px] text-[var(--color-muted-foreground)]">Total:</span>
            <span className="font-mono text-[14px] font-medium text-[var(--color-foreground)]">{summary.total}</span>
          </div>
          <div className="flex items-center gap-[8px]">
            <span className={`inline-flex rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold uppercase ${getStatusColor('ISSUED')}`}>ACTIVE</span>
            <span className="font-mono text-[14px] font-medium text-[var(--color-foreground)]">{summary.active}</span>
          </div>
          <div className="flex items-center gap-[8px]">
            <span className={`inline-flex rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold uppercase ${getStatusColor('REVOKED')}`}>EXPIRED</span>
            <span className="font-mono text-[14px] font-medium text-[var(--color-foreground)]">{summary.expired}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-[var(--color-background)] px-[32px] py-[24px]">
        {loading ? (
          <div className="flex items-center justify-center py-[48px]">
            <p className="text-[14px] text-[var(--color-muted-foreground)]">Loading distribution data...</p>
          </div>
        ) : (
          <>
            <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      TEMPLATE
                    </th>
                    <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      CATEGORY
                    </th>
                    <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      ISSUED
                    </th>
                    <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      ACTIVE
                    </th>
                    <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      EXPIRED
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((item, idx) => (
                    <tr
                      key={idx}
                      onClick={() => navigate('/credentials')}
                      className="cursor-pointer border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-secondary)] last:border-0"
                    >
                      <td className="px-[24px] py-[16px] text-[14px] font-medium text-[var(--color-foreground)]">
                        {item.name}
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                        {item.category}
                      </td>
                      <td className="px-[24px] py-[16px] font-mono text-[14px] text-[var(--color-foreground)]">
                        {item.issued_count}
                      </td>
                      <td className="px-[24px] py-[16px]">
                        <span
                          className={`inline-flex rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold uppercase ${getStatusColor('ISSUED')}`}
                        >
                          {item.active_count}
                        </span>
                      </td>
                      <td className="px-[24px] py-[16px]">
                        <span
                          className={`inline-flex rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold uppercase ${getStatusColor('REVOKED')}`}
                        >
                          {item.expired_count}
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
                {totalRecords === 0 ? (
                  'No credentials'
                ) : (
                  <>
                    Showing <span className="font-medium text-[var(--color-foreground)]">{showingFrom}-{showingTo}</span> of{' '}
                    <span className="font-medium text-[var(--color-foreground)]">{totalRecords}</span> credentials
                  </>
                )}
              </p>
              <div className="flex items-center gap-[8px]">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-[36px] w-[36px] items-center justify-center rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-[16px] w-[16px]" />
                </button>
                <button className="flex h-[36px] w-[36px] items-center justify-center rounded-[6px] bg-[var(--color-brand-accent)] font-medium text-[var(--color-foreground)]">
                  {page}
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-[36px] w-[36px] items-center justify-center rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-[16px] w-[16px]" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
