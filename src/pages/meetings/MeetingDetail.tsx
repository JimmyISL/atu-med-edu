import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Search } from 'lucide-react';
import { api } from '../../api';

interface Attendee {
  person_id: number;
  name: string;
  email: string;
  department: string;
  person_role: string;
  attended: boolean | null;
}

interface Person {
  id: number;
  name: string;
  email?: string;
  role: string;
  department: string;
}

interface CourseOption {
  id: number;
  course_number: string;
  name: string;
  [key: string]: unknown;
}

interface Meeting {
  id: number;
  title: string;
  course: string;
  course_id: number | null;
  course_name: string;
  course_cme_type: string;
  meeting_date: string;
  start_time: string;
  end_time: string;
  location: string;
  subject: string;
  presenter_id: number | null;
  presenter_name: string;
  cme_credits: number;
  expected_attendees: number;
  description: string;
  notes: string;
  status: string;
  attendees: Attendee[];
}

interface EditForm {
  title: string;
  meeting_date: string;
  start_time: string;
  end_time: string;
  location: string;
  subject: string;
  cme_credits: string;
  expected_attendees: string;
  description: string;
  notes: string;
  status: string;
  presenter_id: string;
  course_id: string;
}

const labelCls = 'font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]';
const inputCls = 'w-full rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]';
const deleteBtnCls = 'rounded-[6px] border border-red-300 bg-red-50 px-[16px] py-[8px] font-mono text-[13px] font-medium text-red-600 hover:bg-red-100';

function getAttendanceLabel(attended: boolean | null): string {
  if (attended === true) return 'PRESENT';
  if (attended === false) return 'ABSENT';
  return 'PENDING';
}

function getAttendanceColor(attended: boolean | null): string {
  if (attended === true) return 'text-green-600 bg-green-50';
  if (attended === false) return 'text-red-600 bg-red-50';
  return 'text-amber-600 bg-amber-50';
}

function nextAttendanceState(attended: boolean | null): boolean | null {
  if (attended === null) return true;   // PENDING → PRESENT
  if (attended === true) return false;  // PRESENT → ABSENT
  return null;                          // ABSENT → PENDING
}

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'scheduled':
      return 'text-blue-600 bg-blue-50';
    case 'cancelled':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-amber-600 bg-amber-50';
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${minutes} ${ampm}`;
}

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [editForm, setEditForm] = useState<EditForm>({
    title: '', meeting_date: '', start_time: '', end_time: '',
    location: '', subject: '', cme_credits: '', expected_attendees: '',
    description: '', notes: '', status: 'SCHEDULED',
    presenter_id: '', course_id: '',
  });

  // Add Attendee modal state
  const [showAddAttendee, setShowAddAttendee] = useState(false);
  const [addTab, setAddTab] = useState<'hr' | 'quick'>('hr');
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [personSearch, setPersonSearch] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [addingAttendee, setAddingAttendee] = useState(false);
  const [quickForm, setQuickForm] = useState({ first_name: '', last_name: '', email: '' });

  const fetchMeeting = () => {
    if (!id) return;
    setLoading(true);
    api.meetings
      .get(Number(id))
      .then((data: Meeting) => {
        setMeeting(data);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to load meeting');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMeeting();
  }, [id]);

  const openEdit = () => {
    if (!meeting) return;
    // Fetch people and courses for dropdowns
    api.people.all().then((data: Person[]) => setPeople(data)).catch(() => {});
    api.courses.list().then((res: any) => {
      setCourses(Array.isArray(res) ? res : res.data ?? []);
    }).catch(() => {});

    setEditForm({
      title: meeting.title || '',
      meeting_date: meeting.meeting_date || '',
      start_time: meeting.start_time || '',
      end_time: meeting.end_time || '',
      location: meeting.location || '',
      subject: meeting.subject || '',
      cme_credits: meeting.cme_credits != null ? String(meeting.cme_credits) : '',
      expected_attendees: meeting.expected_attendees != null ? String(meeting.expected_attendees) : '',
      description: meeting.description || '',
      notes: meeting.notes || '',
      status: meeting.status || 'SCHEDULED',
      presenter_id: meeting.presenter_id != null ? String(meeting.presenter_id) : '',
      course_id: meeting.course_id != null ? String(meeting.course_id) : '',
    });
    setIsEditing(true);
  };

  const handleEditChange = (field: keyof EditForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await api.meetings.update(Number(id), {
        title: editForm.title,
        course_id: editForm.course_id ? Number(editForm.course_id) : null,
        meeting_date: editForm.meeting_date,
        start_time: editForm.start_time,
        end_time: editForm.end_time,
        location: editForm.location,
        subject: editForm.subject,
        presenter_id: editForm.presenter_id ? Number(editForm.presenter_id) : null,
        cme_credits: editForm.cme_credits ? Number(editForm.cme_credits) : 0,
        expected_attendees: editForm.expected_attendees ? Number(editForm.expected_attendees) : 0,
        description: editForm.description,
        notes: editForm.notes,
        status: editForm.status,
      });
      setIsEditing(false);
      fetchMeeting();
    } catch (err) {
      console.error('Failed to update meeting:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    try {
      await api.meetings.delete(Number(id));
      navigate('/meetings');
    } catch (err) {
      console.error('Failed to delete meeting:', err);
    }
  };

  // ── Add Attendee helpers ──
  const openAddAttendee = () => {
    setAddTab('hr');
    setPersonSearch('');
    setSelectedPersonId(null);
    setQuickForm({ first_name: '', last_name: '', email: '' });
    api.people.all().then((data: Person[]) => setAllPeople(data)).catch(() => {});
    setShowAddAttendee(true);
  };

  const existingIds = useMemo(
    () => new Set((meeting?.attendees || []).map((a) => a.person_id)),
    [meeting]
  );

  const filteredPeople = useMemo(() => {
    const q = personSearch.toLowerCase();
    return allPeople
      .filter((p) => !existingIds.has(p.id))
      .filter((p) =>
        !q || p.name.toLowerCase().includes(q) || (p.email && p.email.toLowerCase().includes(q))
      );
  }, [allPeople, existingIds, personSearch]);

  const handleAddFromHR = async () => {
    if (!id || !selectedPersonId) return;
    setAddingAttendee(true);
    try {
      await api.meetings.addAttendee(Number(id), { person_id: selectedPersonId });
      setShowAddAttendee(false);
      fetchMeeting();
    } catch (err) {
      console.error('Failed to add attendee:', err);
    } finally {
      setAddingAttendee(false);
    }
  };

  const handleQuickAdd = async () => {
    if (!id || !quickForm.first_name || !quickForm.last_name) return;
    setAddingAttendee(true);
    try {
      await api.meetings.addAttendee(Number(id), {
        quick_add: true,
        first_name: quickForm.first_name,
        last_name: quickForm.last_name,
        email: quickForm.email || undefined,
      });
      setShowAddAttendee(false);
      fetchMeeting();
    } catch (err) {
      console.error('Failed to quick-add attendee:', err);
    } finally {
      setAddingAttendee(false);
    }
  };

  const handleRemoveAttendee = async (personId: number) => {
    if (!id) return;
    try {
      await api.meetings.removeAttendee(Number(id), personId);
      fetchMeeting();
    } catch (err) {
      console.error('Failed to remove attendee:', err);
    }
  };

  const handleToggleAttendance = async (personId: number, currentAttended: boolean | null) => {
    if (!id) return;
    try {
      const next = nextAttendanceState(currentAttended);
      await api.meetings.toggleAttendance(Number(id), personId, next);
      fetchMeeting();
    } catch (err) {
      console.error('Failed to toggle attendance:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[var(--color-muted-foreground)] text-[14px]">Loading...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600 text-[14px]">{error || 'Meeting not found'}</p>
      </div>
    );
  }

  const attendees = meeting.attendees || [];
  const presentCount = attendees.filter((a) => a.attended === true).length;
  const evaluatedCount = attendees.filter((a) => a.attended !== null).length;
  const cmeTypeLabel = meeting.course_cme_type || 'Category 1';

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px] flex items-center justify-between">
        <div className="flex items-center gap-[16px]">
          <button
            onClick={() => navigate('/meetings')}
            className="inline-flex items-center gap-[6px] font-mono text-[13px] text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
          >
            <ArrowLeft className="h-[16px] w-[16px]" />
            Back to Meetings
          </button>
        </div>
        <div className="flex items-center gap-[12px]">
          <button
            onClick={handleDelete}
            className={deleteBtnCls}
          >
            DELETE
          </button>
          <button
            onClick={openEdit}
            className="px-[16px] py-[10px] border border-[var(--color-border)] rounded-[6px] text-[14px] font-medium text-[var(--color-foreground)] hover:bg-[var(--color-background)] transition-colors"
          >
            EDIT
          </button>
        </div>
      </div>

      {/* Title sub-bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[16px]">
        <h1 className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
          {meeting.title}
        </h1>
        <p className="text-[var(--color-muted-foreground)] text-[14px] mt-[4px]">
          MTG-{String(meeting.id).padStart(4, '0')} &bull; {meeting.status}
        </p>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-[720px] overflow-auto rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
            <h2 className="mb-[20px] font-headline text-[18px] font-bold text-[var(--color-foreground)]">
              Edit Meeting
            </h2>

            <div className="grid grid-cols-2 gap-x-[24px] gap-y-[16px]">
              <div className="col-span-2 flex flex-col gap-[4px]">
                <label className={labelCls}>TITLE</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>MEETING DATE</label>
                <input
                  type="date"
                  value={editForm.meeting_date}
                  onChange={(e) => handleEditChange('meeting_date', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>LOCATION</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => handleEditChange('location', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>START TIME</label>
                <input
                  type="time"
                  value={editForm.start_time}
                  onChange={(e) => handleEditChange('start_time', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>END TIME</label>
                <input
                  type="time"
                  value={editForm.end_time}
                  onChange={(e) => handleEditChange('end_time', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>SUBJECT</label>
                <input
                  type="text"
                  value={editForm.subject}
                  onChange={(e) => handleEditChange('subject', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>CME CREDITS</label>
                <input
                  type="number"
                  step="0.25"
                  value={editForm.cme_credits}
                  onChange={(e) => handleEditChange('cme_credits', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>EXPECTED ATTENDEES</label>
                <input
                  type="number"
                  value={editForm.expected_attendees}
                  onChange={(e) => handleEditChange('expected_attendees', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>STATUS</label>
                <select
                  value={editForm.status}
                  onChange={(e) => handleEditChange('status', e.target.value)}
                  className={inputCls}
                >
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>PRESENTER</label>
                <select
                  value={editForm.presenter_id}
                  onChange={(e) => handleEditChange('presenter_id', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select presenter</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>COURSE</label>
                <select
                  value={editForm.course_id}
                  onChange={(e) => handleEditChange('course_id', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.course_number} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex flex-col gap-[4px]">
                <label className={labelCls}>DESCRIPTION</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  rows={3}
                  className={inputCls}
                />
              </div>
              <div className="col-span-2 flex flex-col gap-[4px]">
                <label className={labelCls}>NOTES</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => handleEditChange('notes', e.target.value)}
                  rows={2}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-[24px] flex items-center justify-end gap-[12px]">
              <button
                onClick={handleCancel}
                className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[8px] font-mono text-[13px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-input)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-[6px] bg-[#FACC15] px-[16px] py-[8px] font-mono text-[13px] font-medium text-black transition-colors hover:bg-[#EAB308] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Attendee Modal */}
      {showAddAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[520px] max-h-[80vh] flex flex-col rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[var(--color-border)]">
              <h2 className="font-headline text-[18px] font-bold text-[var(--color-foreground)]">
                Add Attendee
              </h2>
              <button
                onClick={() => setShowAddAttendee(false)}
                className="inline-flex items-center justify-center w-[32px] h-[32px] rounded-[6px] text-[var(--color-muted-foreground)] hover:bg-[var(--color-input)] hover:text-[var(--color-foreground)] transition-colors"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--color-border)]">
              <button
                onClick={() => setAddTab('hr')}
                className={`flex-1 px-[20px] py-[12px] font-mono text-[12px] font-bold uppercase tracking-wide transition-colors ${
                  addTab === 'hr'
                    ? 'text-[#FACC15] border-b-2 border-[#FACC15]'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                From HR
              </button>
              <button
                onClick={() => setAddTab('quick')}
                className={`flex-1 px-[20px] py-[12px] font-mono text-[12px] font-bold uppercase tracking-wide transition-colors ${
                  addTab === 'quick'
                    ? 'text-[#FACC15] border-b-2 border-[#FACC15]'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                Quick Add
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-auto p-[24px]">
              {addTab === 'hr' ? (
                <div className="flex flex-col gap-[16px]">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-[var(--color-muted-foreground)]" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={personSearch}
                      onChange={(e) => setPersonSearch(e.target.value)}
                      className={`${inputCls} pl-[36px]`}
                    />
                  </div>

                  {/* People list */}
                  <div className="max-h-[280px] overflow-auto rounded-[6px] border border-[var(--color-border)]">
                    {filteredPeople.length === 0 ? (
                      <p className="px-[16px] py-[20px] text-center font-mono text-[12px] text-[var(--color-muted-foreground)]">
                        {personSearch ? 'No matching people found' : 'All people are already attendees'}
                      </p>
                    ) : (
                      filteredPeople.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPersonId(p.id)}
                          className={`w-full text-left px-[16px] py-[12px] border-b border-[var(--color-border)] last:border-0 transition-colors ${
                            selectedPersonId === p.id
                              ? 'bg-[#FACC15]/10 border-l-2 border-l-[#FACC15]'
                              : 'hover:bg-[var(--color-input)]'
                          }`}
                        >
                          <p className="text-[14px] font-medium text-[var(--color-foreground)]">{p.name}</p>
                          <p className="text-[12px] text-[var(--color-muted-foreground)] font-mono mt-[2px]">
                            {p.role}{p.department ? ` / ${p.department}` : ''}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-[16px]">
                  <div className="flex flex-col gap-[4px]">
                    <label className={labelCls}>FIRST NAME *</label>
                    <input
                      type="text"
                      value={quickForm.first_name}
                      onChange={(e) => setQuickForm((prev) => ({ ...prev, first_name: e.target.value }))}
                      placeholder="First name"
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <label className={labelCls}>LAST NAME *</label>
                    <input
                      type="text"
                      value={quickForm.last_name}
                      onChange={(e) => setQuickForm((prev) => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Last name"
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <label className={labelCls}>EMAIL (OPTIONAL)</label>
                    <input
                      type="email"
                      value={quickForm.email}
                      onChange={(e) => setQuickForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                      className={inputCls}
                    />
                  </div>
                  <p className="font-mono text-[11px] text-[var(--color-muted-foreground)] leading-[1.5]">
                    Creates a new person record with is_complete=false. Complete their profile later in HR.
                  </p>
                </div>
              )}
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-[12px] px-[24px] py-[16px] border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowAddAttendee(false)}
                className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[8px] font-mono text-[13px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-input)]"
              >
                Cancel
              </button>
              {addTab === 'hr' ? (
                <button
                  onClick={handleAddFromHR}
                  disabled={!selectedPersonId || addingAttendee}
                  className="rounded-[6px] bg-[#FACC15] px-[16px] py-[8px] font-mono text-[13px] font-medium text-[#09090B] transition-colors hover:bg-[#EAB308] disabled:opacity-50"
                >
                  {addingAttendee ? 'Adding...' : 'Add'}
                </button>
              ) : (
                <button
                  onClick={handleQuickAdd}
                  disabled={!quickForm.first_name || !quickForm.last_name || addingAttendee}
                  className="rounded-[6px] bg-[#FACC15] px-[16px] py-[8px] font-mono text-[13px] font-medium text-[#09090B] transition-colors hover:bg-[#EAB308] disabled:opacity-50"
                >
                  {addingAttendee ? 'Adding...' : 'Quick Add'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="flex gap-[24px] px-[32px] py-[24px]">
          {/* Left Column */}
          <div className="flex-1">
            {/* Attendees Card */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] overflow-hidden">
              <div className="px-[20px] py-[16px] border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-[12px]">
                  <h2 className="font-mono text-[13px] uppercase text-[var(--color-foreground)] font-bold">
                    ATTENDEES
                  </h2>
                  <span className="inline-flex items-center justify-center w-[24px] h-[24px] rounded-full bg-[var(--color-background)] text-[12px] font-mono font-medium text-[var(--color-foreground)]">
                    {attendees.length}
                  </span>
                </div>
                <button
                  onClick={openAddAttendee}
                  className="inline-flex items-center gap-[6px] rounded-[6px] bg-[#FACC15] px-[12px] py-[6px] font-mono text-[11px] font-bold text-[#09090B] uppercase tracking-wide transition-colors hover:bg-[#EAB308]"
                >
                  <Plus className="h-[14px] w-[14px]" />
                  ADD ATTENDEE
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
                      <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium">
                        NAME
                      </th>
                      <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium">
                        ROLE
                      </th>
                      <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium">
                        DEPARTMENT
                      </th>
                      <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium">
                        ATTENDANCE
                      </th>
                      <th className="text-right px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((attendee) => (
                      <tr
                        key={attendee.person_id}
                        className="group border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-input)] transition-colors"
                      >
                        <td
                          className="px-[16px] py-[14px] text-[14px] text-[var(--color-foreground)] font-medium cursor-pointer"
                          onClick={() => navigate(`/hr/${attendee.person_id}`)}
                        >
                          {attendee.name}
                        </td>
                        <td className="px-[16px] py-[14px] text-[14px] text-[var(--color-muted-foreground)]">
                          {attendee.person_role}
                        </td>
                        <td className="px-[16px] py-[14px] text-[14px] text-[var(--color-muted-foreground)]">
                          {attendee.department}
                        </td>
                        <td className="px-[16px] py-[14px]">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleAttendance(attendee.person_id, attendee.attended); }}
                            className={`inline-flex px-[8px] py-[4px] rounded-[4px] text-[12px] font-medium font-mono cursor-pointer transition-opacity hover:opacity-80 ${getAttendanceColor(attendee.attended)}`}
                            title={attendee.attended === null ? 'Mark as present' : attendee.attended ? 'Mark as absent' : 'Reset to pending'}
                          >
                            {getAttendanceLabel(attendee.attended)}
                          </button>
                        </td>
                        <td className="px-[16px] py-[14px] text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveAttendee(attendee.person_id); }}
                            className="inline-flex items-center justify-center w-[28px] h-[28px] rounded-[4px] text-[var(--color-muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                            title="Remove attendee"
                          >
                            <X className="h-[14px] w-[14px]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-[380px] space-y-[24px]">
            {/* Meeting Details Card */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] overflow-hidden">
              <div className="px-[20px] py-[16px] border-b border-[var(--color-border)]">
                <h2 className="font-mono text-[13px] uppercase text-[var(--color-foreground)] font-bold">
                  MEETING DETAILS
                </h2>
              </div>

              <div className="px-[20px] py-[20px] space-y-[16px]">
                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    MEETING NAME
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)] font-medium">
                    {meeting.title}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    MEETING NR
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)] font-mono">
                    MTG-{String(meeting.id).padStart(4, '0')}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    STATUS
                  </p>
                  <span className={`inline-flex px-[8px] py-[4px] rounded-[4px] text-[12px] font-medium font-mono ${getStatusColor(meeting.status)}`}>
                    {meeting.status?.toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    DATE
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)]">
                    {formatDate(meeting.meeting_date)}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    TIME
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)]">
                    {formatTime(meeting.start_time)} — {formatTime(meeting.end_time)}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    LOCATION
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)]">
                    {meeting.location}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    COURSE NR
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)] font-mono">
                    {meeting.course || 'None'}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    PRESENTER
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)]">
                    {meeting.presenter_name}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    ABSTRACT
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)] leading-[1.6]">
                    {meeting.description}
                  </p>
                </div>
              </div>
            </div>

            {/* CME & Engagement Card */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] overflow-hidden">
              <div className="px-[20px] py-[16px] border-b border-[var(--color-border)]">
                <h2 className="font-mono text-[13px] uppercase text-[var(--color-foreground)] font-bold">
                  CME & ENGAGEMENT
                </h2>
              </div>

              <div className="px-[20px] py-[20px] space-y-[16px]">
                {!meeting.course_id ? (
                  <p className="text-[14px] text-[var(--color-muted-foreground)]">
                    None — no course linked to this meeting.
                  </p>
                ) : (
                  <>
                    <div>
                      <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                        CME TYPE
                      </p>
                      <span className="inline-flex px-[8px] py-[4px] rounded-[4px] text-[12px] font-medium font-mono text-[#854D0E] bg-[#FEF3C7]">
                        {cmeTypeLabel}
                      </span>
                    </div>

                    <div>
                      <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                        CREDITS AVAILABLE
                      </p>
                      <p className="text-[14px] text-[var(--color-foreground)]">
                        {meeting.cme_credits} AMA PRA {cmeTypeLabel} Credits
                      </p>
                    </div>

                    <div>
                      <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                        CME VALUE
                      </p>
                      <p className="text-[14px] text-[var(--color-foreground)] font-medium">
                        ${(meeting.cme_credits * 200).toLocaleString()}
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    ENGAGEMENT TYPE
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)]">
                    {meeting.subject || 'Lecture / Workshop'}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    EVALUATION STATUS
                  </p>
                  <div className="space-y-[4px]">
                    <p className="text-[14px] text-amber-600 font-medium">
                      {attendees.length === 0
                        ? 'No attendees'
                        : `${evaluatedCount === attendees.length ? 'COMPLETE' : 'PENDING'} — ${evaluatedCount} of ${attendees.length} evaluated`}
                    </p>
                    {attendees.length > 0 && (
                      <div className="w-full h-[6px] bg-[var(--color-background)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${Math.round((evaluatedCount / attendees.length) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
