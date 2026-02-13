export default function MeetingDetail() {

  const attendees = [
    {
      id: 1,
      name: 'Dr. Sarah Mitchell',
      role: 'Professor',
      department: 'Anatomy',
      attendance: 'PRESENT',
      attendanceColor: 'text-green-600 bg-green-50',
    },
    {
      id: 2,
      name: 'Dr. James Thompson',
      role: 'Associate Professor',
      department: 'Surgery',
      attendance: 'PRESENT',
      attendanceColor: 'text-green-600 bg-green-50',
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      role: 'Resident',
      department: 'Internal Medicine',
      attendance: 'ABSENT',
      attendanceColor: 'text-red-600 bg-red-50',
    },
    {
      id: 4,
      name: 'Dr. Michael Chen',
      role: 'Assistant Professor',
      department: 'Radiology',
      attendance: 'PRESENT',
      attendanceColor: 'text-green-600 bg-green-50',
    },
    {
      id: 5,
      name: 'Dr. Amanda Foster',
      role: 'Lecturer',
      department: 'Pathology',
      attendance: 'EXCUSED',
      attendanceColor: 'text-amber-600 bg-amber-50',
    },
    {
      id: 6,
      name: 'Dr. Robert Kim',
      role: 'Resident',
      department: 'Emergency Medicine',
      attendance: 'PRESENT',
      attendanceColor: 'text-green-600 bg-green-50',
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px] flex items-center justify-between">
        <div>
          <h1 className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
            Anatomy Lab Review
          </h1>
          <p className="text-[var(--color-muted-foreground)] text-[14px] mt-[4px]">
            MTG-2025-001 • Completed
          </p>
        </div>
        <button className="px-[16px] py-[10px] border border-[var(--color-border)] rounded-[6px] text-[14px] font-medium text-[var(--color-foreground)] hover:bg-[var(--color-background)] transition-colors">
          EDIT
        </button>
      </div>

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
                    24
                  </span>
                </div>
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
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((attendee) => (
                      <tr
                        key={attendee.id}
                        className="border-b border-[var(--color-border)] last:border-0"
                      >
                        <td className="px-[16px] py-[14px] text-[14px] text-[var(--color-foreground)] font-medium">
                          {attendee.name}
                        </td>
                        <td className="px-[16px] py-[14px] text-[14px] text-[var(--color-muted-foreground)]">
                          {attendee.role}
                        </td>
                        <td className="px-[16px] py-[14px] text-[14px] text-[var(--color-muted-foreground)]">
                          {attendee.department}
                        </td>
                        <td className="px-[16px] py-[14px]">
                          <span
                            className={`inline-flex px-[8px] py-[4px] rounded-[4px] text-[12px] font-medium font-mono ${attendee.attendanceColor}`}
                          >
                            {attendee.attendance}
                          </span>
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
                    Anatomy Lab Review
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    MEETING NR
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)] font-mono">
                    MTG-2025-001
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    STATUS
                  </p>
                  <span className="inline-flex px-[8px] py-[4px] rounded-[4px] text-[12px] font-medium font-mono text-green-600 bg-green-50">
                    COMPLETED
                  </span>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    DATE
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)]">
                    January 12, 2025
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    TIME
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)]">
                    09:00 AM — 10:30 AM
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    LOCATION
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)]">
                    Room 301A
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    COURSE NR
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)] font-mono">
                    CRS-1001
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    PRESENTER
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)]">
                    Dr. Sarah Mitchell
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    ABSTRACT
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)] leading-[1.6]">
                    Comprehensive review of upper extremity anatomy including
                    muscular, skeletal, and nervous system structures. Interactive
                    dissection demonstration with focus on clinical correlations and
                    surgical approaches.
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
                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    CME TYPE
                  </p>
                  <span className="inline-flex px-[8px] py-[4px] rounded-[4px] text-[12px] font-medium font-mono text-[#854D0E] bg-[#FEF3C7]">
                    Category 1
                  </span>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    CREDITS AVAILABLE
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)]">
                    1.5 AMA PRA Category 1 Credits
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    CME VALUE
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)] font-medium">
                    $300
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    ENGAGEMENT TYPE
                  </p>
                  <p className="text-[14px] text-[var(--color-foreground)]">
                    Lecture / Workshop
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[6px]">
                    EVALUATION STATUS
                  </p>
                  <div className="space-y-[4px]">
                    <p className="text-[14px] text-amber-600 font-medium">
                      PENDING — 18 of 24 evaluated
                    </p>
                    <div className="w-full h-[6px] bg-[var(--color-background)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: '75%' }}
                      />
                    </div>
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
