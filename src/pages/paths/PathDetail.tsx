import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Search, ChevronDown, GripVertical } from 'lucide-react';
import { api } from '../../api';

interface PathStep {
  id: number;
  course_id: number;
  course_name: string;
  course_number: string;
  step_group: number;
  step_order: number;
  is_required: boolean;
}

interface Trainee {
  id: number;  // trainee_path_id
  person_id: number;
  name: string;
  status: string;
  enrolled_at: string;
  progress_count: number;
  total_steps: number;
}

interface ActionItem {
  id: number;
  title: string;
  description: string;
  status: string;
  due_date: string;
  person_name: string;
}

interface Person {
  id: number;
  name: string;
  email?: string;
  role: string;
  department: string;
}

interface PathData {
  id: number;
  name: string;
  description: string;
  status: string;
  created_by: number;
  creator_name: string;
  created_at: string;
  updated_at: string;
  steps: PathStep[];
  trainees: Trainee[];
  actions: ActionItem[];
}

interface EditForm {
  name: string;
  description: string;
  status: string;
}

const labelCls = 'font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]';
const inputCls = 'w-full rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]';
const deleteBtnCls = 'rounded-[6px] border border-red-300 bg-red-50 px-[16px] py-[8px] font-mono text-[13px] font-medium text-red-600 hover:bg-red-100';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const ymd = dateStr.substring(0, 10);
  const date = new Date(ymd + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getStatusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case 'ACTIVE': return 'text-green-600 bg-green-50';
    case 'COMPLETED': return 'text-blue-600 bg-blue-50';
    case 'DRAFT': return 'text-amber-600 bg-amber-50';
    case 'ARCHIVED': return 'text-purple-600 bg-purple-50';
    case 'PAUSED': return 'text-amber-600 bg-amber-50';
    case 'DROPPED': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

function getActionStatusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case 'DONE': return 'text-green-600 bg-green-50';
    case 'PENDING': return 'text-amber-600 bg-amber-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

export default function PathDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [path, setPath] = useState<PathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editForm, setEditForm] = useState<EditForm>({
    name: '', description: '', status: 'DRAFT',
  });

  // Enroll Trainee modal state
  const [showEnrollTrainee, setShowEnrollTrainee] = useState(false);
  const [addTab, setAddTab] = useState<'hr' | 'quick'>('hr');
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [personSearch, setPersonSearch] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [addingTrainee, setAddingTrainee] = useState(false);
  const [quickForm, setQuickForm] = useState({ first_name: '', last_name: '', email: '' });

  const fetchPath = () => {
    if (!id) return;
    setLoading(true);
    api.paths
      .get(Number(id))
      .then((data: PathData) => {
        setPath(data);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to load training path');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPath();
  }, [id]);

  // ── Edit helpers ──
  const openEdit = () => {
    if (!path) return;
    setEditForm({
      name: path.name || '',
      description: path.description || '',
      status: path.status || 'DRAFT',
    });
    setEditError('');
    setIsEditing(true);
  };

  const handleEditChange = (field: keyof EditForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!id) return;
    setEditError('');
    if (!editForm.name.trim()) { setEditError('Path name is required.'); return; }
    setSaving(true);
    try {
      await api.paths.update(Number(id), {
        name: editForm.name,
        description: editForm.description,
        status: editForm.status,
      });
      setIsEditing(false);
      setEditError('');
      fetchPath();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update path.');
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
      await api.paths.delete(Number(id));
      navigate('/paths');
    } catch (err) {
      console.error('Failed to delete path:', err);
    }
  };

  // ── Enroll Trainee helpers ──
  const openEnrollTrainee = () => {
    setAddTab('hr');
    setPersonSearch('');
    setSelectedPersonId(null);
    setQuickForm({ first_name: '', last_name: '', email: '' });
    api.people.all().then((data: Person[]) => setAllPeople(data)).catch(() => {});
    setShowEnrollTrainee(true);
  };

  const existingIds = useMemo(
    () => new Set((path?.trainees || []).map((t) => t.person_id)),
    [path]
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
    setAddingTrainee(true);
    try {
      await api.paths.enrollTrainee(Number(id), { person_id: selectedPersonId });
      setShowEnrollTrainee(false);
      fetchPath();
    } catch (err) {
      console.error('Failed to enroll trainee:', err);
    } finally {
      setAddingTrainee(false);
    }
  };

  const handleQuickAdd = async () => {
    if (!id || !quickForm.first_name || !quickForm.last_name) return;
    setAddingTrainee(true);
    try {
      await api.paths.enrollTrainee(Number(id), {
        quick_add: true,
        first_name: quickForm.first_name,
        last_name: quickForm.last_name,
        email: quickForm.email || undefined,
      });
      setShowEnrollTrainee(false);
      fetchPath();
    } catch (err) {
      console.error('Failed to quick-add trainee:', err);
    } finally {
      setAddingTrainee(false);
    }
  };

  const handleRemoveTrainee = async (traineePathId: number) => {
    if (!id) return;
    try {
      await api.paths.removeTrainee(Number(id), traineePathId);
      fetchPath();
    } catch (err) {
      console.error('Failed to remove trainee:', err);
    }
  };

  // ── Derived data ──
  const steps = path?.steps || [];
  const trainees = path?.trainees || [];
  const actions = path?.actions || [];

  const groupedSteps = useMemo(() => {
    const groups: Record<number, PathStep[]> = {};
    steps.forEach((s) => {
      if (!groups[s.step_group]) groups[s.step_group] = [];
      groups[s.step_group].push(s);
    });
    // Sort each group by step_order
    Object.values(groups).forEach((g) => g.sort((a, b) => a.step_order - b.step_order));
    return groups;
  }, [steps]);

  const phaseNumbers = useMemo(() => Object.keys(groupedSteps).map(Number).sort((a, b) => a - b), [groupedSteps]);

  const distinctPhases = phaseNumbers.length;
  const totalCourses = steps.length;
  const traineeCount = trainees.length;
  const completedTrainees = trainees.filter((t) => t.status?.toUpperCase() === 'COMPLETED').length;
  const completionRate = traineeCount > 0 ? Math.round((completedTrainees / traineeCount) * 100) : 0;

  // ── Loading / Error states ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[var(--color-muted-foreground)] text-[14px]">Loading...</p>
      </div>
    );
  }

  if (error || !path) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600 text-[14px]">{error || 'Training path not found'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px] flex items-center justify-between">
        <div className="flex items-center gap-[16px]">
          <button
            onClick={() => navigate('/paths')}
            className="inline-flex items-center gap-[6px] font-mono text-[13px] text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
          >
            <ArrowLeft className="h-[16px] w-[16px]" />
            Back to Training Paths
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
          <button
            onClick={() => navigate(`/paths/${id}/builder`)}
            className="rounded-[6px] bg-[#2596be] px-[16px] py-[10px] font-mono text-[13px] font-medium text-[#09090B] transition-colors hover:bg-[#1e7da6]"
          >
            MANAGE STEPS
          </button>
        </div>
      </div>

      {/* Title sub-bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[16px]">
        <h1 className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
          {path.name}
        </h1>
        <p className="text-[var(--color-muted-foreground)] text-[14px] mt-[4px] flex items-center gap-[8px]">
          <span className="font-mono">PATH-{String(path.id).padStart(4, '0')}</span>
          <span>&bull;</span>
          <span className={`inline-flex px-[8px] py-[2px] rounded-[4px] text-[12px] font-medium font-mono ${getStatusColor(path.status)}`}>
            {path.status?.toUpperCase()}
          </span>
        </p>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-[720px] overflow-auto rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
            <h2 className="mb-[20px] font-headline text-[18px] font-bold text-[var(--color-foreground)]">
              Edit Training Path
            </h2>

            {editError && (
              <div className="mb-[16px] rounded-[6px] border border-red-300 bg-red-50 px-[16px] py-[12px] text-[13px] font-mono text-red-600">
                {editError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-y-[16px]">
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>NAME</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelCls}>DESCRIPTION</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  rows={4}
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
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
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
                className="rounded-[6px] bg-[#2596be] px-[16px] py-[8px] font-mono text-[13px] font-medium text-black transition-colors hover:bg-[#1e7da6] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Trainee Modal */}
      {showEnrollTrainee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[520px] max-h-[80vh] flex flex-col rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[var(--color-border)]">
              <h2 className="font-headline text-[18px] font-bold text-[var(--color-foreground)]">
                Enroll Trainee
              </h2>
              <button
                onClick={() => setShowEnrollTrainee(false)}
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
                    ? 'text-[#2596be] border-b-2 border-[#2596be]'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                Existing People
              </button>
              <button
                onClick={() => setAddTab('quick')}
                className={`flex-1 px-[20px] py-[12px] font-mono text-[12px] font-bold uppercase tracking-wide transition-colors ${
                  addTab === 'quick'
                    ? 'text-[#2596be] border-b-2 border-[#2596be]'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                New Person
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
                        {personSearch ? 'No matching people found' : 'All people are already enrolled'}
                      </p>
                    ) : (
                      filteredPeople.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPersonId(p.id)}
                          className={`w-full text-left px-[16px] py-[12px] border-b border-[var(--color-border)] last:border-0 transition-colors ${
                            selectedPersonId === p.id
                              ? 'bg-[#2596be]/10 border-l-2 border-l-[#2596be]'
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
                onClick={() => setShowEnrollTrainee(false)}
                className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[8px] font-mono text-[13px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-input)]"
              >
                Cancel
              </button>
              {addTab === 'hr' ? (
                <button
                  onClick={handleAddFromHR}
                  disabled={!selectedPersonId || addingTrainee}
                  className="rounded-[6px] bg-[#2596be] px-[16px] py-[8px] font-mono text-[13px] font-medium text-[#09090B] transition-colors hover:bg-[#1e7da6] disabled:opacity-50"
                >
                  {addingTrainee ? 'Enrolling...' : 'Enroll'}
                </button>
              ) : (
                <button
                  onClick={handleQuickAdd}
                  disabled={!quickForm.first_name || !quickForm.last_name || addingTrainee}
                  className="rounded-[6px] bg-[#2596be] px-[16px] py-[8px] font-mono text-[13px] font-medium text-[#09090B] transition-colors hover:bg-[#1e7da6] disabled:opacity-50"
                >
                  {addingTrainee ? 'Enrolling...' : 'Create & Enroll'}
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
          <div className="flex-1 space-y-[24px]">

            {/* Phases Card */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] overflow-hidden">
              <div className="px-[20px] py-[16px] border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-[12px]">
                  <h2 className="font-mono text-[13px] uppercase text-[var(--color-foreground)] font-bold">
                    PATH PHASES
                  </h2>
                  <span className="inline-flex items-center justify-center w-[24px] h-[24px] rounded-full bg-[var(--color-background)] text-[12px] font-mono font-medium text-[var(--color-foreground)]">
                    {distinctPhases}
                  </span>
                </div>
              </div>

              <div className="px-[20px] py-[20px]">
                {phaseNumbers.length === 0 ? (
                  <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
                    No steps configured. Use MANAGE STEPS to build this path.
                  </p>
                ) : (
                  <div className="space-y-[4px]">
                    {phaseNumbers.map((phaseNum, phaseIdx) => {
                      const phaseSteps = groupedSteps[phaseNum];
                      return (
                        <div key={phaseNum}>
                          {/* Phase label */}
                          <div className="font-mono text-[12px] uppercase font-medium text-[var(--color-muted-foreground)] mb-[8px]">
                            PHASE {phaseNum} &middot; {phaseSteps.length} course{phaseSteps.length !== 1 ? 's' : ''}
                          </div>

                          {/* Course cards */}
                          <div className="space-y-[8px] ml-[8px] mb-[8px]">
                            {phaseSteps.map((step) => (
                              <div
                                key={step.id}
                                className={`pl-[12px] py-[10px] pr-[12px] rounded-r-[4px] bg-[var(--color-background)] ${
                                  step.is_required
                                    ? 'border-l-[3px] border-l-[#2596be] border-l-solid'
                                    : 'border-l-[3px] border-l-[var(--color-border)] border-dashed'
                                }`}
                                style={!step.is_required ? { borderLeftStyle: 'dashed' } : undefined}
                              >
                                <div className="flex items-center gap-[8px]">
                                  <GripVertical className="h-[14px] w-[14px] text-[var(--color-muted-foreground)] opacity-40" />
                                  <div className="flex-1">
                                    <p className="font-mono text-[12px] text-[var(--color-muted-foreground)]">
                                      {step.course_number}
                                    </p>
                                    <p className="text-[14px] text-[var(--color-foreground)] font-medium">
                                      {step.course_name}
                                    </p>
                                  </div>
                                  <span className={`font-mono text-[10px] uppercase tracking-wide px-[6px] py-[2px] rounded-[3px] ${
                                    step.is_required
                                      ? 'text-amber-700 bg-amber-50'
                                      : 'text-gray-500 bg-gray-100'
                                  }`}>
                                    {step.is_required ? 'Required' : 'Optional'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Arrow connector between phases */}
                          {phaseIdx < phaseNumbers.length - 1 && (
                            <div className="flex justify-center py-[4px]">
                              <ChevronDown className="h-[20px] w-[20px] text-[var(--color-muted-foreground)]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Trainees Card */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] overflow-hidden">
              <div className="px-[20px] py-[16px] border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-[12px]">
                  <h2 className="font-mono text-[13px] uppercase text-[var(--color-foreground)] font-bold">
                    ENROLLED TRAINEES
                  </h2>
                  <span className="inline-flex items-center justify-center w-[24px] h-[24px] rounded-full bg-[var(--color-background)] text-[12px] font-mono font-medium text-[var(--color-foreground)]">
                    {traineeCount}
                  </span>
                </div>
                <button
                  onClick={openEnrollTrainee}
                  className="inline-flex items-center gap-[6px] rounded-[6px] bg-[#2596be] px-[12px] py-[6px] font-mono text-[11px] font-bold text-[#09090B] uppercase tracking-wide transition-colors hover:bg-[#1e7da6]"
                >
                  <Plus className="h-[14px] w-[14px]" />
                  ENROLL TRAINEE
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
                        STATUS
                      </th>
                      <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium">
                        PROGRESS
                      </th>
                      <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium">
                        ENROLLED
                      </th>
                      <th className="text-right px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainees.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-[16px] py-[20px] text-center font-mono text-[13px] text-[var(--color-muted-foreground)]">
                          No trainees enrolled yet.
                        </td>
                      </tr>
                    ) : (
                      trainees.map((trainee) => {
                        const pct = trainee.total_steps > 0
                          ? Math.round((trainee.progress_count / trainee.total_steps) * 100)
                          : 0;
                        return (
                          <tr
                            key={trainee.id}
                            className="group border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-input)] transition-colors"
                          >
                            <td
                              className="px-[16px] py-[14px] text-[14px] text-[var(--color-foreground)] font-medium cursor-pointer"
                              onClick={() => navigate(`/hr/${trainee.person_id}`)}
                            >
                              {trainee.name}
                            </td>
                            <td className="px-[16px] py-[14px]">
                              <span className={`inline-flex px-[8px] py-[4px] rounded-[4px] text-[12px] font-medium font-mono ${getStatusColor(trainee.status)}`}>
                                {trainee.status?.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-[16px] py-[14px]">
                              <div className="flex items-center gap-[8px]">
                                <div className="w-[80px] h-[6px] bg-[var(--color-background)] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#2596be] rounded-full transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="font-mono text-[12px] text-[var(--color-muted-foreground)]">
                                  {trainee.progress_count}/{trainee.total_steps}
                                </span>
                              </div>
                            </td>
                            <td className="px-[16px] py-[14px] text-[14px] text-[var(--color-muted-foreground)]">
                              {formatDate(trainee.enrolled_at)}
                            </td>
                            <td className="px-[16px] py-[14px] text-right">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveTrainee(trainee.id); }}
                                className="inline-flex items-center justify-center w-[28px] h-[28px] rounded-[4px] text-[var(--color-muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                                title="Remove trainee"
                              >
                                <X className="h-[14px] w-[14px]" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Items Card */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] overflow-hidden">
              <div className="px-[20px] py-[16px] border-b border-[var(--color-border)]">
                <h2 className="font-mono text-[13px] uppercase text-[var(--color-foreground)] font-bold">
                  ACTION ITEMS
                </h2>
              </div>

              <div className="px-[20px] py-[20px]">
                {actions.length === 0 ? (
                  <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
                    No action items.
                  </p>
                ) : (
                  <div className="space-y-[12px]">
                    {actions.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-[12px] border-b border-[var(--color-border)] pb-[12px] last:border-0 last:pb-0"
                      >
                        <div className="flex-1">
                          <p className="text-[14px] font-medium text-[var(--color-foreground)]">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-[13px] text-[var(--color-muted-foreground)] mt-[2px] leading-[1.5]">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-[12px] mt-[6px]">
                            <span className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                              {item.person_name}
                            </span>
                            {item.due_date && (
                              <span className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                                Due: {formatDate(item.due_date)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`inline-flex px-[8px] py-[4px] rounded-[4px] text-[11px] font-medium font-mono whitespace-nowrap ${getActionStatusColor(item.status)}`}>
                          {item.status?.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-[380px] space-y-[24px]">
            {/* Path Details Card */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] overflow-hidden">
              <div className="px-[20px] py-[16px] border-b border-[var(--color-border)]">
                <h2 className="font-mono text-[13px] uppercase text-[var(--color-foreground)] font-bold">
                  PATH DETAILS
                </h2>
              </div>

              <div className="px-[20px] py-[20px] space-y-[16px]">
                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    DESCRIPTION
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)] leading-[1.6]">
                    {path.description || '\u2014'}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    STATUS
                  </p>
                  <span className={`inline-flex px-[8px] py-[4px] rounded-[4px] text-[12px] font-medium font-mono ${getStatusColor(path.status)}`}>
                    {path.status?.toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    CREATED BY
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)]">
                    {path.creator_name || '\u2014'}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    CREATED
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)]">
                    {formatDate(path.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Path Stats Card */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] overflow-hidden">
              <div className="px-[20px] py-[16px] border-b border-[var(--color-border)]">
                <h2 className="font-mono text-[13px] uppercase text-[var(--color-foreground)] font-bold">
                  PATH STATS
                </h2>
              </div>

              <div className="px-[20px] py-[20px] space-y-[16px]">
                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    PHASES
                  </p>
                  <p className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
                    {distinctPhases}
                  </p>
                </div>

                <div className="border-t border-[var(--color-border)] pt-[16px]">
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    COURSES
                  </p>
                  <p className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
                    {totalCourses}
                  </p>
                </div>

                <div className="border-t border-[var(--color-border)] pt-[16px]">
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    TRAINEES
                  </p>
                  <p className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
                    {traineeCount}
                  </p>
                </div>

                <div className="border-t border-[var(--color-border)] pt-[16px]">
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    COMPLETION RATE
                  </p>
                  <p className="font-headline text-[28px] font-bold text-green-600">
                    {completionRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
