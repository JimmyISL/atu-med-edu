import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="flex h-screen w-full">
      {/* LEFT PANEL - BRAND */}
      <div className="w-[560px] bg-[#09090B] h-full flex flex-col justify-between p-[48px]">
        {/* Top - Logo */}
        <div className="flex flex-col gap-[16px]">
          <div className="w-[48px] h-[48px] bg-[#2596be] flex items-center justify-center">
            <span className="text-[#09090B] text-[32px] font-bold leading-none">+</span>
          </div>
          <h1 className="font-headline text-[28px] font-bold text-white tracking-[4px]">
            ATU MedEd
          </h1>
        </div>

        {/* Middle - Tagline */}
        <div className="flex flex-col gap-[16px]">
          <h2 className="font-headline text-[20px] font-bold text-white tracking-[2px]">
            INVITE ONLY
          </h2>
          <p className="font-mono text-[13px] text-[#A3A3A3] leading-[1.6]">
            Admin accounts are invite-only. Enter the invite code provided by your program administrator to create your account.
          </p>
        </div>

        {/* Bottom - Copyright */}
        <div>
          <p className="font-mono text-[11px] text-[#525252]">
            © 2025 ATU Medical Education
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="flex-1 flex items-center justify-center bg-[var(--color-background)]">
        <div className="w-[400px] flex flex-col gap-[32px]">
          {/* Header */}
          <div className="flex flex-col gap-[8px]">
            <h2 className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
              CREATE ACCOUNT
            </h2>
            <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
              Enter your invite code and details to create your account.
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-[20px]">
            {/* Invite Code Field */}
            <div className="flex flex-col">
              <label className="font-mono text-[14px] font-medium mb-[6px] text-[var(--color-foreground)] uppercase tracking-wider">
                Invite Code
              </label>
              <input
                type="text"
                placeholder="Enter your invite code"
                className="border border-[var(--color-input)] rounded-[6px] px-[12px] py-[10px] w-full bg-[var(--color-background)] font-mono text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--color-foreground)]"
              />
            </div>

            {/* First Name / Last Name Row */}
            <div className="flex gap-[16px]">
              <div className="flex flex-col flex-1">
                <label className="font-mono text-[14px] font-medium mb-[6px] text-[var(--color-foreground)] uppercase tracking-wider">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="First name"
                  className="border border-[var(--color-input)] rounded-[6px] px-[12px] py-[10px] w-full bg-[var(--color-background)] font-mono text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--color-foreground)]"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="font-mono text-[14px] font-medium mb-[6px] text-[var(--color-foreground)] uppercase tracking-wider">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Last name"
                  className="border border-[var(--color-input)] rounded-[6px] px-[12px] py-[10px] w-full bg-[var(--color-background)] font-mono text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--color-foreground)]"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col">
              <label className="font-mono text-[14px] font-medium mb-[6px] text-[var(--color-foreground)] uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@hospital.edu"
                className="border border-[var(--color-input)] rounded-[6px] px-[12px] py-[10px] w-full bg-[var(--color-background)] font-mono text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--color-foreground)]"
              />
            </div>

            {/* Role Select */}
            <div className="flex flex-col">
              <label className="font-mono text-[14px] font-medium mb-[6px] text-[var(--color-foreground)] uppercase tracking-wider">
                Role
              </label>
              <select
                className="border border-[var(--color-input)] rounded-[6px] px-[12px] py-[10px] w-full bg-[var(--color-background)] font-mono text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--color-foreground)]"
              >
                <option value="">Select your role</option>
                <option value="program-director">Program Director</option>
                <option value="faculty">Faculty</option>
                <option value="resident">Resident</option>
                <option value="admin-staff">Admin Staff</option>
              </select>
            </div>

            {/* Password / Confirm Password Row */}
            <div className="flex gap-[16px]">
              <div className="flex flex-col flex-1">
                <label className="font-mono text-[14px] font-medium mb-[6px] text-[var(--color-foreground)] uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Create password"
                  className="border border-[var(--color-input)] rounded-[6px] px-[12px] py-[10px] w-full bg-[var(--color-background)] font-mono text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--color-foreground)]"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="font-mono text-[14px] font-medium mb-[6px] text-[var(--color-foreground)] uppercase tracking-wider">
                  Confirm
                </label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  className="border border-[var(--color-input)] rounded-[6px] px-[12px] py-[10px] w-full bg-[var(--color-background)] font-mono text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--color-foreground)]"
                />
              </div>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-headline text-[14px] font-bold tracking-[2px] py-[12px] rounded-[6px] uppercase hover:opacity-90 transition-opacity"
            >
              CREATE ACCOUNT
            </button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center gap-[16px]">
            <div className="flex-1 h-[1px] bg-[var(--color-border)]"></div>
            <span className="font-mono text-[12px] text-[var(--color-muted-foreground)] uppercase tracking-wider">
              OR
            </span>
            <div className="flex-1 h-[1px] bg-[var(--color-border)]"></div>
          </div>

          {/* Sign In Link */}
          <p className="text-center font-mono text-[13px] text-[var(--color-muted-foreground)]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[var(--color-foreground)] font-medium hover:text-[var(--color-brand-accent)] transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
