import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import { api } from '../../api';

interface Course {
  id: number;
  name: string;
  course_number: string;
  instructor: string;
  cme_type: string;
  status: string;
}

interface CoursesResponse {
  data: Course[];
  total: number;
  page: number;
  limit: number;
}

interface Person {
  id: number;
  name: string;
  role: string;
  department: string;
}

interface FormData {
  name: string;
  course_number: string;
  chair_id: string;
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
  moderator1_id: string;
  moderator2_id: string;
  organizer_id: string;
  admin_id: string;
}

const initialFormData: FormData = {
  name: '',
  course_number: '',
  chair_id: '',
  cme_type: 'Category 1',
  cme_total: '',
  value_total: '',
  course_type: 'Required',
  duration: '',
  department: '',
  start_date: '',
  end_date: '',
  prerequisites: '',
  materials_required: '',
  notes: '',
  status: 'DRAFT',
  moderator1_id: '',
  moderator2_id: '',
  organizer_id: '',
  admin_id: '',
};

function getStatusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return 'green';
    case 'DRAFT':
      return 'amber';
    case 'ARCHIVED':
      return 'purple';
    default:
      return 'green';
  }
}

export default function CoursesList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'archived'>((searchParams.get('tab') as 'all' | 'active' | 'archived') || 'all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') || '');
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const limit = 20;
  const [people, setPeople] = useState<Person[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
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

  // Sync state to URL search params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (page > 1) params.page = String(page);
    if (activeTab !== 'all') params.tab = activeTab;
    if (debouncedSearch) params.q = debouncedSearch;
    setSearchParams(params, { replace: true });
  }, [page, activeTab, debouncedSearch, setSearchParams]);

  const fetchCourses = useCallback(async () => {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };
    if (activeTab !== 'all') {
      params.status = activeTab.toUpperCase();
    }
    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }
    try {
      const res: CoursesResponse = await api.courses.list(params);
      setCourses(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  }, [activeTab, debouncedSearch, page, limit]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Reset page when tab changes
  const handleTabChange = (tab: 'all' | 'active' | 'archived') => {
    setActiveTab(tab);
    setPage(1);
  };

  useEffect(() => {
    api.people.all().then((data: Person[]) => setPeople(data)).catch((err: unknown) => {
      console.error('Failed to fetch people:', err);
    });
  }, []);

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!formData.name.trim()) { setFormError('Course name is required.'); return; }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        course_number: formData.course_number,
        cme_type: formData.cme_type,
        course_type: formData.course_type,
        duration: formData.duration,
        department: formData.department,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        prerequisites: formData.prerequisites,
        materials_required: formData.materials_required,
        notes: formData.notes,
        status: formData.status,
        chair_id: formData.chair_id ? Number(formData.chair_id) : undefined,
        cme_total: formData.cme_total ? Number(formData.cme_total) : undefined,
        value_total: formData.value_total ? Number(formData.value_total) : undefined,
        moderator1_id: formData.moderator1_id ? Number(formData.moderator1_id) : undefined,
        moderator2_id: formData.moderator2_id ? Number(formData.moderator2_id) : undefined,
        organizer_id: formData.organizer_id ? Number(formData.organizer_id) : undefined,
        admin_id: formData.admin_id ? Number(formData.admin_id) : undefined,
      };
      await api.courses.create(payload);
      setIsModalOpen(false);
      setFormData(initialFormData);
      setFormError('');
      await fetchCourses();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create course.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColorClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500/20 text-green-600';
      case 'amber':
        return 'bg-amber-500/20 text-amber-600';
      case 'purple':
        return 'bg-purple-500/20 text-purple-600';
      default:
        return 'bg-green-500/20 text-green-600';
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const showingFrom = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, total);

  return (
    <div className="flex flex-col h-full bg-[var(--color-background)]">
      {/* TopBar */}
      <div className="flex justify-between items-center px-[32px] py-[16px] border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-headline text-[20px] font-bold tracking-[2px] text-[var(--color-foreground)]">
            COURSES
          </h1>
          <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
            Manage course catalog and assignments.
          </p>
        </div>
        <button
          onClick={() => { setFormError(''); setIsModalOpen(true); }}
          className="font-mono text-[13px] px-[16px] py-[8px] bg-[#FACC15] text-black rounded-[4px] flex items-center gap-[8px] hover:bg-[#FACC15]/90 font-bold tracking-[0.05em]"
        >
          <Plus className="w-[16px] h-[16px]" />
          ADD COURSE
        </button>
      </div>

      {/* Tabs and Search */}
      <div className="flex justify-between items-center px-[32px] py-[16px] border-b border-[var(--color-border)]">
        <div className="flex gap-[24px]">
          <button
            onClick={() => handleTabChange('all')}
            className={`font-mono text-[13px] pb-[4px] ${
              activeTab === 'all'
                ? 'border-b-2 border-[#FACC15] text-[var(--color-foreground)] font-bold'
                : 'text-[var(--color-muted-foreground)]'
            }`}
          >
            All Courses
          </button>
          <button
            onClick={() => handleTabChange('active')}
            className={`font-mono text-[13px] pb-[4px] ${
              activeTab === 'active'
                ? 'border-b-2 border-[#FACC15] text-[var(--color-foreground)] font-bold'
                : 'text-[var(--color-muted-foreground)]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => handleTabChange('archived')}
            className={`font-mono text-[13px] pb-[4px] ${
              activeTab === 'archived'
                ? 'border-b-2 border-[#FACC15] text-[var(--color-foreground)] font-bold'
                : 'text-[var(--color-muted-foreground)]'
            }`}
          >
            Archived
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="font-mono text-[13px] pl-[36px] pr-[12px] py-[8px] w-[240px] bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-[32px] py-[24px]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase text-left pb-[12px]">
                COURSE NAME
              </th>
              <th className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase text-left pb-[12px]">
                COURSE NR
              </th>
              <th className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase text-left pb-[12px]">
                INSTRUCTOR
              </th>
              <th className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase text-left pb-[12px]">
                CME TYPE
              </th>
              <th className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase text-left pb-[12px]">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="border-b border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-muted)]"
              >
                <td className="font-mono text-[13px] text-[var(--color-foreground)] py-[16px]">
                  {course.name}
                </td>
                <td className="font-mono text-[13px] text-[var(--color-muted-foreground)] py-[16px]">
                  {course.course_number}
                </td>
                <td className="font-mono text-[13px] text-[var(--color-muted-foreground)] py-[16px]">
                  {course.instructor}
                </td>
                <td className="font-mono text-[13px] text-[var(--color-muted-foreground)] py-[16px]">
                  {course.cme_type}
                </td>
                <td className="font-mono text-[13px] py-[16px]">
                  <span
                    className={`inline-block px-[8px] py-[2px] ${getStatusColorClass(
                      getStatusColor(course.status)
                    )} rounded-[4px] text-[11px] font-bold tracking-[0.05em]`}
                  >
                    {course.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center px-[32px] py-[16px] border-t border-[var(--color-border)]">
        <div className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
          {total === 0
            ? 'No courses'
            : `Showing ${showingFrom}-${showingTo} of ${total} courses`}
        </div>
        <div className="flex gap-[8px]">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="font-mono text-[13px] px-[12px] py-[6px] bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-muted-foreground)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button className="font-mono text-[13px] px-[12px] py-[6px] bg-[#FACC15] border border-[#FACC15] rounded-[4px] text-black font-bold">
            {page}
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="font-mono text-[13px] px-[12px] py-[6px] bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-muted-foreground)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add/Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] w-[800px] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-[24px] py-[16px] border-b border-[var(--color-border)]">
              <h2 className="font-headline text-[18px] font-bold tracking-[1.5px] text-[var(--color-foreground)]">
                ADD NEW COURSE
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                <X className="w-[20px] h-[20px]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-[24px] py-[20px] space-y-[20px]">
              {formError && (
                <div className="rounded-[6px] border border-red-300 bg-red-50 px-[16px] py-[12px] text-[13px] font-mono text-red-600">
                  {formError}
                </div>
              )}
              {/* Course Name */}
              <div>
                <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                  COURSE NAME
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  placeholder="Enter course name"
                />
              </div>

              {/* Course Nr */}
              <div>
                <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                  COURSE NR
                </label>
                <input
                  type="text"
                  value={formData.course_number}
                  onChange={(e) => handleFormChange('course_number', e.target.value)}
                  className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  placeholder="CRS-####"
                />
              </div>

              {/* Chair */}
              <div>
                <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                  CHAIR
                </label>
                <select
                  value={formData.chair_id}
                  onChange={(e) => handleFormChange('chair_id', e.target.value)}
                  className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  <option value="">Select chair</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* CME & Credits Section */}
              <div className="border-t border-[var(--color-border)] pt-[20px]">
                <h3 className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[16px]">
                  CME & CREDITS
                </h3>

                <div className="grid grid-cols-3 gap-[16px]">
                  {/* CME Type */}
                  <div>
                    <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                      CME TYPE
                    </label>
                    <select
                      value={formData.cme_type}
                      onChange={(e) => handleFormChange('cme_type', e.target.value)}
                      className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    >
                      <option>Category 1</option>
                      <option>Category 2</option>
                    </select>
                  </div>

                  {/* CME Total */}
                  <div>
                    <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                      CME TOTAL
                    </label>
                    <input
                      type="number"
                      value={formData.cme_total}
                      onChange={(e) => handleFormChange('cme_total', e.target.value)}
                      className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      placeholder="0.0"
                      step="0.1"
                    />
                  </div>

                  {/* Value Total */}
                  <div>
                    <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                      VALUE TOTAL
                    </label>
                    <input
                      type="number"
                      value={formData.value_total}
                      onChange={(e) => handleFormChange('value_total', e.target.value)}
                      className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      placeholder="$0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Course Type & Duration */}
              <div className="grid grid-cols-2 gap-[16px]">
                {/* Course Type */}
                <div>
                  <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                    COURSE TYPE
                  </label>
                  <select
                    value={formData.course_type}
                    onChange={(e) => handleFormChange('course_type', e.target.value)}
                    className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  >
                    <option>Required</option>
                    <option>Elective</option>
                    <option>Optional</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                    DURATION
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleFormChange('duration', e.target.value)}
                    className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    placeholder="e.g., 2 weeks, 40 hours"
                  />
                </div>
              </div>

              {/* Service/Dept */}
              <div>
                <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                  SERVICE/DEPT
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleFormChange('department', e.target.value)}
                  className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  <option value="">Select department</option>
                  <option>Cardiology</option>
                  <option>Internal Medicine</option>
                  <option>Surgery</option>
                  <option>Emergency Medicine</option>
                  <option>Pharmacology</option>
                </select>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-[16px]">
                {/* Start Date */}
                <div>
                  <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                    START DATE
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleFormChange('start_date', e.target.value)}
                    className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                    END DATE
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleFormChange('end_date', e.target.value)}
                    className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
              </div>

              {/* Personnel Section */}
              <div className="border-t border-[var(--color-border)] pt-[20px]">
                <h3 className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[16px]">
                  PERSONNEL
                </h3>

                <div className="grid grid-cols-2 gap-[16px]">
                  {/* Moderator 1 */}
                  <div>
                    <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                      MODERATOR 1
                    </label>
                    <select
                      value={formData.moderator1_id}
                      onChange={(e) => handleFormChange('moderator1_id', e.target.value)}
                      className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    >
                      <option value="">Select moderator</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Moderator 2 */}
                  <div>
                    <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                      MODERATOR 2
                    </label>
                    <select
                      value={formData.moderator2_id}
                      onChange={(e) => handleFormChange('moderator2_id', e.target.value)}
                      className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    >
                      <option value="">Select moderator</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Organizer */}
                  <div>
                    <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                      ORGANIZER
                    </label>
                    <select
                      value={formData.organizer_id}
                      onChange={(e) => handleFormChange('organizer_id', e.target.value)}
                      className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    >
                      <option value="">Select organizer</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Admin */}
                  <div>
                    <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                      ADMIN
                    </label>
                    <select
                      value={formData.admin_id}
                      onChange={(e) => handleFormChange('admin_id', e.target.value)}
                      className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    >
                      <option value="">Select admin</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="border-t border-[var(--color-border)] pt-[20px]">
                <h3 className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[16px]">
                  DETAILS
                </h3>

                {/* Prerequisites */}
                <div className="mb-[16px]">
                  <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                    PREREQUISITES
                  </label>
                  <textarea
                    value={formData.prerequisites}
                    onChange={(e) => handleFormChange('prerequisites', e.target.value)}
                    className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500 min-h-[80px]"
                    placeholder="Enter course prerequisites"
                  />
                </div>

                {/* Materials Required */}
                <div className="mb-[16px]">
                  <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                    MATERIALS REQUIRED
                  </label>
                  <textarea
                    value={formData.materials_required}
                    onChange={(e) => handleFormChange('materials_required', e.target.value)}
                    className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500 min-h-[80px]"
                    placeholder="Enter required materials"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                    NOTES
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500 min-h-[80px]"
                    placeholder="Enter additional notes"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-[12px] px-[24px] py-[16px] border-t border-[var(--color-border)]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="font-mono text-[13px] px-[16px] py-[8px] bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="font-mono text-[13px] px-[16px] py-[8px] bg-[#FACC15] text-black rounded-[4px] hover:bg-[#FACC15]/90 font-bold tracking-[0.05em]"
              >
                {submitting ? 'Saving...' : 'Save Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
