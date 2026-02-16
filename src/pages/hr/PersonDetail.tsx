import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { api } from '../../api';

interface PersonCourse {
  course_id: number;
  course_name: string;
  course_number: string;
  role: string;
  status: string;
}

interface PersonMeeting {
  meeting_id: number;
  meeting_title: string;
  meeting_date: string;
  attended: boolean;
}

interface PersonCME {
  activity_id: number;
  activity_name: string;
  credits_earned: number;
  date_earned: string;
  verified: boolean;
}

interface PersonCredential {
  template_name: string;
  issue_date: string;
  expiry_date: string;
  credential_number: string;
  status: string;
}

interface PersonData {
  id: number;
  title: string;
  first_name: string;
  last_name: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  date_of_birth: string;
  hire_date: string;
  office_location: string;
  notes: string;
  status: string;
  is_complete: boolean;
  courses: PersonCourse[];
  meetings: PersonMeeting[];
  cme_credits: PersonCME[];
  credentials: PersonCredential[];
}

interface EditForm {
  title: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  date_of_birth: string;
  hire_date: string;
  office_location: string;
  notes: string;
  status: string;
}

const labelCls = 'font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]';
const inputCls = 'w-full rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]';
const deleteBtnCls = 'rounded-[6px] border border-red-300 bg-red-50 px-[16px] py-[8px] font-mono text-[13px] font-medium text-red-600 hover:bg-red-100';

export default function PersonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('information');
  const [person, setPerson] = useState<PersonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    title: '', first_name: '', last_name: '', role: '', department: '',
    email: '', phone: '', date_of_birth: '', hire_date: '',
    office_location: '', notes: '', status: '',
  });

  const fetchPerson = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api.people
      .get(Number(id))
      .then((data: PersonData) => setPerson(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPerson();
  }, [id]);

  const openEdit = () => {
    if (!person) return;
    setEditForm({
      title: person.title || '',
      first_name: person.first_name || '',
      last_name: person.last_name || '',
      role: person.role || '',
      department: person.department || '',
      email: person.email || '',
      phone: person.phone || '',
      date_of_birth: person.date_of_birth ? person.date_of_birth.substring(0, 10) : '',
      hire_date: person.hire_date ? person.hire_date.substring(0, 10) : '',
      office_location: person.office_location || '',
      notes: person.notes || '',
      status: person.status || 'ACTIVE',
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
      await api.people.update(Number(id), {
        ...editForm,
        is_complete: true,
      });
      setIsEditing(false);
      fetchPerson();
    } catch (err) {
      console.error('Failed to update person:', err);
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
      await api.people.delete(Number(id));
      navigate('/hr');
    } catch (err) {
      console.error('Failed to delete person:', err);
    }
  };

  const tabs = [
    { id: 'information', label: 'Information' },
    { id: 'meetings', label: 'Meetings' },
    { id: 'cme-history', label: 'CME History' },
    { id: 'credentials', label: 'Credentials' },
  ];

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--color-background)]">
        <p className="font-mono text-[14px] text-[var(--color-muted-foreground)]">Loading...</p>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-[16px] bg-[var(--color-background)]">
        <p className="font-mono text-[14px] text-red-500">{error || 'Person not found'}</p>
        <Link
          to="/hr"
          className="inline-flex items-center gap-[6px] font-mono text-[13px] text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
        >
          <ChevronLeft className="h-[16px] w-[16px]" />
          Back to People
        </Link>
      </div>
    );
  }

  const initials =
    (person.first_name?.[0] || '').toUpperCase() +
    (person.last_name?.[0] || '').toUpperCase();

  const meetingsAttended = person.meetings?.filter((m) => m.attended).length ?? 0;
  const totalCmeCredits = person.cme_credits?.reduce((sum, c) => sum + c.credits_earned, 0) ?? 0;
  const totalCourses = person.courses?.length ?? 0;
  const activeCourses = person.courses?.filter((c) => c.status === 'active').length ?? 0;

  const statusColor =
    person.status?.toLowerCase() === 'active'
      ? 'bg-green-500'
      : person.status?.toLowerCase() === 'inactive'
        ? 'bg-red-500'
        : 'bg-gray-500';

  return (
    <div className="flex h-full w-full flex-col bg-[var(--color-background)]">
      {/* Incomplete Profile Alert */}
      {person.is_complete === false && (
        <div className="border-b border-yellow-400 bg-yellow-50 px-[32px] py-[12px] dark:border-yellow-600 dark:bg-yellow-900/30">
          <p className="font-mono text-[13px] font-medium text-yellow-800 dark:text-yellow-200">
            This person was quick-added. Please complete their profile information.
          </p>
        </div>
      )}

      {/* Top Bar */}
      <div className="border-b border-[var(--color-border)] px-[32px] py-[24px]">
        {/* Back Link */}
        <Link
          to="/hr"
          className="mb-[16px] inline-flex items-center gap-[6px] font-mono text-[13px] text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
        >
          <ChevronLeft className="h-[16px] w-[16px]" />
          Back to People
        </Link>

        {/* Person Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[24px]">
            {/* Avatar */}
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#FACC15]">
              <span className="font-headline text-[28px] font-bold text-black">{initials}</span>
            </div>

            {/* Name and Info */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[12px]">
                <h1 className="font-headline text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">
                  {person.name}
                </h1>
                <span className={`inline-flex items-center rounded-[4px] ${statusColor} px-[8px] py-[4px] font-mono text-[11px] font-medium uppercase tracking-wide text-white`}>
                  {person.status?.toUpperCase()}
                </span>
              </div>
              <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
                {person.role} — {person.department}
              </p>
            </div>
          </div>

          {/* Edit / Delete Buttons */}
          <div className="flex items-center gap-[12px]">
            <button
              onClick={handleDelete}
              className={deleteBtnCls}
            >
              DELETE
            </button>
            <button
              onClick={openEdit}
              className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[8px] font-mono text-[14px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-input)]"
            >
              EDIT
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-[32px] border-b border-[var(--color-border)] px-[32px]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative pb-[12px] pt-[16px] font-mono text-[13px] font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[var(--color-foreground)]'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-foreground)]" />
            )}
          </button>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-[640px] overflow-auto rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
            <h2 className="mb-[20px] font-headline text-[18px] font-bold text-[var(--color-foreground)]">
              Edit Person
            </h2>

            <div className="grid grid-cols-2 gap-x-[24px] gap-y-[16px]">
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>TITLE</label>
                <select
                  value={editForm.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select</option>
                  <option>Dr.</option>
                  <option>Mr.</option>
                  <option>Mrs.</option>
                  <option>Ms.</option>
                </select>
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>FIRST NAME</label>
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={(e) => handleEditChange('first_name', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>LAST NAME</label>
                <input
                  type="text"
                  value={editForm.last_name}
                  onChange={(e) => handleEditChange('last_name', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>ROLE</label>
                <select
                  value={editForm.role}
                  onChange={(e) => handleEditChange('role', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select</option>
                  <option>Faculty</option>
                  <option>Staff</option>
                  <option>Resident</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>DEPARTMENT</label>
                <select
                  value={editForm.department}
                  onChange={(e) => handleEditChange('department', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select</option>
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Surgery</option>
                  <option>Administration</option>
                  <option>Pharmacology</option>
                  <option>Radiology</option>
                </select>
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>EMAIL</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleEditChange('email', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>PHONE</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => handleEditChange('phone', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>DATE OF BIRTH</label>
                <input
                  type="date"
                  value={editForm.date_of_birth}
                  onChange={(e) => handleEditChange('date_of_birth', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>HIRE DATE</label>
                <input
                  type="date"
                  value={editForm.hire_date}
                  onChange={(e) => handleEditChange('hire_date', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>OFFICE LOCATION</label>
                <input
                  type="text"
                  value={editForm.office_location}
                  onChange={(e) => handleEditChange('office_location', e.target.value)}
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
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="ON_LEAVE">ON LEAVE</option>
                </select>
              </div>
              <div className="col-span-2 flex flex-col gap-[4px]">
                <label className={labelCls}>NOTES</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => handleEditChange('notes', e.target.value)}
                  rows={3}
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'information' && (
          <div className="flex gap-[24px] px-[32px] py-[24px]">
            {/* Left Column */}
            <div className="flex flex-1 flex-col gap-[24px]">
              {/* Personal Information Card */}
              <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
                <h2 className="mb-[20px] font-headline text-[18px] font-bold text-[var(--color-foreground)]">
                  Personal Information
                </h2>
                <div className="grid grid-cols-2 gap-x-[32px] gap-y-[16px]">
                  <div className="flex flex-col gap-[4px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      TITLE
                    </label>
                    <p className="font-mono text-[13px] text-[var(--color-foreground)]">{person.title || '—'}</p>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      FIRST NAME
                    </label>
                    <p className="font-mono text-[13px] text-[var(--color-foreground)]">{person.first_name || '—'}</p>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      LAST NAME
                    </label>
                    <p className="font-mono text-[13px] text-[var(--color-foreground)]">{person.last_name || '—'}</p>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      DATE OF BIRTH
                    </label>
                    <p className="font-mono text-[13px] text-[var(--color-foreground)]">{person.date_of_birth ? new Date(person.date_of_birth.substring(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      OFFICE LOCATION
                    </label>
                    <p className="font-mono text-[13px] text-[var(--color-foreground)]">{person.office_location || '—'}</p>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      DATE OF HIRE
                    </label>
                    <p className="font-mono text-[13px] text-[var(--color-foreground)]">{person.hire_date ? new Date(person.hire_date.substring(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      PHONE
                    </label>
                    <p className="font-mono text-[13px] text-[var(--color-foreground)]">{person.phone || '—'}</p>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      EMAIL
                    </label>
                    <p className="font-mono text-[13px] text-[var(--color-foreground)]">
                      {person.email || '—'}
                    </p>
                  </div>
                  {person.notes && (
                    <div className="col-span-2 flex flex-col gap-[4px]">
                      <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                        NOTES
                      </label>
                      <p className="font-mono text-[13px] text-[var(--color-foreground)]">
                        {person.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Courses Card */}
              {person.courses && person.courses.length > 0 && (
                <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
                  <h2 className="mb-[20px] font-headline text-[18px] font-bold text-[var(--color-foreground)]">
                    Courses
                  </h2>
                  <div className="flex flex-col gap-[12px]">
                    {person.courses.map((course) => (
                      <div
                        key={course.course_id}
                        onClick={() => navigate(`/courses/${course.course_id}`)}
                        className="flex cursor-pointer items-center justify-between rounded-[6px] border border-[var(--color-border)] px-[16px] py-[12px] transition-colors hover:bg-[var(--color-input)]"
                      >
                        <div className="flex flex-col gap-[2px]">
                          <p className="font-mono text-[13px] font-medium text-[var(--color-foreground)]">
                            {course.course_name}
                          </p>
                          <p className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                            {course.course_number} &middot; {course.role}
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-[4px] px-[8px] py-[4px] font-mono text-[11px] font-medium uppercase tracking-wide text-white ${
                          course.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="flex w-[320px] flex-col gap-[24px]">
              {/* Quick Stats Card */}
              <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
                <h2 className="mb-[20px] font-headline text-[18px] font-bold text-[var(--color-foreground)]">
                  Quick Stats
                </h2>
                <div className="flex flex-col gap-[16px]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      Meetings Attended
                    </span>
                    <span className="font-mono text-[16px] font-bold text-[var(--color-foreground)]">{meetingsAttended}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      CME Credits Earned
                    </span>
                    <span className="font-mono text-[16px] font-bold text-[var(--color-foreground)]">{totalCmeCredits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      Courses
                    </span>
                    <span className="font-mono text-[16px] font-bold text-[var(--color-foreground)]">{totalCourses}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      Active Courses
                    </span>
                    <span className="font-mono text-[16px] font-bold text-[var(--color-foreground)]">{activeCourses}</span>
                  </div>
                </div>
              </div>

              {/* Employment Card */}
              <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
                <h2 className="mb-[20px] font-headline text-[18px] font-bold text-[var(--color-foreground)]">
                  Employment
                </h2>
                <div className="flex flex-col gap-[16px]">
                  <div className="flex flex-col gap-[4px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      DEPARTMENT
                    </label>
                    <p className="font-mono text-[13px] text-[var(--color-foreground)]">{person.department || '—'}</p>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      ROLE
                    </label>
                    <p className="font-mono text-[13px] text-[var(--color-foreground)]">{person.role || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="px-[32px] py-[24px]">
            <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
              <h2 className="mb-[20px] font-headline text-[18px] font-bold text-[var(--color-foreground)]">
                Meetings
              </h2>
              {person.meetings && person.meetings.length > 0 ? (
                <div className="flex flex-col gap-[12px]">
                  {person.meetings.map((meeting) => (
                    <div
                      key={meeting.meeting_id}
                      onClick={() => navigate(`/meetings/${meeting.meeting_id}`)}
                      className="flex cursor-pointer items-center justify-between rounded-[6px] border border-[var(--color-border)] px-[16px] py-[12px] transition-colors hover:bg-[var(--color-input)]"
                    >
                      <div className="flex flex-col gap-[2px]">
                        <p className="font-mono text-[13px] font-medium text-[var(--color-foreground)]">
                          {meeting.meeting_title}
                        </p>
                        <p className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                          {meeting.meeting_date ? new Date(meeting.meeting_date.substring(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                        </p>
                      </div>
                      <span className={`inline-flex items-center rounded-[4px] px-[8px] py-[4px] font-mono text-[11px] font-medium uppercase tracking-wide text-white ${
                        meeting.attended ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {meeting.attended ? 'ATTENDED' : 'ABSENT'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">No meetings found.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cme-history' && (
          <div className="px-[32px] py-[24px]">
            <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
              <h2 className="mb-[20px] font-headline text-[18px] font-bold text-[var(--color-foreground)]">
                CME History
              </h2>
              {person.cme_credits && person.cme_credits.length > 0 ? (
                <div className="flex flex-col gap-[12px]">
                  {person.cme_credits.map((cme) => (
                    <div
                      key={cme.activity_id}
                      onClick={() => navigate(`/cme/${cme.activity_id}`)}
                      className="flex cursor-pointer items-center justify-between rounded-[6px] border border-[var(--color-border)] px-[16px] py-[12px] transition-colors hover:bg-[var(--color-input)]"
                    >
                      <div className="flex flex-col gap-[2px]">
                        <p className="font-mono text-[13px] font-medium text-[var(--color-foreground)]">
                          {cme.activity_name}
                        </p>
                        <p className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                          {cme.date_earned} &middot; {cme.credits_earned} credits
                        </p>
                      </div>
                      <span className={`inline-flex items-center rounded-[4px] px-[8px] py-[4px] font-mono text-[11px] font-medium uppercase tracking-wide text-white ${
                        cme.verified ? 'bg-green-500' : 'bg-yellow-500'
                      }`}>
                        {cme.verified ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">No CME history found.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'credentials' && (
          <div className="px-[32px] py-[24px]">
            <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
              <h2 className="mb-[20px] font-headline text-[18px] font-bold text-[var(--color-foreground)]">
                Credentials
              </h2>
              {person.credentials && person.credentials.length > 0 ? (
                <div className="flex flex-col gap-[12px]">
                  {person.credentials.map((cred, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-[6px] border border-[var(--color-border)] px-[16px] py-[12px]"
                    >
                      <div className="flex flex-col gap-[2px]">
                        <p className="font-mono text-[13px] font-medium text-[var(--color-foreground)]">
                          {cred.template_name}
                        </p>
                        <p className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                          {cred.credential_number} &middot; Issued {cred.issue_date ? new Date(cred.issue_date.substring(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'} &middot; Expires {cred.expiry_date ? new Date(cred.expiry_date.substring(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                      <span className={`inline-flex items-center rounded-[4px] px-[8px] py-[4px] font-mono text-[11px] font-medium uppercase tracking-wide text-white ${
                        cred.status === 'active' ? 'bg-green-500' : cred.status === 'expired' ? 'bg-red-500' : 'bg-gray-500'
                      }`}>
                        {cred.status?.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">No credentials found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
