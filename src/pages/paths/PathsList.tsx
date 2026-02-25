import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import { api } from '../../api';

interface Path {
  id: number;
  name: string;
  description: string;
  status: string;
  phase_count: number;
  step_count: number;
  trainee_count: number;
  creator_name: string;
  created_at: string;
}

function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'text-green-600 bg-green-50';
    case 'DRAFT':
      return 'text-amber-600 bg-amber-50';
    case 'ARCHIVED':
      return 'text-purple-600 bg-purple-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

const initialFormState = {
  name: '',
  description: '',
  status: 'DRAFT',
};

export default function PathsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') || '');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [paths, setPaths] = useState<Path[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const limit = 20;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state to URL search params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (page > 1) params.page = String(page);
    if (activeTab !== 'all') params.tab = activeTab;
    if (debouncedSearch) params.q = debouncedSearch;
    setSearchParams(params, { replace: true });
  }, [page, activeTab, debouncedSearch, setSearchParams]);

  // Debounce search input by 300ms
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  const fetchPaths = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(limit),
      };
      if (activeTab !== 'all') params.status = activeTab.toUpperCase();
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await api.paths.list(params);
      const data: Path[] = Array.isArray(res) ? res : res.data ?? [];
      const totalCount: number = typeof res.total === 'number' ? res.total : data.length;
      setPaths(data);
      setTotal(totalCount);
    } catch {
      setPaths([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, page, limit]);

  // Fetch paths whenever filters or page change
  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  // Reset page when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  function handleFormChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreatePath() {
    setFormError('');
    if (!form.name.trim()) { setFormError('Path name is required.'); return; }

    setSubmitting(true);
    try {
      await api.paths.create({
        name: form.name,
        description: form.description,
        status: form.status,
      });
      setShowCreateModal(false);
      setForm(initialFormState);
      setFormError('');
      fetchPaths();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create training path.');
    } finally {
      setSubmitting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const showingFrom = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, total);

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px] flex items-center justify-between">
        <div>
          <h1 className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
            TRAINING PATHS
          </h1>
          <p className="text-[var(--color-muted-foreground)] text-[14px] mt-[4px]">
            Build and manage faculty training pipelines.
          </p>
        </div>
        <button
          onClick={() => { setFormError(''); setShowCreateModal(true); }}
          className="flex items-center gap-[8px] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-[16px] py-[10px] rounded-[6px] font-medium text-[14px] hover:opacity-90 transition-opacity"
        >
          <Plus className="w-[16px] h-[16px]" />
          CREATE PATH
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px]">
        <div className="flex gap-[32px]">
          {['all', 'active', 'draft', 'archived'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`font-mono text-[13px] uppercase py-[12px] transition-colors ${
                activeTab === tab
                  ? 'text-[var(--color-foreground)] border-b-2 border-[#2596be]'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-[32px] py-[20px] bg-[var(--color-background)]">
        <div className="relative max-w-[400px]">
          <Search className="absolute left-[12px] top-[50%] translate-y-[-50%] w-[16px] h-[16px] text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            placeholder="Search paths..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-[40px] pr-[16px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#2596be]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-[32px] pb-[32px]">
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium flex-1">
                  PATH NAME
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[80px]">
                  PHASES
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[80px]">
                  COURSES
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[90px]">
                  TRAINEES
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[160px]">
                  CREATED BY
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[100px]">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-[16px] py-[32px] text-center text-[14px] text-[var(--color-muted-foreground)]">
                    Loading...
                  </td>
                </tr>
              ) : paths.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-[16px] py-[32px] text-center text-[14px] text-[var(--color-muted-foreground)]">
                    No paths found.
                  </td>
                </tr>
              ) : (
                paths.map((path) => (
                  <tr
                    key={path.id}
                    onClick={() => navigate(`/paths/${path.id}`)}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-background)] cursor-pointer transition-colors"
                  >
                    <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-foreground)] font-medium">
                      {path.name}
                    </td>
                    <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-muted-foreground)] font-mono">
                      {path.phase_count}
                    </td>
                    <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-muted-foreground)] font-mono">
                      {path.step_count}
                    </td>
                    <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-foreground)] font-medium">
                      {path.trainee_count}
                    </td>
                    <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                      {path.creator_name}
                    </td>
                    <td className="px-[16px] py-[16px]">
                      <span
                        className={`inline-flex px-[8px] py-[4px] rounded-[4px] text-[12px] font-medium font-mono ${getStatusColor(path.status)}`}
                      >
                        {path.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[16px] flex items-center justify-between">
        <p className="text-[14px] text-[var(--color-muted-foreground)]">
          {total === 0
            ? 'No paths'
            : `Showing ${showingFrom}-${showingTo} of ${total} paths`}
        </p>
        <div className="flex gap-[8px]">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-[12px] py-[6px] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-muted-foreground)] hover:bg-[var(--color-background)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-[12px] py-[6px] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-muted-foreground)] hover:bg-[var(--color-background)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Create Path Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] w-full max-w-[500px] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-[24px] py-[20px] border-b border-[var(--color-border)]">
              <h2 className="font-headline text-[20px] font-bold text-[var(--color-foreground)]">
                CREATE TRAINING PATH
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
              >
                <X className="w-[20px] h-[20px]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-[24px] py-[24px]">
              {formError && (
                <div className="mb-[16px] rounded-[6px] border border-red-300 bg-red-50 px-[16px] py-[12px] text-[13px] font-mono text-red-600">
                  {formError}
                </div>
              )}
              <div className="space-y-[20px]">
                {/* Path Name */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    PATH NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Enter path name"
                    value={form.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter path description"
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#2596be] resize-none"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    STATUS
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="ACTIVE">ACTIVE</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-[12px] px-[24px] py-[20px] border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-[16px] py-[10px] border border-[var(--color-border)] rounded-[6px] text-[14px] font-medium text-[var(--color-foreground)] hover:bg-[var(--color-background)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePath}
                disabled={submitting}
                className="px-[16px] py-[10px] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-[6px] text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Path'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
