import { Plus, FileText } from 'lucide-react';

const templates = [
  {
    id: 1,
    name: 'Certificate of Completion - Category 1',
    category: 'Category 1',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Certificate of Completion - Category 2',
    category: 'Category 2',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Advanced Training Certificate',
    category: 'Category 1',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Professional Development Certificate',
    category: 'Category 2',
    status: 'Active',
  },
];

export default function TemplateLibrary() {
  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-headline text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">
              CREDENTIAL TEMPLATES
            </h1>
            <p className="mt-[4px] text-[14px] text-[var(--color-muted-foreground)]">
              Manage certificate templates.
            </p>
          </div>
          <button className="flex items-center gap-[8px] rounded-[8px] bg-[var(--color-primary)] px-[16px] py-[10px] text-[14px] font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90">
            <Plus className="h-[16px] w-[16px]" />
            UPLOAD TEMPLATE
          </button>
        </div>
      </div>

      {/* Template Grid */}
      <div className="flex-1 overflow-auto bg-[var(--color-background)] px-[32px] py-[24px]">
        <div className="grid grid-cols-2 gap-[24px]">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group cursor-pointer rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] transition-all hover:border-[var(--color-brand-accent)] hover:shadow-lg"
            >
              {/* Preview Area */}
              <div className="flex h-[160px] items-center justify-center bg-[var(--color-secondary)] rounded-t-[8px] border-b border-[var(--color-border)]">
                <div className="flex h-[80px] w-[80px] items-center justify-center rounded-[12px] bg-[var(--color-card)] border border-[var(--color-border)] transition-all group-hover:border-[var(--color-brand-accent)]">
                  <FileText className="h-[40px] w-[40px] text-[var(--color-brand-accent)]" />
                </div>
              </div>

              {/* Template Info */}
              <div className="p-[20px]">
                <h3 className="text-[16px] font-semibold text-[var(--color-foreground)] mb-[8px]">
                  {template.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="inline-flex rounded-[6px] bg-[var(--color-brand-accent)] px-[8px] py-[4px] text-[12px] font-semibold uppercase text-[var(--color-foreground)]">
                    {template.category}
                  </span>
                  <span className="inline-flex rounded-[6px] bg-green-50 px-[8px] py-[4px] text-[12px] font-semibold uppercase text-green-600">
                    {template.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
