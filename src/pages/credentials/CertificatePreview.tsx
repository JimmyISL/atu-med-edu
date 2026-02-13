import { Download, Printer } from 'lucide-react';

export default function CertificatePreview() {
  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px]">
        <div>
          <h1 className="font-headline text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">
            CERTIFICATE PREVIEW
          </h1>
          <p className="mt-[4px] text-[14px] text-[var(--color-muted-foreground)]">
            Preview generated certificate.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[var(--color-background)] px-[32px] py-[48px]">
        {/* Certificate Card */}
        <div className="mx-auto max-w-[800px] rounded-[12px] border border-[var(--color-border)] bg-white p-[48px] shadow-lg">
          {/* Certificate Content */}
          <div className="text-center">
            {/* Title */}
            <h1 className="font-headline text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">
              CERTIFICATE OF COMPLETION
            </h1>

            {/* Divider */}
            <div className="mx-auto my-[24px] h-[2px] w-[80px] bg-[var(--color-brand-accent)]"></div>

            {/* Body Text */}
            <p className="text-[16px] text-[var(--color-muted-foreground)]">
              This certifies that
            </p>

            {/* Recipient Name */}
            <h2 className="mt-[16px] font-headline text-[28px] font-bold text-[var(--color-foreground)]">
              Dr. James Wilson
            </h2>

            {/* Achievement Text */}
            <p className="mt-[16px] text-[16px] text-[var(--color-muted-foreground)]">
              has successfully completed
            </p>

            {/* Course Name */}
            <h3 className="mt-[16px] text-[20px] font-bold text-[var(--color-foreground)]">
              Advanced Cardiac Life Support
            </h3>

            {/* Certificate Details */}
            <div className="mt-[32px] space-y-[12px] text-[14px] text-[var(--color-muted-foreground)]">
              <div className="flex items-center justify-center gap-[8px]">
                <span className="font-semibold text-[var(--color-foreground)]">
                  Credential Nr:
                </span>
                <span className="font-mono">CRED-2025-001</span>
              </div>
              <div className="flex items-center justify-center gap-[8px]">
                <span className="font-semibold text-[var(--color-foreground)]">Issue Date:</span>
                <span>March 15, 2025</span>
              </div>
              <div className="flex items-center justify-center gap-[8px]">
                <span className="font-semibold text-[var(--color-foreground)]">Credits:</span>
                <span className="font-mono">24.0 AMA PRA Category 1</span>
              </div>
              <div className="flex items-center justify-center gap-[8px]">
                <span className="font-semibold text-[var(--color-foreground)]">Value:</span>
                <span className="font-mono">$4,800</span>
              </div>
            </div>

            {/* Signature Area */}
            <div className="mt-[48px] flex items-center justify-center gap-[64px]">
              <div className="text-center">
                <div className="mb-[8px] h-[1px] w-[180px] bg-[var(--color-border)]"></div>
                <p className="text-[12px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Authorized Signature
                </p>
              </div>
              <div className="text-center">
                <div className="mb-[8px] h-[1px] w-[180px] bg-[var(--color-border)]"></div>
                <p className="text-[12px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Date
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-[48px] border-t border-[var(--color-border)] pt-[24px]">
              <p className="font-headline text-[14px] font-semibold text-[var(--color-foreground)]">
                ATU Medical Education
              </p>
              <p className="mt-[4px] text-[12px] text-[var(--color-muted-foreground)]">
                Accredited Provider of Continuing Medical Education
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mx-auto mt-[32px] flex max-w-[800px] items-center justify-center gap-[16px]">
          <button className="flex items-center gap-[8px] rounded-[8px] bg-[var(--color-primary)] px-[24px] py-[12px] text-[14px] font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90">
            <Download className="h-[16px] w-[16px]" />
            DOWNLOAD PDF
          </button>
          <button className="flex items-center gap-[8px] rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] px-[24px] py-[12px] text-[14px] font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-secondary)]">
            <Printer className="h-[16px] w-[16px]" />
            PRINT
          </button>
        </div>
      </div>
    </div>
  );
}
