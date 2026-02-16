import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { api } from '../../api';

interface Activity {
  id: number;
  name: string;
  provider: string | null;
  activity_type: string | null;
  credits: number | null;
  value: number | null;
  activity_date: string | null;
  status: string | null;
}

const INITIAL_FORM = {
  name: '',
  provider: '',
  activity_type: 'Category 1',
  credits: '',
  value: '',
  activity_date: '',
  description: '',
  status: 'PENDING',
};

export default function ActivitiesList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchActivities = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };
    if (activeTab !== 'all') {
      params.status = activeTab;
    }
    if (search.trim()) {
      params.search = search.trim();
    }
    api.cme
      .list(params)
      .then((res: { data: Activity[]; total: number }) => {
        setActivities(res.data);
        setTotal(res.total);
      })
      .catch(() => {
        setActivities([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [activeTab, search, page, limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Reset page when tab or search changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.cme.create({
        ...form,
        credits: Number(form.credits),
        value: Number(form.value),
      });
      setShowModal(false);
      setForm(INITIAL_FORM);
      fetchActivities();
    } catch {
      // keep modal open on error
    } finally {
      setSubmitting(false);
    }
  };

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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const showingFrom = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, total);

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
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-[8px] rounded-[8px] bg-[var(--color-primary)] px-[16px] py-[10px] text-[14px] font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90"
          >
            <Plus className="h-[16px] w-[16px]" />
            LOG ACTIVITY
          </button>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px]">
        <div className="flex items-center justify-between">
          <div className="flex gap-[32px]">
            {[
              { id: 'all', label: 'All Activities' },
              { id: 'pending', label: 'Pending' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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
          <div className="relative">
            <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-[var(--color-muted-foreground)]" />
            <input
              type="text"
              placeholder="Search activities..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] py-[8px] pl-[36px] pr-[12px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-[var(--color-background)] px-[32px] py-[24px]">
        {loading ? (
          <div className="flex items-center justify-center py-[48px]">
            <p className="text-[14px] text-[var(--color-muted-foreground)]">Loading activities...</p>
          </div>
        ) : (
          <>
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
                  {activities.map((activity) => (
                    <tr
                      key={activity.id}
                      onClick={() => navigate(`/cme/${activity.id}`)}
                      className="cursor-pointer border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-secondary)]"
                    >
                      <td className="px-[24px] py-[16px] text-[14px] font-medium text-[var(--color-foreground)]">
                        {activity.name}
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                        {activity.provider || '\u2014'}
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                        {activity.activity_type || '\u2014'}
                      </td>
                      <td className="px-[24px] py-[16px] font-mono text-[14px] text-[var(--color-foreground)]">
                        {(Number(activity.credits) || 0).toFixed(1)}
                      </td>
                      <td className="px-[24px] py-[16px] font-mono text-[14px] text-[var(--color-foreground)]">
                        ${(Number(activity.value) || 0).toLocaleString()}
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                        {activity.activity_date ? formatDate(activity.activity_date) : '\u2014'}
                      </td>
                      <td className="px-[24px] py-[16px]">
                        <span
                          className={`inline-flex rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold uppercase ${getStatusColor(
                            (activity.status || '').toUpperCase()
                          )}`}
                        >
                          {(activity.status || 'UNKNOWN').toUpperCase()}
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
                {total === 0 ? (
                  'No activities'
                ) : (
                  <>
                    Showing <span className="font-medium text-[var(--color-foreground)]">{showingFrom}-{showingTo}</span> of{' '}
                    <span className="font-medium text-[var(--color-foreground)]">{total}</span> activities
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

      {/* Create Activity Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-[560px] rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-[24px] py-[16px]">
              <h2 className="text-[18px] font-bold text-[var(--color-foreground)]">Log CME Activity</h2>
              <button
                onClick={() => { setShowModal(false); setForm(INITIAL_FORM); }}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-secondary)]"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="space-y-[16px] px-[24px] py-[20px]">
              {/* Name */}
              <div>
                <label className="mb-[6px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Activity Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
                  placeholder="e.g. Advanced Cardiac Life Support"
                />
              </div>

              {/* Provider */}
              <div>
                <label className="mb-[6px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Provider
                </label>
                <input
                  type="text"
                  required
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
                  placeholder="e.g. AMA"
                />
              </div>

              {/* Type + Status row */}
              <div className="flex gap-[16px]">
                <div className="flex-1">
                  <label className="mb-[6px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Activity Type
                  </label>
                  <select
                    value={form.activity_type}
                    onChange={(e) => setForm({ ...form, activity_type: e.target.value })}
                    className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
                  >
                    <option value="Category 1">Category 1</option>
                    <option value="Category 2">Category 2</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-[6px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              {/* Credits + Value row */}
              <div className="flex gap-[16px]">
                <div className="flex-1">
                  <label className="mb-[6px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Credits
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: e.target.value })}
                    className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
                    placeholder="0.0"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-[6px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Value ($)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Activity Date */}
              <div>
                <label className="mb-[6px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Activity Date
                </label>
                <input
                  type="date"
                  required
                  value={form.activity_date}
                  onChange={(e) => setForm({ ...form, activity_date: e.target.value })}
                  className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-[6px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
                  placeholder="Optional description..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-[12px] pt-[8px]">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(INITIAL_FORM); }}
                  className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[10px] text-[14px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-[8px] bg-[var(--color-primary)] px-[16px] py-[10px] text-[14px] font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
