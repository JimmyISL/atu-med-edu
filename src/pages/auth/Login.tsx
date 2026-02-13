import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="flex h-screen w-full">
      {/* LEFT PANEL - BRAND */}
      <div className="w-[560px] bg-[#09090B] h-full flex flex-col justify-between p-[48px]">
        {/* Top - Logo */}
        <div className="flex flex-col gap-[16px]">
          <div className="w-[48px] h-[48px] bg-[#FACC15] flex items-center justify-center">
            <span className="text-[#09090B] text-[32px] font-bold leading-none">+</span>
          </div>
          <h1 className="font-headline text-[28px] font-bold text-white tracking-[4px]">
            ATU MedEd
          </h1>
        </div>

        {/* Middle - Tagline */}
        <div className="flex flex-col gap-[16px]">
          <h2 className="font-headline text-[20px] font-bold text-white tracking-[2px]">
            STREAMLINE YOUR
          </h2>
          <p className="font-mono text-[13px] text-[#A3A3A3] leading-[1.6]">
            Medical education program management, CME tracking, and credential management — all in one place.
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
              SIGN IN
            </h2>
            <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
              Enter your credentials to access the admin panel.
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-[20px]">
            {/* Email Field */}
            <div className="flex flex-col">
              <label className="font-mono text-[14px] font-medium mb-[6px] text-[var(--color-foreground)] uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@hospital.edu"
                className="border border-[var(--color-input)] rounded-[6px] px-[12px] py-[10px] w-full bg-[var(--color-background)] font-mono text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--color-foreground)]"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col">
              <label className="font-mono text-[14px] font-medium mb-[6px] text-[var(--color-foreground)] uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="border border-[var(--color-input)] rounded-[6px] px-[12px] py-[10px] w-full bg-[var(--color-background)] font-mono text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--color-foreground)]"
              />
            </div>

            {/* Remember Me + Forgot Password Row */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-[8px] cursor-pointer">
                <input
                  type="checkbox"
                  className="w-[16px] h-[16px] border border-[var(--color-input)] rounded-[4px]"
                />
                <span className="font-mono text-[13px] text-[var(--color-foreground)]">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="font-mono text-[13px] text-[var(--color-foreground)] hover:text-[var(--color-brand-accent)] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-headline text-[14px] font-bold tracking-[2px] py-[12px] rounded-[6px] uppercase hover:opacity-90 transition-opacity"
            >
              SIGN IN
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

          {/* Register Link */}
          <p className="text-center font-mono text-[13px] text-[var(--color-muted-foreground)]">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-[var(--color-foreground)] font-medium hover:text-[var(--color-brand-accent)] transition-colors"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
