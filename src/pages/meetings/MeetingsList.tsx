import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';

export default function MeetingsList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const meetings = [
    {
      id: 1,
      name: 'Anatomy Lab Review',
      course: 'CRS-1001',
      date: '2025-01-12',
      time: '09:00-10:30',
      location: 'Room 301A',
      attendees: 24,
      status: 'COMPLETED',
      statusColor: 'text-green-600 bg-green-50',
    },
    {
      id: 2,
      name: 'Cardiology Seminar',
      course: 'CRS-1002',
      date: '2025-03-04',
      time: '14:00-16:00',
      location: 'Aud. B',
      attendees: 45,
      status: 'SCHEDULED',
      statusColor: 'text-blue-600 bg-blue-50',
    },
    {
      id: 3,
      name: 'Pharmacology Workshop',
      course: 'CRS-1003',
      date: '2025-02-26',
      time: '10:00-12:00',
      location: 'Lab 204',
      attendees: 18,
      status: 'IN PROGRESS',
      statusColor: 'text-amber-600 bg-amber-50',
    },
    {
      id: 4,
      name: 'Ethics Board Meeting',
      course: 'CRS-1004',
      date: '2025-03-05',
      time: '13:00-14:30',
      location: 'Conf. Rm 1',
      attendees: 12,
      status: 'SCHEDULED',
      statusColor: 'text-blue-600 bg-blue-50',
    },
    {
      id: 5,
      name: 'Surgical Skills Demo',
      course: 'CRS-1005',
      date: '2025-02-20',
      time: '08:00-12:00',
      location: 'Sim Center',
      attendees: 30,
      status: 'COMPLETED',
      statusColor: 'text-green-600 bg-green-50',
    },
    {
      id: 6,
      name: 'Grand Rounds: Neurology',
      course: 'CRS-1002',
      date: '2025-03-10',
      time: '12:00-13:00',
      location: 'Main Hall',
      attendees: 80,
      status: 'SCHEDULED',
      statusColor: 'text-blue-600 bg-blue-50',
    },
    {
      id: 7,
      name: 'Resident Case Review',
      course: 'CRS-1006',
      date: '2025-03-08',
      time: '16:00-17:00',
      location: 'Room 105',
      attendees: 15,
      status: 'CANCELLED',
      statusColor: 'text-red-600 bg-red-50',
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px] flex items-center justify-between">
        <div>
          <h1 className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
            MEETINGS
          </h1>
          <p className="text-[var(--color-muted-foreground)] text-[14px] mt-[4px]">
            Schedule and manage department meetings.
          </p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-[8px] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-[16px] py-[10px] rounded-[6px] font-medium text-[14px] hover:opacity-90 transition-opacity"
        >
          <Plus className="w-[16px] h-[16px]" />
          SCHEDULE MEETING
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px]">
        <div className="flex gap-[32px]">
          {['all', 'upcoming', 'past', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-mono text-[13px] uppercase py-[12px] transition-colors ${
                activeTab === tab
                  ? 'text-[var(--color-foreground)] border-b-2 border-[#FACC15]'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-[32px] py-[20px] bg-[var(--color-background)]">
        <div className="relative max-w-[400px]">
          <Search className="absolute left-[12px] top-[50%] translate-y-[-50%] w-[16px] h-[16px] text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-[40px] pr-[16px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-[32px] pb-[32px]">
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium flex-1">
                  MEETING NAME
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[150px]">
                  COURSE
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[95px]">
                  DATE
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[110px]">
                  TIME
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[110px]">
                  LOCATION
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[75px]">
                  ATTENDEES
                </th>
                <th className="text-left px-[16px] py-[12px] font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] font-medium w-[90px]">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr
                  key={meeting.id}
                  onClick={() => navigate(`/meetings/${meeting.id}`)}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-background)] cursor-pointer transition-colors"
                >
                  <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-foreground)] font-medium">
                    {meeting.name}
                  </td>
                  <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-muted-foreground)] font-mono">
                    {meeting.course}
                  </td>
                  <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-muted-foreground)] font-mono">
                    {meeting.date}
                  </td>
                  <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-muted-foreground)] font-mono">
                    {meeting.time}
                  </td>
                  <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                    {meeting.location}
                  </td>
                  <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-foreground)] font-medium">
                    {meeting.attendees}
                  </td>
                  <td className="px-[16px] py-[16px]">
                    <span
                      className={`inline-flex px-[8px] py-[4px] rounded-[4px] text-[12px] font-medium font-mono ${meeting.statusColor}`}
                    >
                      {meeting.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[16px] flex items-center justify-between">
        <p className="text-[14px] text-[var(--color-muted-foreground)]">
          Showing 1-7 of 7 meetings
        </p>
        <div className="flex gap-[8px]">
          <button className="px-[12px] py-[6px] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-muted-foreground)] hover:bg-[var(--color-background)] transition-colors disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-[12px] py-[6px] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-muted-foreground)] hover:bg-[var(--color-background)] transition-colors disabled:opacity-50" disabled>
            Next
          </button>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] w-full max-w-[600px] max-h-[830px] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-[24px] py-[20px] border-b border-[var(--color-border)]">
              <h2 className="font-headline text-[20px] font-bold text-[var(--color-foreground)]">
                SCHEDULE MEETING
              </h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
              >
                <X className="w-[20px] h-[20px]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-[24px] py-[24px]">
              <div className="space-y-[20px]">
                {/* Meeting Name */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    MEETING NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Enter meeting name"
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  />
                </div>

                {/* Course */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    COURSE
                  </label>
                  <select className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]">
                    <option>Select course</option>
                    <option>CRS-1001 - Anatomy</option>
                    <option>CRS-1002 - Cardiology</option>
                    <option>CRS-1003 - Pharmacology</option>
                    <option>CRS-1004 - Ethics</option>
                    <option>CRS-1005 - Surgery</option>
                    <option>CRS-1006 - Neurology</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    DATE
                  </label>
                  <input
                    type="date"
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  />
                </div>

                {/* Time Row */}
                <div className="grid grid-cols-2 gap-[16px]">
                  <div>
                    <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                      START TIME
                    </label>
                    <input
                      type="time"
                      className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                      END TIME
                    </label>
                    <input
                      type="time"
                      className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    LOCATION
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  />
                </div>

                {/* Subject/Topic */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    SUBJECT/TOPIC
                  </label>
                  <input
                    type="text"
                    placeholder="Enter subject or topic"
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  />
                </div>

                {/* Presenter */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    PRESENTER
                  </label>
                  <select className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]">
                    <option>Select presenter</option>
                    <option>Dr. Sarah Mitchell</option>
                    <option>Dr. James Thompson</option>
                    <option>Dr. Emily Rodriguez</option>
                    <option>Dr. Michael Chen</option>
                    <option>Dr. Amanda Foster</option>
                  </select>
                </div>

                {/* CME Credits */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    CME CREDITS
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="0.0"
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  />
                </div>

                {/* Expected Attendees */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    EXPECTED ATTENDEES
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter meeting description"
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15] resize-none"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[var(--color-muted-foreground)] mb-[8px] font-medium">
                    NOTES
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter additional notes"
                    className="w-full px-[12px] py-[10px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-[6px] text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[#FACC15] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-[12px] px-[24px] py-[20px] border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-[16px] py-[10px] border border-[var(--color-border)] rounded-[6px] text-[14px] font-medium text-[var(--color-foreground)] hover:bg-[var(--color-background)] transition-colors"
              >
                Cancel
              </button>
              <button className="px-[16px] py-[10px] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-[6px] text-[14px] font-medium hover:opacity-90 transition-opacity">
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
