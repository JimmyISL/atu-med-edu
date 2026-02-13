import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';

export default function CoursesList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'archived'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const courses = [
    {
      id: 1,
      name: 'Advanced Cardiac Life Support',
      courseNr: 'CRS-1001',
      instructor: 'Dr. Sarah Mitchell',
      cmeType: 'Category 1',
      status: 'ACTIVE',
      statusColor: 'green'
    },
    {
      id: 2,
      name: 'Internal Medicine Board Review',
      courseNr: 'CRS-1002',
      instructor: 'Dr. James Wilson',
      cmeType: 'Category 1',
      status: 'ACTIVE',
      statusColor: 'green'
    },
    {
      id: 3,
      name: 'Pharmacology Fundamentals',
      courseNr: 'CRS-1003',
      instructor: 'Dr. Chen Wei',
      cmeType: 'Category 2',
      status: 'DRAFT',
      statusColor: 'amber'
    },
    {
      id: 4,
      name: 'Ethics in Medical Practice',
      courseNr: 'CRS-1004',
      instructor: 'Dr. Lisa Kim',
      cmeType: 'Category 1',
      status: 'ACTIVE',
      statusColor: 'green'
    },
    {
      id: 5,
      name: 'Surgical Techniques Workshop',
      courseNr: 'CRS-1005',
      instructor: 'Dr. Ray Patel',
      cmeType: 'Category 1',
      status: 'ARCHIVED',
      statusColor: 'purple'
    },
    {
      id: 6,
      name: 'Emergency Medicine Update',
      courseNr: 'CRS-1006',
      instructor: 'Dr. Sarah Mitchell',
      cmeType: 'Category 2',
      status: 'ACTIVE',
      statusColor: 'green'
    }
  ];

  const getStatusColorClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500/20 text-green-600';
      case 'amber':
        return 'bg-amber-500/20 text-amber-600';
      case 'purple':
        return 'bg-purple-500/20 text-purple-600';
      default:
        return 'bg-green-500/20 text-green-600';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-background)]">
      {/* TopBar */}
      <div className="flex justify-between items-center px-[32px] py-[16px] border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-headline text-[20px] font-bold tracking-[2px] text-[var(--color-foreground)]">
            COURSES
          </h1>
          <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
            Manage course catalog and assignments.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="font-mono text-[13px] px-[16px] py-[8px] bg-[#FACC15] text-black rounded-[4px] flex items-center gap-[8px] hover:bg-[#FACC15]/90 font-bold tracking-[0.05em]"
        >
          <Plus className="w-[16px] h-[16px]" />
          ADD COURSE
        </button>
      </div>

      {/* Tabs and Search */}
      <div className="flex justify-between items-center px-[32px] py-[16px] border-b border-[var(--color-border)]">
        <div className="flex gap-[24px]">
          <button
            onClick={() => setActiveTab('all')}
            className={`font-mono text-[13px] pb-[4px] ${
              activeTab === 'all'
                ? 'border-b-2 border-[#FACC15] text-[var(--color-foreground)] font-bold'
                : 'text-[var(--color-muted-foreground)]'
            }`}
          >
            All Courses
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`font-mono text-[13px] pb-[4px] ${
              activeTab === 'active'
                ? 'border-b-2 border-[#FACC15] text-[var(--color-foreground)] font-bold'
                : 'text-[var(--color-muted-foreground)]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`font-mono text-[13px] pb-[4px] ${
              activeTab === 'archived'
                ? 'border-b-2 border-[#FACC15] text-[var(--color-foreground)] font-bold'
                : 'text-[var(--color-muted-foreground)]'
            }`}
          >
            Archived
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="font-mono text-[13px] pl-[36px] pr-[12px] py-[8px] w-[240px] bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-[32px] py-[24px]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase text-left pb-[12px]">
                COURSE NAME
              </th>
              <th className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase text-left pb-[12px]">
                COURSE NR
              </th>
              <th className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase text-left pb-[12px]">
                INSTRUCTOR
              </th>
              <th className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase text-left pb-[12px]">
                CME TYPE
              </th>
              <th className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase text-left pb-[12px]">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr
                key={course.id}
                onClick={() => navigate('/courses/1')}
                className="border-b border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-muted)]"
              >
                <td className="font-mono text-[13px] text-[var(--color-foreground)] py-[16px]">
                  {course.name}
                </td>
                <td className="font-mono text-[13px] text-[var(--color-muted-foreground)] py-[16px]">
                  {course.courseNr}
                </td>
                <td className="font-mono text-[13px] text-[var(--color-muted-foreground)] py-[16px]">
                  {course.instructor}
                </td>
                <td className="font-mono text-[13px] text-[var(--color-muted-foreground)] py-[16px]">
                  {course.cmeType}
                </td>
                <td className="font-mono text-[13px] py-[16px]">
                  <span
                    className={`inline-block px-[8px] py-[2px] ${getStatusColorClass(
                      course.statusColor
                    )} rounded-[4px] text-[11px] font-bold tracking-[0.05em]`}
                  >
                    {course.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center px-[32px] py-[16px] border-t border-[var(--color-border)]">
        <div className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
          Showing 1-6 of 6 courses
        </div>
        <div className="flex gap-[8px]">
          <button className="font-mono text-[13px] px-[12px] py-[6px] bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-muted-foreground)]">
            Previous
          </button>
          <button className="font-mono text-[13px] px-[12px] py-[6px] bg-[#FACC15] border border-[#FACC15] rounded-[4px] text-black font-bold">
            1
          </button>
          <button className="font-mono text-[13px] px-[12px] py-[6px] bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-muted-foreground)]">
            Next
          </button>
        </div>
      </div>

      {/* Add/Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[8px] w-[800px] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-[24px] py-[16px] border-b border-[var(--color-border)]">
              <h2 className="font-headline text-[18px] font-bold tracking-[1.5px] text-[var(--color-foreground)]">
                ADD NEW COURSE
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                <X className="w-[20px] h-[20px]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-[24px] py-[20px] space-y-[20px]">
              {/* Course Name */}
              <div>
                <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                  COURSE NAME
                </label>
                <input
                  type="text"
                  className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  placeholder="Enter course name"
                />
              </div>

              {/* Course Nr */}
              <div>
                <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                  COURSE NR
                </label>
                <input
                  type="text"
                  className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  placeholder="CRS-####"
                />
              </div>

              {/* Chair */}
              <div>
                <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                  CHAIR
                </label>
                <select className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500">
                  <option>Select chair</option>
                  <option>Dr. Sarah Mitchell</option>
                  <option>Dr. James Wilson</option>
                  <option>Dr. Chen Wei</option>
                  <option>Dr. Lisa Kim</option>
                  <option>Dr. Ray Patel</option>
                </select>
              </div>

              {/* CME & Credits Section */}
              <div className="border-t border-[var(--color-border)] pt-[20px]">
                <h3 className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[16px]">
                  CME & CREDITS
                </h3>

                <div className="grid grid-cols-3 gap-[16px]">
                  {/* CME Type */}
                  <div>
                    <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                      CME TYPE
                    </label>
                    <select className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500">
                      <option>Category 1</option>
                      <option>Category 2</option>
                    </select>
                  </div>

                  {/* CME Total */}
                  <div>
                    <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                      CME TOTAL
                    </label>
                    <input
                      type="number"
                      className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      placeholder="0.0"
                      step="0.1"
                    />
                  </div>

                  {/* Value Total */}
                  <div>
                    <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                      VALUE TOTAL
                    </label>
                    <input
                      type="number"
                      className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      placeholder="$0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Course Type & Duration */}
              <div className="grid grid-cols-2 gap-[16px]">
                {/* Course Type */}
                <div>
                  <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                    COURSE TYPE
                  </label>
                  <select className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500">
                    <option>Required</option>
                    <option>Elective</option>
                    <option>Optional</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                    DURATION
                  </label>
                  <input
                    type="text"
                    className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    placeholder="e.g., 2 weeks, 40 hours"
                  />
                </div>
              </div>

              {/* Service/Dept */}
              <div>
                <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                  SERVICE/DEPT
                </label>
                <select className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500">
                  <option>Select department</option>
                  <option>Cardiology</option>
                  <option>Internal Medicine</option>
                  <option>Surgery</option>
                  <option>Emergency Medicine</option>
                  <option>Pharmacology</option>
                </select>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-[16px]">
                {/* Start Date */}
                <div>
                  <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                    START DATE
                  </label>
                  <input
                    type="date"
                    className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                    END DATE
                  </label>
                  <input
                    type="date"
                    className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
              </div>

              {/* Personnel Section */}
              <div className="border-t border-[var(--color-border)] pt-[20px]">
                <h3 className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[16px]">
                  PERSONNEL
                </h3>

                <div className="grid grid-cols-2 gap-[16px]">
                  {/* Moderator 1 */}
                  <div>
                    <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                      MODERATOR 1
                    </label>
                    <select className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500">
                      <option>Select moderator</option>
                      <option>Dr. Sarah Mitchell</option>
                      <option>Dr. James Wilson</option>
                      <option>Dr. Chen Wei</option>
                      <option>Dr. Lisa Kim</option>
                      <option>Dr. Ray Patel</option>
                    </select>
                  </div>

                  {/* Moderator 2 */}
                  <div>
                    <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                      MODERATOR 2
                    </label>
                    <select className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500">
                      <option>Select moderator</option>
                      <option>Dr. Sarah Mitchell</option>
                      <option>Dr. James Wilson</option>
                      <option>Dr. Chen Wei</option>
                      <option>Dr. Lisa Kim</option>
                      <option>Dr. Ray Patel</option>
                    </select>
                  </div>

                  {/* Organizer */}
                  <div>
                    <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                      ORGANIZER
                    </label>
                    <select className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500">
                      <option>Select organizer</option>
                      <option>Maria Santos</option>
                      <option>Anna Kowalski</option>
                      <option>John Smith</option>
                    </select>
                  </div>

                  {/* Admin */}
                  <div>
                    <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                      ADMIN
                    </label>
                    <select className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500">
                      <option>Select admin</option>
                      <option>Maria Santos</option>
                      <option>Anna Kowalski</option>
                      <option>John Smith</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="border-t border-[var(--color-border)] pt-[20px]">
                <h3 className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase mb-[16px]">
                  DETAILS
                </h3>

                {/* Prerequisites */}
                <div className="mb-[16px]">
                  <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                    PREREQUISITES
                  </label>
                  <textarea
                    className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500 min-h-[80px]"
                    placeholder="Enter course prerequisites"
                  />
                </div>

                {/* Materials Required */}
                <div className="mb-[16px]">
                  <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                    MATERIALS REQUIRED
                  </label>
                  <textarea
                    className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500 min-h-[80px]"
                    placeholder="Enter required materials"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="font-mono text-[12px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase block mb-[8px]">
                    NOTES
                  </label>
                  <textarea
                    className="font-mono text-[13px] px-[12px] py-[8px] w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-yellow-500 min-h-[80px]"
                    placeholder="Enter additional notes"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-[12px] px-[24px] py-[16px] border-t border-[var(--color-border)]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="font-mono text-[13px] px-[16px] py-[8px] bg-[var(--color-background)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="font-mono text-[13px] px-[16px] py-[8px] bg-[#FACC15] text-black rounded-[4px] hover:bg-[#FACC15]/90 font-bold tracking-[0.05em]"
              >
                Save Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
