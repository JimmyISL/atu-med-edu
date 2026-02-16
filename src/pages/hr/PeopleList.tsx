import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { api } from '../../api';

interface Person {
  id: number;
  title: string;
  first_name: string;
  last_name: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: string;
  is_complete: boolean;
}

interface PeopleResponse {
  data: Person[];
  total: number;
  counts: {
    all: number;
    faculty: number;
    staff: number;
    resident: number;
    other: number;
  };
  page: number;
  limit: number;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-500';
    case 'OFFSITE':
      return 'bg-amber-500';
    case 'LEAVE':
      return 'bg-red-500';
    case 'INACTIVE':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
}

const INITIAL_FORM = {
  title: 'Dr.',
  first_name: '',
  last_name: '',
  role: 'Faculty',
  department: 'Cardiology',
  email: '',
  phone: '',
  date_of_birth: '',
  hire_date: '',
  office_location: '',
  notes: '',
};

export default function PeopleList() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ all: 0, faculty: 0, staff: 0, resident: 0, other: 0 });
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Fetch people from API whenever filters change
  const fetchPeople = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(limit),
      };
      if (activeTab !== 'all') {
        params.role = activeTab;
      }
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      const res: PeopleResponse = await api.people.list(params);
      setPeople(res.data);
      setTotal(res.total);
      setCounts(res.counts);
    } catch (err) {
      console.error('Failed to fetch people:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, page, limit]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  // Reset page when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setPage(1);
  };

  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'faculty', label: 'Faculty', count: counts.faculty },
    { id: 'staff', label: 'Staff', count: counts.staff },
    { id: 'resident', label: 'Residents', count: counts.resident },
    { id: 'other', label: 'Other', count: counts.other },
  ];

  const handleRowClick = (id: number) => {
    navigate(`/hr/${id}`);
  };

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.people.create({
        title: form.title,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
        department: form.department,
        email: form.email,
        phone: form.phone,
        date_of_birth: form.date_of_birth || undefined,
        hire_date: form.hire_date || undefined,
        office_location: form.office_location || undefined,
        notes: form.notes || undefined,
      });
      setShowModal(false);
      setForm(INITIAL_FORM);
      await fetchPeople();
    } catch (err) {
      console.error('Failed to create person:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const showingFrom = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, total);

  return (
    <div className="flex h-full w-full flex-col bg-[var(--color-background)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-[32px] py-[24px]">
        <div className="flex flex-col gap-[8px]">
          <h1 className="font-headline text-[28px] font-bold tracking-tight text-[var(--color-foreground)]">
            HR / PEOPLE
          </h1>
          <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
            Manage personnel directory.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-[6px] bg-[var(--color-primary)] px-[16px] py-[8px] font-mono text-[14px] font-medium text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90"
        >
          + ADD PERSON
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-[32px] border-b border-[var(--color-border)] px-[32px]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`relative pb-[12px] pt-[16px] font-mono text-[13px] font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[var(--color-foreground)]'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            {tab.label} ({tab.count})
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-foreground)]" />
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center justify-end px-[32px] py-[16px]">
        <div className="relative w-[320px]">
          <Search className="absolute left-[12px] top-[50%] h-[16px] w-[16px] translate-y-[-50%] text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            placeholder="Search personnel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] py-[8px] pl-[36px] pr-[12px] font-mono text-[13px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-[32px]">
        <table className="w-full">
          <thead className="sticky top-0 bg-[var(--color-background)]">
            <tr className="border-b border-[var(--color-border)]">
              <th className="pb-[12px] pr-[16px] text-left font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                NAME
              </th>
              <th className="pb-[12px] pr-[16px] text-left font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                ROLE
              </th>
              <th className="pb-[12px] pr-[16px] text-left font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                DEPARTMENT
              </th>
              <th className="pb-[12px] pr-[16px] text-left font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                EMAIL
              </th>
              <th className="pb-[12px] text-left font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && people.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-[32px] text-center font-mono text-[13px] text-[var(--color-muted-foreground)]">
                  Loading...
                </td>
              </tr>
            ) : people.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-[32px] text-center font-mono text-[13px] text-[var(--color-muted-foreground)]">
                  No records found.
                </td>
              </tr>
            ) : (
              people.map((person) => (
                <tr
                  key={person.id}
                  onClick={() => handleRowClick(person.id)}
                  className="cursor-pointer border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-card)]"
                >
                  <td className="py-[16px] pr-[16px] font-mono text-[13px] text-[var(--color-foreground)]">
                    {person.name}
                  </td>
                  <td className="py-[16px] pr-[16px] font-mono text-[13px] text-[var(--color-muted-foreground)]">
                    {person.role}
                  </td>
                  <td className="py-[16px] pr-[16px] font-mono text-[13px] text-[var(--color-muted-foreground)]">
                    {person.department}
                  </td>
                  <td className="py-[16px] pr-[16px] font-mono text-[13px] text-[var(--color-muted-foreground)]">
                    {person.email}
                  </td>
                  <td className="py-[16px]">
                    <span
                      className={`inline-flex items-center rounded-[4px] px-[8px] py-[4px] font-mono text-[11px] font-medium uppercase tracking-wide text-white ${getStatusColor(person.status)}`}
                    >
                      {person.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-[var(--color-border)] px-[32px] py-[16px]">
        <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
          {total === 0
            ? 'No records'
            : `Showing ${showingFrom}-${showingTo} of ${total.toLocaleString()} records`}
        </p>
        <div className="flex items-center gap-[8px]">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] px-[12px] py-[6px] font-mono text-[13px] text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-input)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] px-[12px] py-[6px] font-mono text-[13px] text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-input)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Person Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-[640px] rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-[24px] py-[16px]">
              <h2 className="font-headline text-[20px] font-bold tracking-tight text-[var(--color-foreground)]">
                ADD NEW PERSON
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm(INITIAL_FORM);
                }}
                className="rounded-[4px] p-[4px] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-card)] hover:text-[var(--color-foreground)]"
              >
                <X className="h-[20px] w-[20px]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-[24px] py-[24px]">
              <div className="flex flex-col gap-[16px]">
                {/* Title, First Name, Last Name Row */}
                <div className="grid grid-cols-[120px_1fr_1fr] gap-[12px]">
                  <div className="flex flex-col gap-[6px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      TITLE
                    </label>
                    <select
                      value={form.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                    >
                      <option>Dr.</option>
                      <option>Mr.</option>
                      <option>Mrs.</option>
                      <option>Ms.</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      FIRST NAME
                    </label>
                    <input
                      type="text"
                      value={form.first_name}
                      onChange={(e) => handleFormChange('first_name', e.target.value)}
                      className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                    />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      LAST NAME
                    </label>
                    <input
                      type="text"
                      value={form.last_name}
                      onChange={(e) => handleFormChange('last_name', e.target.value)}
                      className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    ROLE
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => handleFormChange('role', e.target.value)}
                    className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                  >
                    <option>Faculty</option>
                    <option>Staff</option>
                    <option>Resident</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Department */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    DEPARTMENT
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => handleFormChange('department', e.target.value)}
                    className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                  >
                    <option>Cardiology</option>
                    <option>Neurology</option>
                    <option>Surgery</option>
                    <option>Administration</option>
                    <option>Pharmacology</option>
                    <option>Radiology</option>
                  </select>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    PHONE
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                  />
                </div>

                {/* Date of Birth */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    DATE OF BIRTH
                  </label>
                  <input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => handleFormChange('date_of_birth', e.target.value)}
                    className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                  />
                </div>

                {/* Date of Hire */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    DATE OF HIRE
                  </label>
                  <input
                    type="date"
                    value={form.hire_date}
                    onChange={(e) => handleFormChange('hire_date', e.target.value)}
                    className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                  />
                </div>

                {/* Office Location */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    OFFICE LOCATION
                  </label>
                  <input
                    type="text"
                    value={form.office_location}
                    onChange={(e) => handleFormChange('office_location', e.target.value)}
                    className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                  />
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    NOTES
                  </label>
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-[12px] border-t border-[var(--color-border)] px-[24px] py-[16px]">
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm(INITIAL_FORM);
                }}
                className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[8px] font-mono text-[14px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-input)]"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="rounded-[6px] bg-[var(--color-primary)] px-[16px] py-[8px] font-mono text-[14px] font-medium text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Adding...' : 'Add Person'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
