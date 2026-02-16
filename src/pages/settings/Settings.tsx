import { useState, useEffect, useCallback } from 'react';
import { Camera, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../../auth';
import { api } from '../../api';

interface PersonRecord {
  id: number;
  title: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  photo_url: string | null;
  is_complete: boolean;
}

interface FormData {
  title: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
}

const EMPTY_FORM: FormData = {
  title: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: '',
  department: '',
};

export default function Settings() {
  const { user } = useAuth();

  // DB record state
  const [personId, setPersonId] = useState<number | null>(null);
  const [originalData, setOriginalData] = useState<FormData>(EMPTY_FORM);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // System preferences (local-only)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);
  const [credentialAlerts, setCredentialAlerts] = useState(false);

  // Load person record from DB by auth email
  const loadPerson = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const person: PersonRecord | null = await api.people.findByEmail(user.email);
      if (person) {
        setPersonId(person.id);
        const data: FormData = {
          title: person.title || '',
          first_name: person.first_name || '',
          last_name: person.last_name || '',
          email: person.email || '',
          phone: person.phone || '',
          role: person.role || '',
          department: person.department || '',
        };
        setOriginalData(data);
        setForm(data);
      } else {
        // No DB record found -- pre-fill from auth context
        const parts = (user.name || '').split(' ');
        const data: FormData = {
          title: '',
          first_name: parts[0] || '',
          last_name: parts.slice(1).join(' ') || '',
          email: user.email,
          phone: '',
          role: user.role || '',
          department: '',
        };
        setOriginalData(data);
        setForm(data);
        setError('No profile record found in database for your email. You can create one by saving.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user?.email, user?.name, user?.role]);

  useEffect(() => {
    loadPerson();
  }, [loadPerson]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  // Form field updater
  const updateField = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Save handler
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      const payload = {
        title: form.title,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email || user?.email || '',
        phone: form.phone,
        role: form.role,
        department: form.department,
      };

      if (!personId) {
        // No existing record -- create a new person
        const created = await api.people.create(payload);
        setPersonId(created.id);
        setOriginalData({ ...form, email: payload.email });
        setForm(prev => ({ ...prev, email: payload.email }));
        setSuccessMsg('Profile created and saved!');
      } else {
        // Existing record -- update it
        await api.people.update(personId, payload);
        setOriginalData({ ...form });
        setSuccessMsg('Profile updated successfully.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Cancel handler
  const handleCancel = () => {
    setForm({ ...originalData });
    setError(null);
    setSuccessMsg(null);
  };

  // Display helpers
  const displayName = user
    ? user.name
    : form.first_name
      ? `${form.title ? form.title + ' ' : ''}${form.first_name} ${form.last_name}`.trim()
      : 'User';

  const displayInitials = user?.initials
    || `${form.first_name?.[0] || ''}${form.last_name?.[0] || ''}`.toUpperCase()
    || '?';

  const displayRole = form.role || user?.role || '';

  const hasChanges = JSON.stringify(form) !== JSON.stringify(originalData);

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => {
    return (
      <button
        onClick={onChange}
        className={`relative flex-shrink-0 h-[24px] w-[44px] rounded-full cursor-pointer transition-colors ${
          checked ? 'bg-[#FACC15]' : 'bg-[var(--color-border)]'
        }`}
      >
        <span
          className={`absolute left-0 top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
          }`}
        />
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
              {displayInitials}
            </div>
            <span className="font-mono text-[14px] font-medium text-[var(--color-foreground)]">
              {displayName}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[var(--color-background)]">
        {loading ? (
          <div className="flex items-center justify-center py-[64px]">
            <Loader2 className="h-[24px] w-[24px] animate-spin text-[var(--color-muted-foreground)]" />
            <span className="ml-[12px] font-mono text-[14px] text-[var(--color-muted-foreground)]">
              Loading profile...
            </span>
          </div>
        ) : (
          <div className="flex gap-[32px] px-[32px] py-[32px]">
            {/* Left Column */}
            <div className="flex-1">
              {/* Status Messages */}
              {error && (
                <div className="mb-[16px] rounded-[8px] border border-red-400/30 bg-red-500/10 px-[16px] py-[12px] font-mono text-[13px] text-red-400">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="mb-[16px] rounded-[8px] border border-green-400/30 bg-green-500/10 px-[16px] py-[12px] font-mono text-[13px] text-green-400">
                  {successMsg}
                </div>
              )}

              {/* Profile Information Card */}
              <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
                <h2 className="mb-[24px] text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Profile Information
                </h2>

                {/* Avatar Section */}
                <div className="mb-[24px] flex items-center gap-[16px]">
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#FACC15] font-headline text-[24px] font-bold text-[var(--color-foreground)]">
                    {displayInitials}
                  </div>
                  <div className="flex-1">
                    <p className="font-headline text-[16px] font-semibold text-[var(--color-foreground)]">
                      {form.title ? `${form.title} ` : ''}{form.first_name} {form.last_name}
                    </p>
                    <p className="font-mono text-[14px] text-[var(--color-muted-foreground)]">
                      {displayRole}
                    </p>
                  </div>
                  <button
                    onClick={() => alert('Photo upload coming soon')}
                    className="flex items-center gap-[8px] rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[10px] font-mono text-[14px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-secondary)]"
                  >
                    <Camera className="h-[16px] w-[16px]" />
                    Change Photo
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-[16px]">
                  {/* Title / First Name / Last Name Row */}
                  <div className="grid grid-cols-2 gap-[16px]">
                    <div>
                      <label className="mb-[8px] block font-mono text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={form.first_name}
                        onChange={e => updateField('first_name', e.target.value)}
                        className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[10px] font-mono text-[14px] text-[var(--color-foreground)] transition-colors focus:border-[var(--color-brand-accent)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-[8px] block font-mono text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={form.last_name}
                        onChange={e => updateField('last_name', e.target.value)}
                        className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[10px] font-mono text-[14px] text-[var(--color-foreground)] transition-colors focus:border-[var(--color-brand-accent)] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-[8px] block font-mono text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => updateField('email', e.target.value)}
                      className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[10px] font-mono text-[14px] text-[var(--color-foreground)] transition-colors focus:border-[var(--color-brand-accent)] focus:outline-none"
                    />
                  </div>

                  {/* Role / Department Row */}
                  <div className="grid grid-cols-2 gap-[16px]">
                    <div>
                      <label className="mb-[8px] block font-mono text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                        Role
                      </label>
                      <select
                        value={form.role}
                        onChange={e => updateField('role', e.target.value)}
                        className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[10px] font-mono text-[14px] text-[var(--color-foreground)] transition-colors focus:border-[var(--color-brand-accent)] focus:outline-none"
                      >
                        <option value="">Select role...</option>
                        <option value="Admin">Admin</option>
                        <option value="Medical Director">Medical Director</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Faculty">Faculty</option>
                        <option value="Resident">Resident</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-[8px] block font-mono text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                        Department
                      </label>
                      <select
                        value={form.department}
                        onChange={e => updateField('department', e.target.value)}
                        className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[10px] font-mono text-[14px] text-[var(--color-foreground)] transition-colors focus:border-[var(--color-brand-accent)] focus:outline-none"
                      >
                        <option value="">Select department...</option>
                        <option value="Internal Medicine">Internal Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Surgery">Surgery</option>
                        <option value="Emergency Medicine">Emergency Medicine</option>
                        <option value="Administration">Administration</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="mb-[8px] block font-mono text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => updateField('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[10px] font-mono text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] transition-colors focus:border-[var(--color-brand-accent)] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-[24px] flex items-center justify-end gap-[12px]">
                  {saving && (
                    <Loader2 className="h-[16px] w-[16px] animate-spin text-[var(--color-muted-foreground)]" />
                  )}
                  <button
                    onClick={handleCancel}
                    disabled={!hasChanges || saving}
                    className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[10px] font-mono text-[14px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-secondary)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className="rounded-[8px] bg-[var(--color-primary)] px-[16px] py-[10px] font-mono text-[14px] font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
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

                <div className="flex flex-col items-center gap-[16px] py-[16px]">
                  <Shield className="h-[40px] w-[40px] text-[var(--color-muted-foreground)]" />
                  <div className="text-center">
                    <p className="font-headline text-[14px] font-semibold text-[var(--color-foreground)]">
                      Authentication is managed by Keycloak.
                    </p>
                    <p className="mt-[8px] font-mono text-[13px] text-[var(--color-muted-foreground)]">
                      Password changes and SSO settings will be available in a future update.
                    </p>
                  </div>
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
                      <p className="font-mono text-[14px] font-medium text-[var(--color-foreground)]">
                        Email Notifications
                      </p>
                      <p className="font-mono text-[12px] text-[var(--color-muted-foreground)]">
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
                      <p className="font-mono text-[14px] font-medium text-[var(--color-foreground)]">
                        Meeting Reminders
                      </p>
                      <p className="font-mono text-[12px] text-[var(--color-muted-foreground)]">
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
                      <p className="font-mono text-[14px] font-medium text-[var(--color-foreground)]">
                        Credential Expiry Alerts
                      </p>
                      <p className="font-mono text-[12px] text-[var(--color-muted-foreground)]">
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
        )}
      </div>
    </div>
  );
}
