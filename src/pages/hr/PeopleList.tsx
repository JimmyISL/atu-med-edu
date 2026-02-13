import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

export default function PeopleList() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'all', label: 'All', count: 611 },
    { id: 'faculty', label: 'Faculty', count: 0 },
    { id: 'staff', label: 'Staff', count: 0 },
    { id: 'residents', label: 'Residents', count: 0 },
    { id: 'other', label: 'Other', count: 0 },
  ];

  const people = [
    {
      id: 1,
      name: 'Dr. James Wilson',
      role: 'Faculty',
      department: 'Cardiology',
      email: 'j.wilson@univ.edu',
      status: 'ACTIVE',
      statusColor: 'bg-green-500',
    },
    {
      id: 2,
      name: 'Dr. Lisa Kim',
      role: 'Faculty',
      department: 'Neurology',
      email: 'l.kim@univ.edu',
      status: 'ACTIVE',
      statusColor: 'bg-green-500',
    },
    {
      id: 3,
      name: 'Dr. Ray Patel',
      role: 'Resident',
      department: 'Surgery',
      email: 'r.patel@univ.edu',
      status: 'OFFSITE',
      statusColor: 'bg-amber-500',
    },
    {
      id: 4,
      name: 'Maria Santos',
      role: 'Staff',
      department: 'Administration',
      email: 'm.santos@univ.edu',
      status: 'LEAVE',
      statusColor: 'bg-red-500',
    },
    {
      id: 5,
      name: 'Dr. Chen Wei',
      role: 'Faculty',
      department: 'Pharmacology',
      email: 'c.wei@univ.edu',
      status: 'ACTIVE',
      statusColor: 'bg-green-500',
    },
    {
      id: 6,
      name: 'Anna Kowalski',
      role: 'Resident',
      department: 'Radiology',
      email: 'a.kowalski@univ.edu',
      status: 'INACTIVE',
      statusColor: 'bg-purple-500',
    },
  ];

  const handleRowClick = (id: number) => {
    navigate(`/hr/${id}`);
  };

  return (
    <div className="flex h-full w-full flex-col bg-[var(--color-background)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-[32px] py-[24px]">
        <div className="flex flex-col gap-[8px]">
          <h1 className="font-headline text-[28px] font-bold tracking-tight text-[var(--color-foreground)]">
            HR / PEOPLE
          </h1>
          <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
            Manage personnel directory.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-[6px] bg-[var(--color-primary)] px-[16px] py-[8px] font-mono text-[14px] font-medium text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90"
        >
          + ADD PERSON
        </button>
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
            {tab.label} {tab.id === 'all' && `(${tab.count})`}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-foreground)]" />
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center justify-end px-[32px] py-[16px]">
        <div className="relative w-[320px]">
          <Search className="absolute left-[12px] top-[50%] h-[16px] w-[16px] translate-y-[-50%] text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            placeholder="Search personnel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] py-[8px] pl-[36px] pr-[12px] font-mono text-[13px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-[32px]">
        <table className="w-full">
          <thead className="sticky top-0 bg-[var(--color-background)]">
            <tr className="border-b border-[var(--color-border)]">
              <th className="pb-[12px] pr-[16px] text-left font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                NAME
              </th>
              <th className="pb-[12px] pr-[16px] text-left font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                ROLE
              </th>
              <th className="pb-[12px] pr-[16px] text-left font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                DEPARTMENT
              </th>
              <th className="pb-[12px] pr-[16px] text-left font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                EMAIL
              </th>
              <th className="pb-[12px] text-left font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr
                key={person.id}
                onClick={() => handleRowClick(person.id)}
                className="cursor-pointer border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-card)]"
              >
                <td className="py-[16px] pr-[16px] font-mono text-[13px] text-[var(--color-foreground)]">
                  {person.name}
                </td>
                <td className="py-[16px] pr-[16px] font-mono text-[13px] text-[var(--color-muted-foreground)]">
                  {person.role}
                </td>
                <td className="py-[16px] pr-[16px] font-mono text-[13px] text-[var(--color-muted-foreground)]">
                  {person.department}
                </td>
                <td className="py-[16px] pr-[16px] font-mono text-[13px] text-[var(--color-muted-foreground)]">
                  {person.email}
                </td>
                <td className="py-[16px]">
                  <span
                    className={`inline-flex items-center rounded-[4px] px-[8px] py-[4px] font-mono text-[11px] font-medium uppercase tracking-wide text-white ${person.statusColor}`}
                  >
                    {person.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-[var(--color-border)] px-[32px] py-[16px]">
        <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
          Showing 6 of 1,247 records
        </p>
        <div className="flex items-center gap-[8px]">
          <button className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] px-[12px] py-[6px] font-mono text-[13px] text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-input)]">
            Previous
          </button>
          <button className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] px-[12px] py-[6px] font-mono text-[13px] text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-input)]">
            Next
          </button>
        </div>
      </div>

      {/* Add Person Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-[640px] rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-[24px] py-[16px]">
              <h2 className="font-headline text-[20px] font-bold tracking-tight text-[var(--color-foreground)]">
                ADD NEW PERSON
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-[4px] p-[4px] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-card)] hover:text-[var(--color-foreground)]"
              >
                <X className="h-[20px] w-[20px]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-[24px] py-[24px]">
              <div className="flex flex-col gap-[16px]">
                {/* Title, First Name, Last Name Row */}
                <div className="grid grid-cols-[120px_1fr_1fr] gap-[12px]">
                  <div className="flex flex-col gap-[6px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      TITLE
                    </label>
                    <select className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]">
                      <option>Dr.</option>
                      <option>Mr.</option>
                      <option>Mrs.</option>
                      <option>Ms.</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      FIRST NAME
                    </label>
                    <input
                      type="text"
                      className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                    />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      LAST NAME
                    </label>
                    <input
                      type="text"
                      className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    ROLE
                  </label>
                  <select className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]">
                    <option>Faculty</option>
                    <option>Staff</option>
                    <option>Resident</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Department */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    DEPARTMENT
                  </label>
                  <select className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]">
                    <option>Cardiology</option>
                    <option>Neurology</option>
                    <option>Surgery</option>
                    <option>Administration</option>
                    <option>Pharmacology</option>
                    <option>Radiology</option>
                  </select>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    PHONE
                  </label>
                  <input
                    type="tel"
                    className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                  />
                </div>

                {/* Date of Birth */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    DATE OF BIRTH
                  </label>
                  <input
                    type="date"
                    className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                  />
                </div>

                {/* Date of Hire */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    DATE OF HIRE
                  </label>
                  <input
                    type="date"
                    className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                  />
                </div>

                {/* Office Location */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    OFFICE LOCATION
                  </label>
                  <input
                    type="text"
                    className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                  />
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    NOTES
                  </label>
                  <textarea
                    rows={4}
                    className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-input)] px-[12px] py-[8px] font-mono text-[13px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-[12px] border-t border-[var(--color-border)] px-[24px] py-[16px]">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[8px] font-mono text-[14px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-input)]"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-[6px] bg-[var(--color-primary)] px-[16px] py-[8px] font-mono text-[14px] font-medium text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90"
              >
                Add Person
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
