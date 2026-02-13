import { Calendar, Clock, Users, TrendingUp, DollarSign, Award } from 'lucide-react';

const subjectScores = [
  { subject: 'Cardiac Pathophysiology', score: 92, value: 150 },
  { subject: 'Clinical Interventions', score: 85, value: 125 },
  { subject: 'Patient Management', score: 88, value: 125 },
];

const attendees = [
  {
    id: 1,
    name: 'Dr. James Wilson',
    role: 'Cardiologist',
    credits: 24.0,
    engagement: 95,
    status: 'COMPLETED',
  },
  {
    id: 2,
    name: 'Dr. Sarah Chen',
    role: 'Internal Medicine',
    credits: 24.0,
    engagement: 88,
    status: 'COMPLETED',
  },
  {
    id: 3,
    name: 'Dr. Michael Brown',
    role: 'Resident',
    credits: 24.0,
    engagement: 92,
    status: 'COMPLETED',
  },
  {
    id: 4,
    name: 'Dr. Emily Davis',
    role: 'Cardiologist',
    credits: 24.0,
    engagement: 85,
    status: 'IN PROGRESS',
  },
  {
    id: 5,
    name: 'Dr. Robert Taylor',
    role: 'Fellow',
    credits: 18.0,
    engagement: 78,
    status: 'IN PROGRESS',
  },
];

export default function ActivityDetail() {
  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px]">
        <div>
          <h1 className="font-headline text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">
            Annual Cardiology Conference
          </h1>
          <p className="mt-[4px] text-[14px] text-[var(--color-muted-foreground)]">
            CME-2025-001 • Approved
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[var(--color-background)] px-[32px] py-[24px]">
        <div className="flex gap-[24px]">
          {/* Left Column */}
          <div className="flex-1 space-y-[24px]">
            {/* Subject Scores Breakdown */}
            <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
              <h2 className="mb-[16px] text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Subject Scores Breakdown
              </h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="pb-[12px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      SUBJECT
                    </th>
                    <th className="pb-[12px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      SCORE
                    </th>
                    <th className="pb-[12px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      VALUE
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subjectScores.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-[var(--color-border)] last:border-0"
                    >
                      <td className="py-[12px] text-[14px] font-medium text-[var(--color-foreground)]">
                        {item.subject}
                      </td>
                      <td className="py-[12px] font-mono text-[14px] text-[var(--color-foreground)]">
                        {item.score}%
                      </td>
                      <td className="py-[12px] font-mono text-[14px] text-[var(--color-foreground)]">
                        ${item.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Attendees Table */}
            <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
              <h2 className="mb-[16px] text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Attendees
              </h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="pb-[12px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      NAME
                    </th>
                    <th className="pb-[12px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      ROLE
                    </th>
                    <th className="pb-[12px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      CREDITS
                    </th>
                    <th className="pb-[12px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      ENGAGEMENT
                    </th>
                    <th className="pb-[12px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee) => (
                    <tr
                      key={attendee.id}
                      className="border-b border-[var(--color-border)] last:border-0"
                    >
                      <td className="py-[12px] text-[14px] font-medium text-[var(--color-foreground)]">
                        {attendee.name}
                      </td>
                      <td className="py-[12px] text-[14px] text-[var(--color-muted-foreground)]">
                        {attendee.role}
                      </td>
                      <td className="py-[12px] font-mono text-[14px] text-[var(--color-foreground)]">
                        {attendee.credits.toFixed(1)}
                      </td>
                      <td className="py-[12px] font-mono text-[14px] text-[var(--color-foreground)]">
                        {attendee.engagement}%
                      </td>
                      <td className="py-[12px]">
                        <span
                          className={`inline-flex rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold uppercase ${
                            attendee.status === 'COMPLETED'
                              ? 'bg-green-50 text-green-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {attendee.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-[320px] space-y-[24px]">
            {/* Activity Stats */}
            <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
              <h2 className="mb-[16px] text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Activity Stats
              </h2>
              <div className="space-y-[16px]">
                <div className="flex items-center gap-[12px]">
                  <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-[var(--color-secondary)]">
                    <Users className="h-[20px] w-[20px] text-[var(--color-brand-accent)]" />
                  </div>
                  <div>
                    <p className="text-[12px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      TOTAL ATTENDEES
                    </p>
                    <p className="font-mono text-[20px] font-bold text-[var(--color-foreground)]">
                      45
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-[12px]">
                  <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-[var(--color-secondary)]">
                    <Award className="h-[20px] w-[20px] text-[var(--color-brand-accent)]" />
                  </div>
                  <div>
                    <p className="text-[12px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      CREDITS AWARDED
                    </p>
                    <p className="font-mono text-[20px] font-bold text-[var(--color-foreground)]">
                      2.0
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-[12px]">
                  <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-[var(--color-secondary)]">
                    <DollarSign className="h-[20px] w-[20px] text-[var(--color-brand-accent)]" />
                  </div>
                  <div>
                    <p className="text-[12px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      CME VALUE
                    </p>
                    <p className="font-mono text-[20px] font-bold text-[var(--color-foreground)]">
                      $400
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-[12px]">
                  <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-[var(--color-secondary)]">
                    <TrendingUp className="h-[20px] w-[20px] text-[var(--color-brand-accent)]" />
                  </div>
                  <div>
                    <p className="text-[12px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      ENGAGEMENT RATE
                    </p>
                    <p className="font-mono text-[20px] font-bold text-[var(--color-foreground)]">
                      89%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-[12px]">
                  <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-[var(--color-secondary)]">
                    <TrendingUp className="h-[20px] w-[20px] text-[var(--color-brand-accent)]" />
                  </div>
                  <div>
                    <p className="text-[12px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      AVG SCORE
                    </p>
                    <p className="font-mono text-[20px] font-bold text-[var(--color-foreground)]">
                      87%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Info */}
            <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
              <h2 className="mb-[16px] text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Activity Info
              </h2>
              <div className="space-y-[16px]">
                <div>
                  <p className="mb-[4px] text-[12px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    CME TYPE
                  </p>
                  <span className="inline-flex rounded-[6px] bg-[var(--color-brand-accent)] px-[8px] py-[4px] text-[12px] font-semibold uppercase text-[var(--color-foreground)]">
                    Category 1
                  </span>
                </div>
                <div>
                  <p className="mb-[4px] text-[12px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    PROVIDER
                  </p>
                  <p className="text-[14px] font-medium text-[var(--color-foreground)]">AMA</p>
                </div>
                <div>
                  <p className="mb-[4px] text-[12px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    DATE
                  </p>
                  <div className="flex items-center gap-[8px]">
                    <Calendar className="h-[16px] w-[16px] text-[var(--color-muted-foreground)]" />
                    <p className="text-[14px] font-medium text-[var(--color-foreground)]">
                      March 15, 2025
                    </p>
                  </div>
                </div>
                <div>
                  <p className="mb-[4px] text-[12px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    DURATION
                  </p>
                  <div className="flex items-center gap-[8px]">
                    <Clock className="h-[16px] w-[16px] text-[var(--color-muted-foreground)]" />
                    <p className="text-[14px] font-medium text-[var(--color-foreground)]">
                      4 hours
                    </p>
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
