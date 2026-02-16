import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, TrendingUp, DollarSign, Award, X } from 'lucide-react';
import { api } from '../../api';

interface Participant {
  person_id: number;
  name: string;
  email: string;
  department: string;
  credits_earned: number;
  date_earned: string;
  verified: boolean;
}

interface Activity {
  id: number;
  name: string;
  provider: string;
  activity_type: string;
  credits: number;
  value: number;
  activity_date: string;
  description: string;
  status: string;
  participants: Participant[];
}

/* ── Confirm Dialog ───────────────────────────────────────── */

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: 'red' | 'green';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const btnClass =
    confirmColor === 'red'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-green-600 hover:bg-green-700 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[420px] rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px] shadow-xl">
        <h3 className="font-headline text-[18px] font-bold text-[var(--color-foreground)]">{title}</h3>
        <p className="mt-[8px] text-[14px] text-[var(--color-muted-foreground)]">{message}</p>
        <div className="mt-[20px] flex justify-end gap-[12px]">
          <button
            onClick={onCancel}
            className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-secondary)] px-[16px] py-[8px] font-mono text-[13px] font-semibold text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-border)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-[8px] px-[16px] py-[8px] font-mono text-[13px] font-semibold transition-colors ${btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Edit Modal ───────────────────────────────────────────── */

function EditModal({
  activity,
  onSave,
  onCancel,
}: {
  activity: Activity;
  onSave: (data: Partial<Activity>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: activity.name || '',
    provider: activity.provider || '',
    activity_type: activity.activity_type || '',
    credits: Number(activity.credits) || 0,
    value: Number(activity.value) || 0,
    activity_date: activity.activity_date || '',
    description: activity.description || '',
    status: activity.status || 'PENDING',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, val: string | number) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputClass =
    'w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] outline-none focus:ring-2 focus:ring-[#FACC15]/40';

  const labelClass = 'block mb-[4px] text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[560px] rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-[24px] py-[16px]">
          <h3 className="font-headline text-[18px] font-bold text-[var(--color-foreground)]">Edit Activity</h3>
          <button
            onClick={onCancel}
            className="rounded-[6px] p-[4px] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)]"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[60vh] overflow-y-auto px-[24px] py-[20px]">
          <div className="grid grid-cols-2 gap-[16px]">
            {/* Name - full width */}
            <div className="col-span-2">
              <label className={labelClass}>Name</label>
              <input className={inputClass} value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
            </div>

            {/* Provider */}
            <div>
              <label className={labelClass}>Provider</label>
              <input className={inputClass} value={form.provider} onChange={(e) => handleChange('provider', e.target.value)} />
            </div>

            {/* Activity Type */}
            <div>
              <label className={labelClass}>Activity Type</label>
              <input className={inputClass} value={form.activity_type} onChange={(e) => handleChange('activity_type', e.target.value)} />
            </div>

            {/* Credits */}
            <div>
              <label className={labelClass}>Credits</label>
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={form.credits}
                onChange={(e) => handleChange('credits', parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Value */}
            <div>
              <label className={labelClass}>Value ($)</label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={form.value}
                onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Activity Date */}
            <div>
              <label className={labelClass}>Activity Date</label>
              <input
                type="date"
                className={inputClass}
                value={form.activity_date}
                onChange={(e) => handleChange('activity_date', e.target.value)}
              />
            </div>

            {/* Status */}
            <div>
              <label className={labelClass}>Status</label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            {/* Description - full width */}
            <div className="col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                rows={3}
                className={inputClass + ' resize-none'}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-[12px] border-t border-[var(--color-border)] px-[24px] py-[16px]">
          <button
            onClick={onCancel}
            className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-secondary)] px-[16px] py-[8px] font-mono text-[13px] font-semibold text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-border)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-[8px] bg-[#FACC15] px-[16px] py-[8px] font-mono text-[13px] font-semibold text-[#09090B] transition-colors hover:bg-[#FACC15]/80 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────── */

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialogs
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchActivity = useCallback(() => {
    if (!id) return;
    setLoading(true);
    api.cme
      .get(Number(id))
      .then((data: Activity) => {
        setActivity(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  /* ── Actions ─────────────────────────────────────────────── */

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await api.cme.update(Number(id), { status: 'APPROVED' });
      fetchActivity();
    } catch (err) {
      console.error('Failed to approve activity', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setActionLoading(true);
    setShowRejectConfirm(false);
    try {
      await api.cme.update(Number(id), { status: 'REJECTED' });
      fetchActivity();
    } catch (err) {
      console.error('Failed to reject activity', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setActionLoading(true);
    setShowDeleteConfirm(false);
    try {
      await api.cme.delete(Number(id));
      navigate('/cme');
    } catch (err) {
      console.error('Failed to delete activity', err);
      setActionLoading(false);
    }
  };

  const handleEditSave = async (data: Partial<Activity>) => {
    if (!id) return;
    try {
      await api.cme.update(Number(id), data);
      setShowEditModal(false);
      fetchActivity();
    } catch (err) {
      console.error('Failed to update activity', err);
    }
  };

  /* ── Render: Loading / Not Found ─────────────────────────── */

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px]">
          <div>
            <h1 className="font-headline text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px]">
          <div>
            <h1 className="font-headline text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">
              Activity not found
            </h1>
          </div>
        </div>
      </div>
    );
  }

  const totalAttendees = (activity.participants || []).length;
  const totalValue = Number(activity.value) || 0;
  const creditsAwarded = Number(activity.credits) || 0;
  const isPending = (activity.status || 'PENDING').toUpperCase() === 'PENDING';

  return (
    <div className="flex flex-col h-full">
      {/* Dialogs */}
      {showRejectConfirm && (
        <ConfirmDialog
          title="Reject Activity"
          message={`Are you sure you want to reject "${activity.name}"? This will mark the activity as REJECTED.`}
          confirmLabel="Reject"
          confirmColor="red"
          onConfirm={handleReject}
          onCancel={() => setShowRejectConfirm(false)}
        />
      )}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Activity"
          message={`Are you sure you want to permanently delete "${activity.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmColor="red"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
      {showEditModal && (
        <EditModal
          activity={activity}
          onSave={handleEditSave}
          onCancel={() => setShowEditModal(false)}
        />
      )}

      {/* Top Bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px] flex items-center justify-between">
        <div className="flex items-center gap-[16px]">
          <button
            onClick={() => navigate('/cme')}
            className="inline-flex items-center gap-[6px] font-mono text-[13px] text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
          >
            <ArrowLeft className="h-[16px] w-[16px]" />
            Back to Activities
          </button>
        </div>
        <div className="flex items-center gap-[12px]">
          {isPending && (
            <>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="rounded-[6px] border border-green-300 bg-green-50 px-[16px] py-[8px] font-mono text-[13px] font-medium text-green-600 transition-colors hover:bg-green-100 disabled:opacity-50"
              >
                APPROVE
              </button>
              <button
                onClick={() => setShowRejectConfirm(true)}
                disabled={actionLoading}
                className="rounded-[6px] border border-red-300 bg-red-50 px-[16px] py-[8px] font-mono text-[13px] font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
              >
                REJECT
              </button>
            </>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={actionLoading}
            className="rounded-[6px] border border-red-300 bg-red-50 px-[16px] py-[8px] font-mono text-[13px] font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            DELETE
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            disabled={actionLoading}
            className="px-[16px] py-[8px] border border-[var(--color-border)] rounded-[6px] font-mono text-[13px] font-bold tracking-[0.05em] text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-background)] disabled:opacity-50"
          >
            EDIT
          </button>
        </div>
      </div>

      {/* Title sub-bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[16px]">
        <h1 className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
          {activity.name}
        </h1>
        <p className="text-[var(--color-muted-foreground)] text-[14px] mt-[4px]">
          CME-{String(activity.id).padStart(4, '0')} &bull;{' '}
          <span className={`inline-flex px-[8px] py-[2px] rounded-[4px] text-[12px] font-medium font-mono ${
            (activity.status || 'PENDING').toUpperCase() === 'APPROVED' || (activity.status || 'PENDING').toUpperCase() === 'COMPLETED'
              ? 'text-green-600 bg-green-50'
              : (activity.status || 'PENDING').toUpperCase() === 'REJECTED'
                ? 'text-red-600 bg-red-50'
                : 'text-amber-600 bg-amber-50'
          }`}>
            {(activity.status || 'PENDING').toUpperCase()}
          </span>
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[var(--color-background)] px-[32px] py-[24px]">
        <div className="flex gap-[24px]">
          {/* Left Column */}
          <div className="flex-1 space-y-[24px]">
            {/* Description */}
            {activity.description && (
              <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
                <h2 className="mb-[16px] text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Description
                </h2>
                <p className="text-[14px] text-[var(--color-foreground)]">{activity.description}</p>
              </div>
            )}

            {/* Attendees Table */}
            <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[24px]">
              <h2 className="mb-[16px] text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Participants
              </h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="pb-[12px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      NAME
                    </th>
                    <th className="pb-[12px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      DEPARTMENT
                    </th>
                    <th className="pb-[12px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      CREDITS
                    </th>
                    <th className="pb-[12px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      DATE EARNED
                    </th>
                    <th className="pb-[12px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(activity.participants || []).map((participant) => (
                    <tr
                      key={participant.person_id}
                      className="border-b border-[var(--color-border)] last:border-0"
                    >
                      <td className="py-[12px] text-[14px] font-medium text-[var(--color-foreground)]">
                        <button
                          onClick={() => navigate(`/hr/${participant.person_id}`)}
                          className="cursor-pointer text-[var(--color-brand-accent)] underline-offset-2 hover:underline"
                        >
                          {participant.name}
                        </button>
                      </td>
                      <td className="py-[12px] text-[14px] text-[var(--color-muted-foreground)]">
                        {participant.department}
                      </td>
                      <td className="py-[12px] font-mono text-[14px] text-[var(--color-foreground)]">
                        {(Number(participant.credits_earned) || 0).toFixed(1)}
                      </td>
                      <td className="py-[12px] text-[14px] text-[var(--color-muted-foreground)]">
                        {participant.date_earned}
                      </td>
                      <td className="py-[12px]">
                        <span
                          className={`inline-flex px-[8px] py-[4px] rounded-[4px] text-[12px] font-medium font-mono ${
                            participant.verified
                              ? 'text-green-600 bg-green-50'
                              : 'text-amber-600 bg-amber-50'
                          }`}
                        >
                          {participant.verified ? 'VERIFIED' : 'PENDING'}
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
                      TOTAL PARTICIPANTS
                    </p>
                    <p className="font-mono text-[20px] font-bold text-[var(--color-foreground)]">
                      {totalAttendees}
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
                      {creditsAwarded.toFixed(1)}
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
                      ${totalValue.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-[12px]">
                  <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-[var(--color-secondary)]">
                    <TrendingUp className="h-[20px] w-[20px] text-[var(--color-brand-accent)]" />
                  </div>
                  <div>
                    <p className="text-[12px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      VERIFIED RATE
                    </p>
                    <p className="font-mono text-[20px] font-bold text-[var(--color-foreground)]">
                      {totalAttendees > 0
                        ? Math.round(
                            ((activity.participants || []).filter((p) => p.verified).length /
                              totalAttendees) *
                              100
                          )
                        : 0}
                      %
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
                    {activity.activity_type || 'N/A'}
                  </span>
                </div>
                <div>
                  <p className="mb-[4px] text-[12px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    PROVIDER
                  </p>
                  <p className="text-[14px] font-medium text-[var(--color-foreground)]">{activity.provider || 'N/A'}</p>
                </div>
                <div>
                  <p className="mb-[4px] text-[12px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    DATE
                  </p>
                  <div className="flex items-center gap-[8px]">
                    <Calendar className="h-[16px] w-[16px] text-[var(--color-muted-foreground)]" />
                    <p className="text-[14px] font-medium text-[var(--color-foreground)]">
                      {activity.activity_date || 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="mb-[4px] text-[12px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    STATUS
                  </p>
                  <span
                    className={`inline-flex px-[8px] py-[4px] rounded-[4px] text-[12px] font-medium font-mono ${
                      (activity.status || 'PENDING').toUpperCase() === 'APPROVED' || (activity.status || 'PENDING').toUpperCase() === 'COMPLETED'
                        ? 'text-green-600 bg-green-50'
                        : (activity.status || 'PENDING').toUpperCase() === 'REJECTED'
                          ? 'text-red-600 bg-red-50'
                          : 'text-amber-600 bg-amber-50'
                    }`}
                  >
                    {(activity.status || 'PENDING').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
