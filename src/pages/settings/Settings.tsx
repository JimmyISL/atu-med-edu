import { useState } from 'react';
import { Camera } from 'lucide-react';

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);
  const [credentialAlerts, setCredentialAlerts] = useState(false);

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => {
    return (
      <button
        onClick={onChange}
        className={`relative h-[24px] w-[44px] rounded-full transition-colors ${
          checked ? 'bg-[#FACC15]' : 'bg-[var(--color-border)]'
        }`}
      >
        <span
          className={`absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
          }`}
        ></span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px]">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">
            SETTINGS
          </h1>
          <div className="flex items-center gap-[12px]">
            <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#FACC15] font-headline text-[14px] font-bold text-[var(--color-foreground)]">
              SM
            </div>
            <span className="text-[14px] font-medium text-[var(--color-foreground)]">
              Dr. Sarah Mitchell
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[var(--color-background)]">
        <div className="flex gap-[32px] px-[32px] py-[32px]">
          {/* Left Column */}
          <div className="flex-1">
            {/* Profile Information Card */}
            <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
              <h2 className="mb-[24px] text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Profile Information
              </h2>

              {/* Avatar Section */}
              <div className="mb-[24px] flex items-center gap-[16px]">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#FACC15] font-headline text-[24px] font-bold text-[var(--color-foreground)]">
                  SM
                </div>
                <div className="flex-1">
                  <p className="text-[16px] font-semibold text-[var(--color-foreground)]">
                    Dr. Sarah Mitchell
                  </p>
                  <p className="text-[14px] text-[var(--color-muted-foreground)]">
                    Medical Director
                  </p>
                </div>
                <button className="flex items-center gap-[8px] rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[10px] text-[14px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-secondary)]">
                  <Camera className="h-[16px] w-[16px]" />
                  Change Photo
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-[16px]">
                {/* First Name / Last Name Row */}
                <div className="grid grid-cols-2 gap-[16px]">
                  <div>
                    <label className="mb-[8px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Sarah"
                      className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] transition-colors focus:border-[var(--color-brand-accent)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-[8px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Mitchell"
                      className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] transition-colors focus:border-[var(--color-brand-accent)] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-[8px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="sarah.mitchell@atumed.edu"
                    className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] transition-colors focus:border-[var(--color-brand-accent)] focus:outline-none"
                  />
                </div>

                {/* Role / Department Row */}
                <div className="grid grid-cols-2 gap-[16px]">
                  <div>
                    <label className="mb-[8px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      Role
                    </label>
                    <select className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] transition-colors focus:border-[var(--color-brand-accent)] focus:outline-none">
                      <option>Medical Director</option>
                      <option>Administrator</option>
                      <option>Faculty</option>
                      <option>Resident</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-[8px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      Department
                    </label>
                    <select className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] transition-colors focus:border-[var(--color-brand-accent)] focus:outline-none">
                      <option>Internal Medicine</option>
                      <option>Cardiology</option>
                      <option>Surgery</option>
                      <option>Emergency Medicine</option>
                    </select>
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="mb-[8px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] transition-colors focus:border-[var(--color-brand-accent)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-[24px] flex justify-end gap-[12px]">
                <button className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[10px] text-[14px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-secondary)]">
                  Cancel
                </button>
                <button className="rounded-[8px] bg-[var(--color-primary)] px-[16px] py-[10px] text-[14px] font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90">
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 space-y-[24px]">
            {/* Account Security Card */}
            <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
              <h2 className="mb-[24px] text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Account Security
              </h2>

              <div className="space-y-[16px]">
                {/* Current Password */}
                <div>
                  <label className="mb-[8px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] transition-colors focus:border-[var(--color-brand-accent)] focus:outline-none"
                  />
                </div>

                {/* New Password / Confirm Password Row */}
                <div className="grid grid-cols-2 gap-[16px]">
                  <div>
                    <label className="mb-[8px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] transition-colors focus:border-[var(--color-brand-accent)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-[8px] block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[10px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] transition-colors focus:border-[var(--color-brand-accent)] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Update Password Button */}
                <button className="w-full rounded-[8px] bg-[var(--color-primary)] px-[16px] py-[10px] text-[14px] font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90">
                  Update Password
                </button>
              </div>
            </div>

            {/* System Preferences Card */}
            <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
              <h2 className="mb-[24px] text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                System Preferences
              </h2>

              <div className="space-y-[20px]">
                {/* Email Notifications Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-[var(--color-foreground)]">
                      Email Notifications
                    </p>
                    <p className="text-[12px] text-[var(--color-muted-foreground)]">
                      Receive email updates about system activity
                    </p>
                  </div>
                  <Toggle
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications(!emailNotifications)}
                  />
                </div>

                {/* Meeting Reminders Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-[var(--color-foreground)]">
                      Meeting Reminders
                    </p>
                    <p className="text-[12px] text-[var(--color-muted-foreground)]">
                      Get notified before scheduled meetings
                    </p>
                  </div>
                  <Toggle
                    checked={meetingReminders}
                    onChange={() => setMeetingReminders(!meetingReminders)}
                  />
                </div>

                {/* Credential Expiry Alerts Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-[var(--color-foreground)]">
                      Credential Expiry Alerts
                    </p>
                    <p className="text-[12px] text-[var(--color-muted-foreground)]">
                      Alerts when credentials are about to expire
                    </p>
                  </div>
                  <Toggle
                    checked={credentialAlerts}
                    onChange={() => setCredentialAlerts(!credentialAlerts)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
