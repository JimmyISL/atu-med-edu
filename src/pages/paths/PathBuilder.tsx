import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, X, GripVertical, ChevronDown } from 'lucide-react';
import { api } from '../../api';

interface Course {
  id: number;
  name: string;
  course_number: string;
  department: string;
  status: string;
}

interface BuilderStep {
  course_id: number;
  course_name: string;
  course_number: string;
  step_group: number;
  step_order: number;
  is_required: boolean;
}

const labelCls = 'font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]';
const inputCls = 'w-full rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]';

export default function PathBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pathName, setPathName] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [steps, setSteps] = useState<BuilderStep[]>([]);
  const [search, setSearch] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ---- data loading ----

  const loadPath = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.paths.get(Number(id));
      setPathName(data.name || '');
      // Map existing steps from the path detail response
      const existing: BuilderStep[] = (data.steps || []).map((s: any) => ({
        course_id: s.course_id,
        course_name: s.course_name || s.name || '',
        course_number: s.course_number || '',
        step_group: s.step_group,
        step_order: s.step_order,
        is_required: s.is_required ?? true,
      }));
      setSteps(existing);
    } catch (err) {
      console.error('Failed to load path:', err);
    }
  }, [id]);

  const loadCourses = useCallback(async () => {
    try {
      const res = await api.courses.list({ limit: '500' });
      const data: Course[] = Array.isArray(res) ? res : res.data ?? [];
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadPath(), loadCourses()]).finally(() => setLoading(false));
  }, [loadPath, loadCourses]);

  // ---- derived data ----

  // Group steps by step_group to form phases
  const phases: BuilderStep[][] = [];
  if (steps.length > 0) {
    const groupMap = new Map<number, BuilderStep[]>();
    for (const s of steps) {
      if (!groupMap.has(s.step_group)) groupMap.set(s.step_group, []);
      groupMap.get(s.step_group)!.push(s);
    }
    const sortedKeys = Array.from(groupMap.keys()).sort((a, b) => a - b);
    for (const key of sortedKeys) {
      const group = groupMap.get(key)!;
      group.sort((a, b) => a.step_order - b.step_order);
      phases.push(group);
    }
  }

  // Course IDs already in the builder
  const usedCourseIds = new Set(steps.map((s) => s.course_id));

  // Filtered catalog courses
  const filteredCourses = courses.filter((c) => {
    if (usedCourseIds.has(c.id)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.course_number.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q)
    );
  });

  // ---- helpers ----

  const markChanged = () => {
    if (!hasChanges) setHasChanges(true);
  };

  // Renumber all steps sequentially so step_group starts at 1 and step_order starts at 1 within each group
  const renumber = (input: BuilderStep[][]): BuilderStep[] => {
    const flat: BuilderStep[] = [];
    input.forEach((group, gi) => {
      group.forEach((step, si) => {
        flat.push({ ...step, step_group: gi + 1, step_order: si + 1 });
      });
    });
    return flat;
  };

  // ---- actions ----

  const addCourseToLastPhase = (course: Course) => {
    const newStep: BuilderStep = {
      course_id: course.id,
      course_name: course.name,
      course_number: course.course_number,
      step_group: phases.length > 0 ? phases[phases.length - 1][0].step_group : 1,
      step_order: phases.length > 0 ? phases[phases.length - 1].length + 1 : 1,
      is_required: true,
    };

    if (phases.length === 0) {
      // Create first phase
      setSteps([{ ...newStep, step_group: 1, step_order: 1 }]);
    } else {
      setSteps((prev) => [...prev, newStep]);
    }
    markChanged();
  };

  const removeCourse = (courseId: number) => {
    setSteps((prev) => {
      const filtered = prev.filter((s) => s.course_id !== courseId);
      // Rebuild phases from filtered and renumber
      const groupMap = new Map<number, BuilderStep[]>();
      for (const s of filtered) {
        if (!groupMap.has(s.step_group)) groupMap.set(s.step_group, []);
        groupMap.get(s.step_group)!.push(s);
      }
      const sortedKeys = Array.from(groupMap.keys()).sort((a, b) => a - b);
      const phasesArr: BuilderStep[][] = sortedKeys.map((k) => {
        const g = groupMap.get(k)!;
        g.sort((a, b) => a.step_order - b.step_order);
        return g;
      });
      // Remove empty phases
      const nonEmpty = phasesArr.filter((p) => p.length > 0);
      return renumber(nonEmpty);
    });
    markChanged();
  };

  const toggleRequired = (courseId: number) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.course_id === courseId ? { ...s, is_required: !s.is_required } : s
      )
    );
    markChanged();
  };

  const addPhase = () => {
    setEmptyPhaseCount((prev) => prev + 1);
    markChanged();
  };

  // Track the number of trailing empty phases (phases with no courses yet)
  const [emptyPhaseCount, setEmptyPhaseCount] = useState(0);

  // Total visual phases = real phases + empty trailing phases
  const totalPhaseCount = phases.length + emptyPhaseCount;

  // When we add a course via the catalog click, target the very last phase (including empty ones)
  const handleAddCourseFromCatalog = (course: Course) => {
    if (totalPhaseCount === 0) {
      // No phases exist at all - create phase 1
      const newStep: BuilderStep = {
        course_id: course.id,
        course_name: course.name,
        course_number: course.course_number,
        step_group: 1,
        step_order: 1,
        is_required: true,
      };
      setSteps([newStep]);
      markChanged();
      return;
    }

    if (emptyPhaseCount > 0) {
      // Fill the first empty phase
      const newGroupNumber = phases.length + 1;
      const newStep: BuilderStep = {
        course_id: course.id,
        course_name: course.name,
        course_number: course.course_number,
        step_group: newGroupNumber,
        step_order: 1,
        is_required: true,
      };
      setSteps((prev) => [...prev, newStep]);
      setEmptyPhaseCount((prev) => prev - 1);
      markChanged();
      return;
    }

    // Add to last existing phase
    addCourseToLastPhase(course);
  };

  const deletePhase = (phaseIndex: number) => {
    if (phaseIndex >= phases.length) {
      // It's an empty trailing phase
      setEmptyPhaseCount((prev) => Math.max(0, prev - 1));
      markChanged();
      return;
    }

    const groupToDelete = phases[phaseIndex][0].step_group;
    setSteps((prev) => {
      const filtered = prev.filter((s) => s.step_group !== groupToDelete);
      // Rebuild and renumber
      const groupMap = new Map<number, BuilderStep[]>();
      for (const s of filtered) {
        if (!groupMap.has(s.step_group)) groupMap.set(s.step_group, []);
        groupMap.get(s.step_group)!.push(s);
      }
      const sortedKeys = Array.from(groupMap.keys()).sort((a, b) => a - b);
      const phasesArr = sortedKeys.map((k) => {
        const g = groupMap.get(k)!;
        g.sort((a, b) => a.step_order - b.step_order);
        return g;
      });
      return renumber(phasesArr);
    });
    markChanged();
  };

  const movePhaseUp = (phaseIndex: number) => {
    if (phaseIndex <= 0 || phaseIndex >= phases.length) return;
    const newPhases = [...phases];
    [newPhases[phaseIndex - 1], newPhases[phaseIndex]] = [newPhases[phaseIndex], newPhases[phaseIndex - 1]];
    setSteps(renumber(newPhases));
    markChanged();
  };

  const movePhaseDown = (phaseIndex: number) => {
    if (phaseIndex >= phases.length - 1) return;
    const newPhases = [...phases];
    [newPhases[phaseIndex], newPhases[phaseIndex + 1]] = [newPhases[phaseIndex + 1], newPhases[phaseIndex]];
    setSteps(renumber(newPhases));
    markChanged();
  };

  // ---- save ----

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const payload = steps.map((s) => ({
        course_id: s.course_id,
        step_group: s.step_group,
        step_order: s.step_order,
        is_required: s.is_required,
      }));
      await api.paths.saveSteps(Number(id), payload);
      setHasChanges(false);
      setEmptyPhaseCount(0);
    } catch (err) {
      console.error('Failed to save steps:', err);
    } finally {
      setSaving(false);
    }
  };

  // ---- loading state ----

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--color-background)]">
        <div className="font-mono text-[14px] text-[var(--color-muted-foreground)] tracking-[0.05em]">
          Loading builder...
        </div>
      </div>
    );
  }

  // ---- render ----

  return (
    <div className="flex flex-col h-full bg-[var(--color-background)]">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-[32px] py-[16px] border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="flex items-center gap-[16px]">
          <button
            onClick={() => navigate(`/paths/${id}`)}
            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <ArrowLeft className="w-[20px] h-[20px]" />
          </button>
          <div>
            <h1 className="font-headline text-[20px] font-bold tracking-[2px] text-[var(--color-foreground)]">
              PATH BUILDER
            </h1>
            <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
              {pathName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-[16px]">
          {hasChanges && (
            <div className="flex items-center gap-[8px]">
              <span className="inline-block w-[8px] h-[8px] rounded-full bg-amber-400" />
              <span className="font-mono text-[12px] text-amber-500">
                Unsaved changes
              </span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-[16px] py-[8px] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-[6px] font-mono text-[13px] font-bold tracking-[0.05em] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>

      {/* Split Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Course Catalog */}
        <div className="w-[320px] border-r border-[var(--color-border)] flex flex-col bg-[var(--color-background)]">
          {/* Catalog Header */}
          <div className="px-[16px] py-[16px] border-b border-[var(--color-border)]">
            <span className={labelCls}>COURSE CATALOG</span>
          </div>

          {/* Search */}
          <div className="px-[16px] py-[12px]">
            <div className="relative">
              <Search className="absolute left-[10px] top-[50%] translate-y-[-50%] w-[14px] h-[14px] text-[var(--color-muted-foreground)]" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputCls} pl-[32px]`}
              />
            </div>
          </div>

          {/* Course List */}
          <div className="flex-1 overflow-auto px-[16px] pb-[16px] space-y-[8px]">
            {filteredCourses.length === 0 && (
              <div className="py-[24px] text-center font-mono text-[12px] text-[var(--color-muted-foreground)]">
                {courses.length === 0 ? 'No courses available.' : 'All courses have been added.'}
              </div>
            )}
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleAddCourseFromCatalog(course)}
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[6px] p-[12px] cursor-pointer hover:border-[var(--color-foreground)] transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                      {course.course_number}
                    </div>
                    <div className="text-[13px] font-medium text-[var(--color-foreground)] mt-[2px] truncate">
                      {course.name}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--color-muted-foreground)] mt-[4px]">
                      {course.department}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddCourseFromCatalog(course);
                    }}
                    className="ml-[8px] mt-[2px] p-[4px] rounded-[4px] text-[var(--color-muted-foreground)] opacity-0 group-hover:opacity-100 hover:bg-[var(--color-input)] hover:text-[var(--color-foreground)] transition-all"
                  >
                    <Plus className="w-[14px] h-[14px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Builder */}
        <div className="flex-1 overflow-auto p-[24px]">
          {totalPhaseCount === 0 ? (
            /* Empty State */
            <div className="flex items-center justify-center h-full">
              <div className="border-2 border-dashed border-[var(--color-border)] rounded-[12px] px-[48px] py-[40px] text-center max-w-[400px]">
                <p className="font-mono text-[13px] text-[var(--color-muted-foreground)] leading-relaxed">
                  Click courses from the catalog to start building your path.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-[4px]">
              {/* Render real phases */}
              {phases.map((phaseSteps, pi) => (
                <div key={`phase-${pi}`}>
                  {/* Phase Card */}
                  <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] overflow-hidden">
                    {/* Phase Header */}
                    <div className="flex items-center justify-between px-[16px] py-[12px] bg-[var(--color-background)] border-b border-[var(--color-border)]">
                      <div className="flex items-center gap-[12px]">
                        <span className={labelCls}>
                          PHASE {pi + 1}
                        </span>
                        <span className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                          &middot; {phaseSteps.length} course{phaseSteps.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-[4px]">
                        <button
                          onClick={() => movePhaseUp(pi)}
                          disabled={pi === 0}
                          className="p-[4px] rounded-[4px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-input)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move phase up"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                        </button>
                        <button
                          onClick={() => movePhaseDown(pi)}
                          disabled={pi >= phases.length - 1}
                          className="p-[4px] rounded-[4px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-input)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move phase down"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <button
                          onClick={() => deletePhase(pi)}
                          className="p-[4px] rounded-[4px] text-[var(--color-muted-foreground)] hover:text-red-500 hover:bg-red-50 transition-colors ml-[4px]"
                          title="Delete phase"
                        >
                          <X className="w-[14px] h-[14px]" />
                        </button>
                      </div>
                    </div>

                    {/* Course Items */}
                    <div>
                      {phaseSteps.map((step) => (
                        <div
                          key={step.course_id}
                          className={`flex items-center justify-between px-[16px] py-[10px] border-b border-[var(--color-border)] last:border-b-0 ${
                            step.is_required
                              ? 'border-l-[3px] border-l-[#2596be]'
                              : 'border-l-[3px] border-l-gray-300 border-l-dashed'
                          }`}
                          style={!step.is_required ? { borderLeftStyle: 'dashed' } : undefined}
                        >
                          <div className="flex items-center gap-[12px] min-w-0">
                            <GripVertical className="w-[14px] h-[14px] text-[var(--color-muted-foreground)] flex-shrink-0 cursor-grab" />
                            <div className="min-w-0">
                              <span className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                                {step.course_number}
                              </span>
                              <div className="text-[13px] font-medium text-[var(--color-foreground)] truncate">
                                {step.course_name}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-[8px] flex-shrink-0 ml-[12px]">
                            <button
                              onClick={() => toggleRequired(step.course_id)}
                              className={`px-[8px] py-[2px] rounded-[4px] font-mono text-[10px] font-bold tracking-[0.05em] transition-colors ${
                                step.is_required
                                  ? 'bg-[#2596be]/20 text-[#B8960F] hover:bg-[#2596be]/30'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {step.is_required ? 'REQUIRED' : 'OPTIONAL'}
                            </button>
                            <button
                              onClick={() => removeCourse(step.course_id)}
                              className="p-[4px] rounded-[4px] text-[var(--color-muted-foreground)] hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <X className="w-[12px] h-[12px]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arrow Connector */}
                  {(pi < phases.length - 1 || emptyPhaseCount > 0) && (
                    <div className="flex justify-center py-[4px]">
                      <ChevronDown className="w-[20px] h-[20px] text-[var(--color-muted-foreground)]" />
                    </div>
                  )}
                </div>
              ))}

              {/* Render empty trailing phases */}
              {Array.from({ length: emptyPhaseCount }).map((_, ei) => {
                const phaseNum = phases.length + ei + 1;
                return (
                  <div key={`empty-phase-${ei}`}>
                    {/* Empty Phase Card */}
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] overflow-hidden">
                      <div className="flex items-center justify-between px-[16px] py-[12px] bg-[var(--color-background)] border-b border-[var(--color-border)]">
                        <div className="flex items-center gap-[12px]">
                          <span className={labelCls}>
                            PHASE {phaseNum}
                          </span>
                          <span className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                            &middot; 0 courses
                          </span>
                        </div>
                        <button
                          onClick={() => deletePhase(phases.length + ei)}
                          className="p-[4px] rounded-[4px] text-[var(--color-muted-foreground)] hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete phase"
                        >
                          <X className="w-[14px] h-[14px]" />
                        </button>
                      </div>
                      <div className="px-[16px] py-[20px] text-center">
                        <p className="font-mono text-[12px] text-[var(--color-muted-foreground)]">
                          Click a course from the catalog to add it to this phase.
                        </p>
                      </div>
                    </div>

                    {/* Arrow Connector between empty phases */}
                    {ei < emptyPhaseCount - 1 && (
                      <div className="flex justify-center py-[4px]">
                        <ChevronDown className="w-[20px] h-[20px] text-[var(--color-muted-foreground)]" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Phase Button */}
              <div className="pt-[12px]">
                <button
                  onClick={addPhase}
                  className="w-full py-[14px] border-2 border-dashed border-[var(--color-border)] rounded-[8px] font-mono text-[12px] font-bold tracking-[0.1em] text-[var(--color-muted-foreground)] hover:border-[var(--color-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                >
                  + ADD PHASE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
