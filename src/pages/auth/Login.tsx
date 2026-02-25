import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const user = login(email)
    if (user) {
      navigate('/dashboard')
    } else {
      setError('Email not recognized. Please use an authorized email address.')
    }
  }

  return (
    <div className="flex h-screen w-full">
      {/* LEFT PANEL - BRAND */}
      <div className="w-[560px] bg-[#09090B] h-full flex flex-col justify-between p-[48px]">
        <div className="flex flex-col gap-[16px]">
          <div className="w-[48px] h-[48px] bg-[#2596be] flex items-center justify-center">
            <span className="text-[#09090B] text-[32px] font-bold leading-none">+</span>
          </div>
          <h1 className="font-headline text-[28px] font-bold text-white tracking-[4px]">
            ATU MedEd
          </h1>
        </div>

        <div className="flex flex-col gap-[16px]">
          <h2 className="font-headline text-[20px] font-bold text-white tracking-[2px]">
            STREAMLINE YOUR
          </h2>
          <p className="font-mono text-[13px] text-[#A3A3A3] leading-[1.6]">
            Medical education program management, CME tracking, and credential management — all in one place.
          </p>
        </div>

        <div>
          <p className="font-mono text-[11px] text-[#525252]">
            © 2025 ATU Medical Education Management System — Inspired by NeuroPro
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="flex-1 flex items-center justify-center bg-[var(--color-background)]">
        <div className="w-[400px] flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[8px]">
            <h2 className="font-headline text-[28px] font-bold text-[var(--color-foreground)]">
              SIGN IN
            </h2>
            <p className="font-mono text-[13px] text-[var(--color-muted-foreground)]">
              Enter your email to access the admin panel. No password required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
            <div className="flex flex-col">
              <label className="font-mono text-[14px] font-medium mb-[6px] text-[var(--color-foreground)] uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@islife.us"
                className="border border-[var(--color-input)] rounded-[6px] px-[12px] py-[10px] w-full bg-[var(--color-background)] font-mono text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--color-foreground)]"
                required
              />
            </div>

            {error && (
              <p className="font-mono text-[13px] text-[var(--color-destructive)]">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-headline text-[14px] font-bold tracking-[2px] py-[12px] rounded-[6px] uppercase hover:opacity-90 transition-opacity"
            >
              SIGN IN
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
