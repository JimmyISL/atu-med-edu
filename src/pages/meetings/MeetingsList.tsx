import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import { api } from '../../api';

interface Meeting {
  id: number;
  title: string;
  course: string;
  meeting_date: string;
  time: string;
  location: string;
  attendees: number;
  status: string;
  course_id: number;
  subject: string;
  presenter_id: number;
  cme_credits: string;
  expected_attendees: number;
}

interface Course {
  id: number;
  course_number: string;
  name: string;
  [key: string]: unknown;
}

interface Person {
  id: number;
  first_name: string;
  last_name: string;
  [key: string]: unknown;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const ymd = dateStr.substring(0, 10);
  const date = new Date(ymd + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return 'text-green-600 bg-green-50';
    case 'SCHEDULED':
      return 'text-blue-600 bg-blue-50';
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
      return 'text-amber-600 bg-amber-50';
    case 'CANCELLED':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

const initialFormState = {
  title: '',
  course_id: '',
  meeting_date: '',
  start_time: '',
  end_time: '',
  location: '',
  subject: '',
  presenter_id: '',
  cme_credits: '',
  expected_attendees: '',
  description: '',
  notes: '',
};

export default function MeetingsList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [loading, setLoading] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  const [form, setForm] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
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

  // Fetch courses and people on mount for dropdown population
  useEffect(() => {
    api.courses.list().then((res: any) => {
      setCourses(Array.isArray(res) ? res : res.data ?? []);
    }).catch(() => {});

    api.people.all().then((res: any) => {
      setPeople(Array.isArray(res) ? res : []);
    }).catch(() => {});
  }, []);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(limit),
      };

      if (activeTab === 'upcoming') {
        params.status = 'SCHEDULED';
      } else if (activeTab === 'past') {
        params.status = 'COMPLETED';
      } else if (activeTab === 'cancelled') {
        params.status = 'CANCELLED';
      }

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const res = await api.meetings.list(params);
      const data: Meeting[] = Array.isArray(res) ? res : res.data ?? [];
      const totalCount: number = typeof res.total === 'number' ? res.total : data.length;
      setMeetings(data);
      setTotal(totalCount);
    } catch {
      setMeetings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, page, limit]);

  // Fetch meetings whenever filters or page change
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Reset page when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  function handleFormChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateMeeting() {
    setFormError('');
    if (!form.title.trim()) { setFormError('Meeting name is required.'); return; }
    if (!form.meeting_date) { setFormError('Date is required.'); return; }

    setSubmitting(true);
    try {
      await api.meetings.create({
        title: form.title,
        course_id: form.course_id ? Number(form.course_id) : undefined,
        meeting_date: form.meeting_date,
        start_time: form.start_time || undefined,
        end_time: form.end_time || undefined,
        location: form.location,
        subject: form.subject,
        presenter_id: form.presenter_id ? Number(form.presenter_id) : undefined,
        cme_credits: form.cme_credits,
        expected_attendees: form.expected_attendees ? Number(form.expected_attendees) : undefined,
        description: form.description,
        notes: form.notes,
      });
      setShowScheduleModal(false);
      setForm(initialFormState);
      setFormError('');
      fetchMeetings();
    } catch (err: any) {
      setFormError(err.message || 'Failed to schedule meeting.');
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
            MEETINGS
          </h1>
          <p className="text-[var(--color-muted-foreground)] text-[14px] mt-[4px]">
            Schedule and manage department meetings.
          </p>
        </div>
        <button
          onClick={() => { setFormError(''); setShowScheduleModal(true); }}
          className="flex items-center gap-[8px] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-[16px] py-[10px] rounded-[6px] font-medium text-[14px] hover:opacity-90 transition-opacity"
        >
          <Plus className="w-[16px] h-[16px]" />
          SCHEDULE MEETING
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px]">
        <div className="flex gap-[32px]">
          {['all', 'upcoming', 'past', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`font-mono text-[13px] uppercase py-[12px] transition-colors ${
                activeTab === tab
                  ? 'text-[var(--color-foreground)] border-b-2 border-[#FACC15]'
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
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-[40px] pr-[16px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
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
                  MEETING NAME
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[150px]">
                  COURSE
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[95px]">
                  DATE
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[110px]">
                  TIME
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[110px]">
                  LOCATION
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[75px]">
                  ATTENDEES
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[90px]">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-[16px] py-[32px] text-center text-[14px] text-[var(--color-muted-foreground)]">
                    Loading...
                  </td>
                </tr>
              ) : meetings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-[16px] py-[32px] text-center text-[14px] text-[var(--color-muted-foreground)]">
                    No meetings found.
                  </td>
                </tr>
              ) : (
                meetings.map((meeting) => (
                  <tr
                    key={meeting.id}
                    onClick={() => navigate(`/meetings/${meeting.id}`)}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-background)] cursor-pointer transition-colors"
                  >
                    <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-foreground)] font-medium">
                      {meeting.title}
                    </td>
                    <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-muted-foreground)] font-mono">
                      {meeting.course}
                    </td>
                    <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-muted-foreground)] font-mono">
                      {formatDate(meeting.meeting_date)}
                    </td>
                    <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-muted-foreground)] font-mono">
                      {meeting.time}
                    </td>
                    <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                      {meeting.location}
                    </td>
                    <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-foreground)] font-medium">
                      {meeting.attendees}
                    </td>
                    <td className="px-[16px] py-[16px]">
                      <span
                        className={`inline-flex px-[8px] py-[4px] rounded-[4px] text-[12px] font-medium font-mono ${getStatusColor(meeting.status)}`}
                      >
                        {meeting.status}
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
            ? 'No meetings'
            : `Showing ${showingFrom}-${showingTo} of ${total} meetings`}
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

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] w-full max-w-[600px] max-h-[830px] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-[24px] py-[20px] border-b border-[var(--color-border)]">
              <h2 className="font-headline text-[20px] font-bold text-[var(--color-foreground)]">
                SCHEDULE MEETING
              </h2>
              <button
                onClick={() => setShowScheduleModal(false)}
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
                {/* Meeting Name */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    MEETING NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Enter meeting name"
                    value={form.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  />
                </div>

                {/* Course */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    COURSE
                  </label>
                  <select
                    value={form.course_id}
                    onChange={(e) => handleFormChange('course_id', e.target.value)}
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  >
                    <option value="">Select course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.course_number} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    DATE
                  </label>
                  <input
                    type="date"
                    value={form.meeting_date}
                    onChange={(e) => handleFormChange('meeting_date', e.target.value)}
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  />
                </div>

                {/* Time Row */}
                <div className="grid grid-cols-2 gap-[16px]">
                  <div>
                    <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                      START TIME
                    </label>
                    <input
                      type="time"
                      value={form.start_time}
                      onChange={(e) => handleFormChange('start_time', e.target.value)}
                      className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                      END TIME
                    </label>
                    <input
                      type="time"
                      value={form.end_time}
                      onChange={(e) => handleFormChange('end_time', e.target.value)}
                      className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    LOCATION
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={form.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  />
                </div>

                {/* Subject/Topic */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    SUBJECT/TOPIC
                  </label>
                  <input
                    type="text"
                    placeholder="Enter subject or topic"
                    value={form.subject}
                    onChange={(e) => handleFormChange('subject', e.target.value)}
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  />
                </div>

                {/* Presenter */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    PRESENTER
                  </label>
                  <select
                    value={form.presenter_id}
                    onChange={(e) => handleFormChange('presenter_id', e.target.value)}
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  >
                    <option value="">Select presenter</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.first_name} {p.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CME Credits */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    CME CREDITS
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="0.0"
                    value={form.cme_credits}
                    onChange={(e) => handleFormChange('cme_credits', e.target.value)}
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  />
                </div>

                {/* Expected Attendees */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    EXPECTED ATTENDEES
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.expected_attendees}
                    onChange={(e) => handleFormChange('expected_attendees', e.target.value)}
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter meeting description"
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15] resize-none"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    NOTES
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter additional notes"
                    value={form.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-[12px] px-[24px] py-[20px] border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-[16px] py-[10px] border border-[var(--color-border)] rounded-[6px] text-[14px] font-medium text-[var(--color-foreground)] hover:bg-[var(--color-background)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMeeting}
                disabled={submitting}
                className="px-[16px] py-[10px] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-[6px] text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Scheduling...' : 'Schedule Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
