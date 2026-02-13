import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const activities = [
  {
    id: 1,
    name: 'Annual Cardiology Conference',
    provider: 'AMA',
    type: 'Category 1',
    credits: 24.0,
    value: 4800,
    date: 'Mar 15, 2025',
    status: 'APPROVED',
  },
  {
    id: 2,
    name: 'Advanced Surgical Techniques Workshop',
    provider: 'ACCME',
    type: 'Category 1',
    credits: 16.0,
    value: 3200,
    date: 'Mar 10, 2025',
    status: 'PENDING',
  },
  {
    id: 3,
    name: 'Clinical Research Methodology',
    provider: 'NIH',
    type: 'Category 2',
    credits: 12.0,
    value: 2400,
    date: 'Mar 5, 2025',
    status: 'APPROVED',
  },
  {
    id: 4,
    name: 'Patient Safety & Quality Improvement',
    provider: 'Joint Commission',
    type: 'Category 1',
    credits: 8.0,
    value: 1600,
    date: 'Feb 28, 2025',
    status: 'REJECTED',
  },
  {
    id: 5,
    name: 'Medical Ethics Seminar',
    provider: 'AMA',
    type: 'Category 2',
    credits: 6.0,
    value: 1200,
    date: 'Feb 20, 2025',
    status: 'APPROVED',
  },
  {
    id: 6,
    name: 'Emergency Medicine Update',
    provider: 'ACEP',
    type: 'Category 1',
    credits: 20.0,
    value: 4000,
    date: 'Feb 15, 2025',
    status: 'PENDING',
  },
];

export default function ActivitiesList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-50';
      case 'PENDING':
        return 'text-amber-600 bg-amber-50';
      case 'REJECTED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredActivities = activities.filter((activity) => {
    if (activeTab === 'all') return true;
    return activity.status.toLowerCase() === activeTab;
  });

  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-headline text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">
              CME ACTIVITIES
            </h1>
            <p className="mt-[4px] text-[14px] text-[var(--color-muted-foreground)]">
              Track continuing medical education activities.
            </p>
          </div>
          <button className="flex items-center gap-[8px] rounded-[8px] bg-[var(--color-primary)] px-[16px] py-[10px] text-[14px] font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90">
            <Plus className="h-[16px] w-[16px]" />
            LOG ACTIVITY
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px]">
        <div className="flex gap-[32px]">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'pending', label: 'Pending' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative border-b-2 px-[4px] py-[16px] text-[14px] font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--color-brand-accent)] text-[var(--color-foreground)]'
                  : 'border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-[var(--color-background)] px-[32px] py-[24px]">
        <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  ACTIVITY NAME
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
              {filteredActivities.map((activity) => (
                <tr
                  key={activity.id}
                  onClick={() => navigate(`/cme/${activity.id}`)}
                  className="cursor-pointer border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-secondary)]"
                >
                  <td className="px-[24px] py-[16px] text-[14px] font-medium text-[var(--color-foreground)]">
                    {activity.name}
                  </td>
                  <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                    {activity.provider}
                  </td>
                  <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                    {activity.type}
                  </td>
                  <td className="px-[24px] py-[16px] font-mono text-[14px] text-[var(--color-foreground)]">
                    {activity.credits.toFixed(1)}
                  </td>
                  <td className="px-[24px] py-[16px] font-mono text-[14px] text-[var(--color-foreground)]">
                    ${activity.value.toLocaleString()}
                  </td>
                  <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                    {activity.date}
                  </td>
                  <td className="px-[24px] py-[16px]">
                    <span
                      className={`inline-flex rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold uppercase ${getStatusColor(
                        activity.status
                      )}`}
                    >
                      {activity.status}
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
            <span className="font-medium text-[var(--color-foreground)]">6</span> activities
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
