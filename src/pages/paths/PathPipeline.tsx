import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PathPipeline() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px] flex items-center gap-[16px]">
        <button
          onClick={() => navigate(`/paths/${id}`)}
          className="inline-flex items-center gap-[6px] font-mono text-[13px] text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
        >
          <ArrowLeft className="h-[16px] w-[16px]" />
          Back to Path
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-[12px]">
          <h2 className="font-headline text-[24px] font-bold text-[var(--color-foreground)]">
            PIPELINE VIEW
          </h2>
          <p className="font-mono text-[14px] text-[var(--color-muted-foreground)] max-w-[400px]">
            Kanban-style pipeline view coming soon. Trainees will be shown as cards grouped by their current phase.
          </p>
        </div>
      </div>
    </div>
  );
}
