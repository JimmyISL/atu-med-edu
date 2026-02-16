import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../api';

interface Attendee {
  person_id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: string;
}

interface Meeting {
  id: number;
  title: string;
  meeting_date: string;
  start_time: string;
  end_time: string;
  location: string;
  status: string;
}

interface Person {
  id: number;
  name: string;
  role: string;
  department: string;
}

interface CourseData {
  id: number;
  name: string;
  course_number: string;
  cme_type: string;
  cme_total: number;
  value_total: number;
  course_type: string;
  duration: string;
  department: string;
  start_date: string;
  end_date: string;
  prerequisites: string;
  materials_required: string;
  notes: string;
  status: string;
  chair_id: number | null;
  chair_name: string;
  moderator1_id: number | null;
  moderator1_name: string;
  moderator2_id: number | null;
  moderator2_name: string;
  organizer_id: number | null;
  organizer_name: string;
  admin_id: number | null;
  admin_name: string;
  attendees: Attendee[];
  meetings: Meeting[];
}

interface EditForm {
  name: string;
  course_number: string;
  cme_type: string;
  cme_total: string;
  value_total: string;
  course_type: string;
  duration: string;
  department: string;
  start_date: string;
  end_date: string;
  prerequisites: string;
  materials_required: string;
  notes: string;
  status: string;
  chair_id: string;
  moderator1_id: string;
  moderator2_id: string;
  organizer_id: string;
  admin_id: string;
}

const labelCls = 'font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]';
const inputCls = 'w-full rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]';
const deleteBtnCls = 'rounded-[6px] border border-red-300 bg-red-50 px-[16px] py-[8px] font-mono text-[13px] font-medium text-red-600 hover:bg-red-100';

export default function CourseDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'enrolled' | 'subjects'>('enrolled');
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '', course_number: '', cme_type: 'Category 1', cme_total: '', value_total: '',
    course_type: 'Required', duration: '', department: '', start_date: '', end_date: '',
    prerequisites: '', materials_required: '', notes: '', status: 'DRAFT',
    chair_id: '', moderator1_id: '', moderator2_id: '', organizer_id: '', admin_id: '',
  });

  const fetchCourse = () => {
    if (!id) return;
    setLoading(true);
    api.courses.get(Number(id))
      .then((data: CourseData) => setCourse(data))
      .catch((err: unknown) => console.error('Failed to load course:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const openEdit = () => {
    if (!course) return;
    // Fetch people for dropdowns
    api.people.all().then((data: Person[]) => setPeople(data)).catch(() => {});
    setEditForm({
      name: course.name || '',
      course_number: course.course_number || '',
      cme_type: course.cme_type || 'Category 1',
      cme_total: course.cme_total != null ? String(course.cme_total) : '',
      value_total: course.value_total != null ? String(course.value_total) : '',
      course_type: course.course_type || 'Required',
      duration: course.duration || '',
      department: course.department || '',
      start_date: course.start_date ? course.start_date.substring(0, 10) : '',
      end_date: course.end_date ? course.end_date.substring(0, 10) : '',
      prerequisites: course.prerequisites || '',
      materials_required: course.materials_required || '',
      notes: course.notes || '',
      status: course.status || 'DRAFT',
      chair_id: course.chair_id != null ? String(course.chair_id) : '',
      moderator1_id: course.moderator1_id != null ? String(course.moderator1_id) : '',
      moderator2_id: course.moderator2_id != null ? String(course.moderator2_id) : '',
      organizer_id: course.organizer_id != null ? String(course.organizer_id) : '',
      admin_id: course.admin_id != null ? String(course.admin_id) : '',
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
      const payload: Record<string, unknown> = {
        name: editForm.name,
        course_number: editForm.course_number,
        cme_type: editForm.cme_type,
        course_type: editForm.course_type,
        duration: editForm.duration,
        department: editForm.department,
        start_date: editForm.start_date || undefined,
        end_date: editForm.end_date || undefined,
        prerequisites: editForm.prerequisites,
        materials_required: editForm.materials_required,
        notes: editForm.notes,
        status: editForm.status,
        chair_id: editForm.chair_id ? Number(editForm.chair_id) : null,
        cme_total: editForm.cme_total ? Number(editForm.cme_total) : 0,
        value_total: editForm.value_total ? Number(editForm.value_total) : 0,
        moderator1_id: editForm.moderator1_id ? Number(editForm.moderator1_id) : null,
        moderator2_id: editForm.moderator2_id ? Number(editForm.moderator2_id) : null,
        organizer_id: editForm.organizer_id ? Number(editForm.organizer_id) : null,
        admin_id: editForm.admin_id ? Number(editForm.admin_id) : null,
      };
      await api.courses.update(Number(id), payload);
      setIsEditing(false);
      fetchCourse();
    } catch (err) {
      console.error('Failed to update course:', err);
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
      await api.courses.delete(Number(id));
      navigate('/courses');
    } catch (err) {
      console.error('Failed to delete course:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--color-background)]">
        <div className="font-mono text-[14px] text-[var(--color-muted-foreground)] tracking-[0.05em]">
          Loading course...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--color-background)]">
        <div className="font-mono text-[14px] text-[var(--color-muted-foreground)] tracking-[0.05em]">
          Course not found.
        </div>
      </div>
    );
  }

  const completedCount = (course.attendees || []).filter(a => a.status === 'Completed').length;
  const enrolledCount = (course.attendees || []).length;
  const passRate = enrolledCount > 0 ? Math.round((completedCount / enrolledCount) * 100) : 0;

  const statusColor = (course.status || '') === 'Active'
    ? 'bg-green-500/20 text-green-600'
    : (course.status || '') === 'Completed'
      ? 'bg-blue-500/20 text-blue-600'
      : 'bg-gray-500/20 text-gray-500';

  return (
    <div className="flex flex-col h-full bg-[var(--color-background)]">
      {/* TopBar */}
      <div className="flex justify-between items-center px-[32px] py-[16px] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-[16px]">
          <button
            onClick={() => navigate('/courses')}
            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          >
            <ArrowLeft className="w-[20px] h-[20px]" />
          </button>
          <div>
            <h1 className="font-headline text-[20px] font-bold tracking-[2px] text-[var(--color-foreground)]">
              {course.name}
            </h1>
            <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
              {course.course_number} • {course.status}
            </p>
          </div>
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
            className="font-mono text-[13px] px-[16px] py-[8px] bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] hover:bg-[var(--color-muted)] font-bold tracking-[0.05em]"
          >
            EDIT
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-[720px] overflow-auto rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
            <h2 className="mb-[20px] font-headline text-[18px] font-bold text-[var(--color-foreground)]">
              Edit Course
            </h2>

            <div className="grid grid-cols-2 gap-x-[24px] gap-y-[16px]">
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>COURSE NAME</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>COURSE NUMBER</label>
                <input
                  type="text"
                  value={editForm.course_number}
                  onChange={(e) => handleEditChange('course_number', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>CME TYPE</label>
                <select
                  value={editForm.cme_type}
                  onChange={(e) => handleEditChange('cme_type', e.target.value)}
                  className={inputCls}
                >
                  <option>Category 1</option>
                  <option>Category 2</option>
                </select>
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>CME TOTAL</label>
                <input
                  type="number"
                  step="0.1"
                  value={editForm.cme_total}
                  onChange={(e) => handleEditChange('cme_total', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>VALUE TOTAL</label>
                <input
                  type="number"
                  value={editForm.value_total}
                  onChange={(e) => handleEditChange('value_total', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>COURSE TYPE</label>
                <select
                  value={editForm.course_type}
                  onChange={(e) => handleEditChange('course_type', e.target.value)}
                  className={inputCls}
                >
                  <option>Required</option>
                  <option>Elective</option>
                  <option>Continuing Education</option>
                </select>
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>DURATION</label>
                <input
                  type="text"
                  value={editForm.duration}
                  onChange={(e) => handleEditChange('duration', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>DEPARTMENT</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => handleEditChange('department', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>START DATE</label>
                <input
                  type="date"
                  value={editForm.start_date}
                  onChange={(e) => handleEditChange('start_date', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>END DATE</label>
                <input
                  type="date"
                  value={editForm.end_date}
                  onChange={(e) => handleEditChange('end_date', e.target.value)}
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
                  <option value="DRAFT">DRAFT</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              {/* Personnel selects */}
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>CHAIR</label>
                <select
                  value={editForm.chair_id}
                  onChange={(e) => handleEditChange('chair_id', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select chair</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>MODERATOR 1</label>
                <select
                  value={editForm.moderator1_id}
                  onChange={(e) => handleEditChange('moderator1_id', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select moderator</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>MODERATOR 2</label>
                <select
                  value={editForm.moderator2_id}
                  onChange={(e) => handleEditChange('moderator2_id', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select moderator</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>ORGANIZER</label>
                <select
                  value={editForm.organizer_id}
                  onChange={(e) => handleEditChange('organizer_id', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select organizer</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>ADMIN</label>
                <select
                  value={editForm.admin_id}
                  onChange={(e) => handleEditChange('admin_id', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select admin</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 flex flex-col gap-[4px]">
                <label className={labelCls}>PREREQUISITES</label>
                <textarea
                  value={editForm.prerequisites}
                  onChange={(e) => handleEditChange('prerequisites', e.target.value)}
                  rows={2}
                  className={inputCls}
                />
              </div>
              <div className="col-span-2 flex flex-col gap-[4px]">
                <label className={labelCls}>MATERIALS REQUIRED</label>
                <textarea
                  value={editForm.materials_required}
                  onChange={(e) => handleEditChange('materials_required', e.target.value)}
                  rows={2}
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

      {/* Main Content */}
      <div className="flex gap-[24px] px-[32px] py-[24px] overflow-auto">
        {/* Left Column */}
        <div className="flex-1 space-y-[24px]">
          {/* Course Information Card */}
          <div className="border border-[var(--color-border)] rounded-[8px] p-[24px]">
            <h2 className="font-headline text-[16px] font-bold tracking-[1.5px] text-[var(--color-foreground)] mb-[20px]">
              COURSE INFORMATION
            </h2>

            <div className="space-y-[16px]">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-[24px]">
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    COURSE NAME
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    {course.name}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    STATUS
                  </div>
                  <span className={`inline-block px-[8px] py-[2px] ${statusColor} rounded-[4px] text-[11px] font-mono font-bold tracking-[0.05em]`}>
                    {(course.status || 'DRAFT').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-[24px]">
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    COURSE NR
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    {course.course_number}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    COURSE TYPE
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    {course.course_type}
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-[24px]">
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    CME TYPE
                  </div>
                  <span className="inline-block px-[8px] py-[2px] bg-[#FACC15]/20 text-[#FACC15] rounded-[4px] text-[11px] font-mono font-bold tracking-[0.05em]">
                    {(course.cme_type || 'Category 1').toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    CME TOTAL
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    {(Number(course.cme_total) || 0).toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-2 gap-[24px]">
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    SERVICE-DEPT
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    {course.department}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    VALUE TOTAL
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    ${(Number(course.value_total) || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              <div className="border-t border-[var(--color-border)] pt-[16px]">
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  PREREQUISITES
                </div>
                <div className="font-mono text-[13px] text-[var(--color-foreground)] leading-relaxed">
                  {course.prerequisites || 'None'}
                </div>
              </div>

              {/* Materials Required */}
              <div className="border-t border-[var(--color-border)] pt-[16px]">
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  MATERIALS REQUIRED
                </div>
                <div className="font-mono text-[13px] text-[var(--color-foreground)] leading-relaxed">
                  {course.materials_required || 'None'}
                </div>
              </div>

              {/* Notes */}
              <div className="border-t border-[var(--color-border)] pt-[16px]">
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  NOTES
                </div>
                <div className="font-mono text-[13px] text-[var(--color-foreground)] leading-relaxed">
                  {course.notes || 'None'}
                </div>
              </div>
            </div>
          </div>

          {/* Personnel Card */}
          <div className="border border-[var(--color-border)] rounded-[8px] p-[24px]">
            <h2 className="font-headline text-[16px] font-bold tracking-[1.5px] text-[var(--color-foreground)] mb-[20px]">
              PERSONNEL
            </h2>

            <div className="space-y-[16px]">
              {/* Chair */}
              <div>
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  CHAIR
                </div>
                <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                  {course.chair_name || '\u2014'}
                </div>
              </div>

              {/* Moderators */}
              <div className="grid grid-cols-2 gap-[24px] border-t border-[var(--color-border)] pt-[16px]">
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    MODERATOR 1
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    {course.moderator1_name || '\u2014'}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    MODERATOR 2
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    {course.moderator2_name || '\u2014'}
                  </div>
                </div>
              </div>

              {/* Organizer & Admin */}
              <div className="grid grid-cols-2 gap-[24px] border-t border-[var(--color-border)] pt-[16px]">
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    ORGANIZER
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    {course.organizer_name || '\u2014'}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    ADMIN
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    {course.admin_name || '\u2014'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[320px] space-y-[24px]">
          {/* Course Stats Card */}
          <div className="border border-[var(--color-border)] rounded-[8px] p-[20px]">
            <h2 className="font-headline text-[16px] font-bold tracking-[1.5px] text-[var(--color-foreground)] mb-[20px]">
              COURSE STATS
            </h2>

            <div className="space-y-[16px]">
              <div>
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  ENROLLED
                </div>
                <div className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
                  {enrolledCount}
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-[16px]">
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  COMPLETED
                </div>
                <div className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
                  {completedCount}
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-[16px]">
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  CME TOTAL
                </div>
                <div className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
                  {(Number(course.cme_total) || 0).toFixed(1)}
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-[16px]">
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  VALUE TOTAL
                </div>
                <div className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
                  ${(Number(course.value_total) || 0).toLocaleString()}
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-[16px]">
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  PASS RATE
                </div>
                <div className="font-headline text-[28px] font-bold text-green-600">
                  {passRate}%
                </div>
              </div>
            </div>
          </div>

          {/* Students/Subjects Card */}
          <div className="border border-[var(--color-border)] rounded-[8px] p-[20px]">
            {/* Tabs */}
            <div className="flex gap-[16px] mb-[16px] border-b border-[var(--color-border)]">
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`font-mono text-[13px] pb-[8px] ${
                  activeTab === 'enrolled'
                    ? 'border-b-2 border-[#FACC15] text-[var(--color-foreground)] font-bold'
                    : 'text-[var(--color-muted-foreground)]'
                }`}
              >
                Enrolled
              </button>
              <button
                onClick={() => setActiveTab('subjects')}
                className={`font-mono text-[13px] pb-[8px] ${
                  activeTab === 'subjects'
                    ? 'border-b-2 border-[#FACC15] text-[var(--color-foreground)] font-bold'
                    : 'text-[var(--color-muted-foreground)]'
                }`}
              >
                Subjects
              </button>
            </div>

            {/* Student List */}
            {activeTab === 'enrolled' && (
              <div className="space-y-[12px]">
                {(course.attendees || []).length === 0 && (
                  <div className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
                    No enrolled students.
                  </div>
                )}
                {(course.attendees || []).map((attendee) => (
                  <div
                    key={attendee.person_id}
                    onClick={() => navigate(`/hr/${attendee.person_id}`)}
                    className="border-l-[3px] border-l-[#FACC15] pl-[12px] py-[8px] cursor-pointer hover:bg-[var(--color-input)] rounded-r-[4px] transition-colors"
                  >
                    <div className="font-mono text-[13px] font-medium text-[var(--color-foreground)]">
                      {attendee.name}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--color-muted-foreground)] mt-[2px]">
                      {attendee.status}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Subjects Tab Content */}
            {activeTab === 'subjects' && (
              <div className="space-y-[12px]">
                {(course.meetings || []).length === 0 && (
                  <div className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
                    No meetings scheduled.
                  </div>
                )}
                {(course.meetings || []).map((meeting) => (
                  <div
                    key={meeting.id}
                    onClick={() => navigate(`/meetings/${meeting.id}`)}
                    className="border-l-[3px] border-l-blue-500 pl-[12px] py-[8px] cursor-pointer hover:bg-[var(--color-input)] rounded-r-[4px] transition-colors"
                  >
                    <div className="font-mono text-[13px] font-medium text-[var(--color-foreground)]">
                      {meeting.title}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--color-muted-foreground)] mt-[2px]">
                      {meeting.meeting_date ? new Date(meeting.meeting_date.substring(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''} • {meeting.start_time} - {meeting.end_time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
