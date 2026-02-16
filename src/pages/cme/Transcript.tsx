import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../api';

interface Credit {
  activity_id?: number;
  activity_name: string;
  provider: string;
  activity_type: string;
  credits_earned: number;
  total_credits: number;
  date_earned: string;
  verified: boolean;
}

interface TranscriptSummary {
  total: number;
  verified: number;
}

interface TranscriptData {
  credits: Credit[];
  summary: TranscriptSummary;
}

interface Person {
  id: number;
  name: string;
  [key: string]: unknown;
}

export default function Transcript() {
  const { personId } = useParams();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(
    personId ? Number(personId) : null
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch people list for the selector
  useEffect(() => {
    api.people.all().then((data: Person[]) => {
      setPeople(data);
      // If no personId from URL, default to the first person
      if (!selectedPersonId && data.length > 0) {
        setSelectedPersonId(data[0].id);
      }
    });
  }, []);

  // Fetch transcript when selectedPersonId changes
  useEffect(() => {
    if (!selectedPersonId) return;
    setLoading(true);
    setPage(1);
    api.cme.transcript(selectedPersonId).then((data: TranscriptData) => {
      setTranscript(data);
      setLoading(false);
    }).catch(() => {
      setTranscript(null);
      setLoading(false);
    });
  }, [selectedPersonId]);

  const allCredits = transcript?.credits ?? [];
  const summary = transcript?.summary ?? { total: 0, verified: 0 };
  const totalRecords = allCredits.length;

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
  const showingFrom = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, totalRecords);
  const credits = allCredits.slice((page - 1) * limit, page * limit);

  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-headline text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">
              CME TRANSCRIPT
            </h1>
            <p className="mt-[4px] text-[14px] text-[var(--color-muted-foreground)]">
              Complete CME credit history.
            </p>
          </div>
          <div className="flex items-center gap-[12px]">
            {/* Person selector */}
            <select
              value={selectedPersonId ?? ''}
              onChange={(e) => setSelectedPersonId(Number(e.target.value))}
              className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[10px] text-[14px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-secondary)]"
            >
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-[8px] rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[10px] text-[14px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-secondary)]"
            >
              <FileText className="h-[16px] w-[16px]" />
              EXPORT PDF
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-[var(--color-background)]">
          <p className="text-[14px] text-[var(--color-muted-foreground)]">Loading transcript...</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px]">
            <div className="grid grid-cols-4 gap-[24px]">
              <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[20px]">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  TOTAL CREDITS
                </p>
                <p className="mt-[8px] font-mono text-[32px] font-bold text-[var(--color-foreground)]">
                  {summary.total.toFixed(1)}
                </p>
              </div>
              <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[20px]">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  VERIFIED CREDITS
                </p>
                <p className="mt-[8px] font-mono text-[32px] font-bold text-[var(--color-foreground)]">
                  {summary.verified.toFixed(1)}
                </p>
              </div>
              <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[20px]">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  UNVERIFIED
                </p>
                <p className="mt-[8px] font-mono text-[32px] font-bold text-[var(--color-foreground)]">
                  {(summary.total - summary.verified).toFixed(1)}
                </p>
              </div>
              <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] p-[20px]">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  ACTIVITIES
                </p>
                <p className="mt-[8px] font-mono text-[32px] font-bold text-[var(--color-foreground)]">
                  {totalRecords}
                </p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-[var(--color-background)] px-[32px] py-[24px]">
            <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      ACTIVITY
                    </th>
                    <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      PROVIDER
                    </th>
                    <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      TYPE
                    </th>
                    <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      CREDITS
                    </th>
                    <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      TOTAL CREDITS
                    </th>
                    <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      DATE
                    </th>
                    <th className="px-[24px] py-[16px] text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {credits.map((item, index) => (
                    <tr
                      key={index}
                      onClick={() => item.activity_id && navigate(`/cme/${item.activity_id}`)}
                      className="cursor-pointer border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-secondary)] last:border-0"
                    >
                      <td className="px-[24px] py-[16px] text-[14px] font-medium text-[var(--color-foreground)]">
                        {item.activity_name}
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                        {item.provider}
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                        {item.activity_type}
                      </td>
                      <td className="px-[24px] py-[16px] font-mono text-[14px] text-[var(--color-foreground)]">
                        {item.credits_earned.toFixed(1)}
                      </td>
                      <td className="px-[24px] py-[16px] font-mono text-[14px] text-[var(--color-foreground)]">
                        {item.total_credits.toFixed(1)}
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-muted-foreground)]">
                        {item.date_earned}
                      </td>
                      <td className="px-[24px] py-[16px]">
                        <span
                          className={`inline-flex rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold uppercase ${
                            item.verified
                              ? 'bg-green-50 text-green-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {item.verified ? 'VERIFIED' : 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-[24px] flex items-center justify-between">
              <p className="text-[14px] text-[var(--color-muted-foreground)]">
                {totalRecords === 0 ? (
                  'No records'
                ) : (
                  <>
                    Showing <span className="font-medium text-[var(--color-foreground)]">{showingFrom}-{showingTo}</span> of{' '}
                    <span className="font-medium text-[var(--color-foreground)]">{totalRecords}</span> records
                  </>
                )}
              </p>
              <div className="flex items-center gap-[8px]">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-[36px] w-[36px] items-center justify-center rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-[16px] w-[16px]" />
                </button>
                <button className="flex h-[36px] w-[36px] items-center justify-center rounded-[6px] bg-[var(--color-brand-accent)] font-medium text-[var(--color-foreground)]">
                  {page}
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-[36px] w-[36px] items-center justify-center rounded-[6px] border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-[16px] w-[16px]" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
