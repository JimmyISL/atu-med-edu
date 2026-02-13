import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CourseDetail() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'enrolled' | 'subjects'>('enrolled');

  const enrolledStudents = [
    { id: 1, name: 'Dr. Emily Chen', status: 'In Progress' },
    { id: 2, name: 'Dr. Michael Brown', status: 'Completed' },
    { id: 3, name: 'Dr. Jessica Taylor', status: 'In Progress' },
    { id: 4, name: 'Dr. David Martinez', status: 'Completed' },
    { id: 5, name: 'Dr. Laura Anderson', status: 'In Progress' },
    { id: 6, name: 'Dr. Robert Garcia', status: 'Completed' }
  ];

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
              Advanced Cardiac Life Support
            </h1>
            <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
              CRS-1001 • Active
            </p>
          </div>
        </div>
        <button className="font-mono text-[13px] px-[16px] py-[8px] bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] hover:bg-[var(--color-muted)] font-bold tracking-[0.05em]">
          EDIT
        </button>
      </div>

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
                    Advanced Cardiac Life Support
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    STATUS
                  </div>
                  <span className="inline-block px-[8px] py-[2px] bg-green-500/20 text-green-600 rounded-[4px] text-[11px] font-mono font-bold tracking-[0.05em]">
                    ACTIVE
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
                    CRS-1001
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    COURSE TYPE
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    Required
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
                    CATEGORY 1
                  </span>
                </div>
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    CME TOTAL
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    24.0
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
                    Cardiology
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    VALUE TOTAL
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    $4,800
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              <div className="border-t border-[var(--color-border)] pt-[16px]">
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  PREREQUISITES
                </div>
                <div className="font-mono text-[13px] text-[var(--color-foreground)] leading-relaxed">
                  Current BLS certification required. Must have completed basic medical training and possess current medical license. Recommended: Previous experience in emergency or critical care settings.
                </div>
              </div>

              {/* Materials Required */}
              <div className="border-t border-[var(--color-border)] pt-[16px]">
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  MATERIALS REQUIRED
                </div>
                <div className="font-mono text-[13px] text-[var(--color-foreground)] leading-relaxed">
                  ACLS Provider Manual (current edition), pocket mask, access to online pre-course self-assessment, comfortable clothing suitable for physical activity, writing materials for note-taking.
                </div>
              </div>

              {/* Notes */}
              <div className="border-t border-[var(--color-border)] pt-[16px]">
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  NOTES
                </div>
                <div className="font-mono text-[13px] text-[var(--color-foreground)] leading-relaxed">
                  This course follows AHA guidelines and includes hands-on practice with mannequins, team-based scenarios, and written assessments. Participants must achieve minimum 84% on written exam and demonstrate competency in all skills stations to receive certification.
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
                  Dr. Sarah Mitchell
                </div>
              </div>

              {/* Moderators */}
              <div className="grid grid-cols-2 gap-[24px] border-t border-[var(--color-border)] pt-[16px]">
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    MODERATOR 1
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    Dr. James Wilson
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    MODERATOR 2
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    Dr. Chen Wei
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
                    Maria Santos
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                    ADMIN
                  </div>
                  <div className="font-mono text-[13px] text-[var(--color-foreground)]">
                    Anna Kowalski
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
                  24
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-[16px]">
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  COMPLETED
                </div>
                <div className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
                  18
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-[16px]">
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  CME TOTAL
                </div>
                <div className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
                  24.0
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-[16px]">
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  VALUE TOTAL
                </div>
                <div className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
                  $4,800
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-[16px]">
                <div className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[6px]">
                  PASS RATE
                </div>
                <div className="font-headline text-[28px] font-bold text-green-600">
                  94%
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
                {enrolledStudents.map((student) => (
                  <div
                    key={student.id}
                    className="border-l-[3px] border-l-[#FACC15] pl-[12px] py-[8px]"
                  >
                    <div className="font-mono text-[13px] font-medium text-[var(--color-foreground)]">
                      {student.name}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--color-muted-foreground)] mt-[2px]">
                      {student.status}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Subjects Tab Content */}
            {activeTab === 'subjects' && (
              <div className="space-y-[12px]">
                <div className="border-l-[3px] border-l-blue-500 pl-[12px] py-[8px]">
                  <div className="font-mono text-[13px] font-medium text-[var(--color-foreground)]">
                    Cardiac Arrest Management
                  </div>
                  <div className="font-mono text-[11px] text-[var(--color-muted-foreground)] mt-[2px]">
                    Module 1 • 6 hours
                  </div>
                </div>
                <div className="border-l-[3px] border-l-blue-500 pl-[12px] py-[8px]">
                  <div className="font-mono text-[13px] font-medium text-[var(--color-foreground)]">
                    Rhythm Recognition
                  </div>
                  <div className="font-mono text-[11px] text-[var(--color-muted-foreground)] mt-[2px]">
                    Module 2 • 4 hours
                  </div>
                </div>
                <div className="border-l-[3px] border-l-blue-500 pl-[12px] py-[8px]">
                  <div className="font-mono text-[13px] font-medium text-[var(--color-foreground)]">
                    Advanced Airways
                  </div>
                  <div className="font-mono text-[11px] text-[var(--color-muted-foreground)] mt-[2px]">
                    Module 3 • 5 hours
                  </div>
                </div>
                <div className="border-l-[3px] border-l-blue-500 pl-[12px] py-[8px]">
                  <div className="font-mono text-[13px] font-medium text-[var(--color-foreground)]">
                    Pharmacology Review
                  </div>
                  <div className="font-mono text-[11px] text-[var(--color-muted-foreground)] mt-[2px]">
                    Module 4 • 4 hours
                  </div>
                </div>
                <div className="border-l-[3px] border-l-blue-500 pl-[12px] py-[8px]">
                  <div className="font-mono text-[13px] font-medium text-[var(--color-foreground)]">
                    Team Dynamics
                  </div>
                  <div className="font-mono text-[11px] text-[var(--color-muted-foreground)] mt-[2px]">
                    Module 5 • 5 hours
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
