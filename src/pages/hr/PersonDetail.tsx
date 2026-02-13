import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function PersonDetail() {
  const { id: _id } = useParams();
  const [activeTab, setActiveTab] = useState('information');

  const tabs = [
    { id: 'information', label: 'Information' },
    { id: 'meetings', label: 'Meetings' },
    { id: 'cme-history', label: 'CME History' },
    { id: 'credentials', label: 'Credentials' },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-[var(--color-background)]">
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
              <span className="font-headline text-[28px] font-bold text-black">JW</span>
            </div>

            {/* Name and Info */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[12px]">
                <h1 className="font-headline text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">
                  Dr. James Wilson
                </h1>
                <span className="inline-flex items-center rounded-[4px] bg-green-500 px-[8px] py-[4px] font-mono text-[11px] font-medium uppercase tracking-wide text-white">
                  ACTIVE
                </span>
              </div>
              <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
                Faculty — Cardiology
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <button className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[8px] font-mono text-[14px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-input)]">
            EDIT
          </button>
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
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
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">Dr.</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    FIRST NAME
                  </label>
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">James</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    LAST NAME
                  </label>
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">Wilson</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    GENDER
                  </label>
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">Male</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    DATE OF BIRTH
                  </label>
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">1978-06-14</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    OFFICE LOCATION
                  </label>
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">Chicago, IL</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    DATE OF HIRE
                  </label>
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">2019-01-01</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    OFFICE PHONE
                  </label>
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">(555) 123-4567</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    EMAIL
                  </label>
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">
                    j.wilson@university.edu
                  </p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    MOBILE
                  </label>
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">(555) 987-6543</p>
                </div>
                <div className="col-span-2 flex flex-col gap-[4px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    ORGANIZATION
                  </label>
                  <p className="font-mono text-[13px] text-[var(--color-brand-accent)] underline">
                    University Medical Center
                  </p>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
              <h2 className="mb-[20px] font-headline text-[18px] font-bold text-[var(--color-foreground)]">
                Address
              </h2>
              <p className="font-mono text-[13px] leading-relaxed text-[var(--color-foreground)]">
                1234 Medical Center Dr
                <br />
                Suite 300
                <br />
                Chicago, IL 60601
                <br />
                United States
              </p>
            </div>

            {/* Contact Numbers Card */}
            <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
              <h2 className="mb-[20px] font-headline text-[18px] font-bold text-[var(--color-foreground)]">
                Contact Numbers
              </h2>
              <div className="grid grid-cols-2 gap-x-[32px] gap-y-[16px]">
                <div className="flex flex-col gap-[4px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    TELEPHONE
                  </label>
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">(555) 123-4567</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    MOBILE
                  </label>
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">(555) 987-6543</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    OFFICE
                  </label>
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">(555) 123-4567</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    FAX
                  </label>
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">(555) 123-4568</p>
                </div>
              </div>
            </div>
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
                  <span className="font-mono text-[16px] font-bold text-[var(--color-foreground)]">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    CME Credits Earned
                  </span>
                  <span className="font-mono text-[16px] font-bold text-[var(--color-foreground)]">23.5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Courses Taught
                  </span>
                  <span className="font-mono text-[16px] font-bold text-[var(--color-foreground)]">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Current Teaching
                  </span>
                  <span className="font-mono text-[16px] font-bold text-[var(--color-foreground)]">3</span>
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
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">Cardiology</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    POSITION
                  </label>
                  <p className="font-mono text-[13px] text-[var(--color-foreground)]">Associate Professor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
