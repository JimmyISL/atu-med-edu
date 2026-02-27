import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth';
import { api } from '../../api';

export default function SSOCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { ssoLogin, user } = useAuth();
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // If already logged in, go to dashboard
    if (user) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setError('No SSO token provided.');
      setVerifying(false);
      return;
    }

    api.sso.verify(token)
      .then((userData) => {
        ssoLogin({
          email: userData.email,
          name: userData.name,
          initials: userData.initials,
          role: userData.role,
        });
        navigate('/dashboard', { replace: true });
      })
      .catch((err) => {
        setError(err.message || 'SSO verification failed. The link may have expired.');
        setVerifying(false);
      });
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="max-w-[400px] w-full p-[32px] text-center">
          <div className="w-[48px] h-[48px] rounded-full bg-red-100 flex items-center justify-center mx-auto mb-[16px]">
            <span className="text-red-600 text-[20px] font-bold">!</span>
          </div>
          <h1 className="font-headline text-[20px] font-bold text-[var(--color-foreground)] mb-[8px]">
            SSO Login Failed
          </h1>
          <p className="text-[14px] text-[var(--color-muted-foreground)] mb-[24px]">
            {error}
          </p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="px-[16px] py-[10px] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-[6px] text-[14px] font-medium hover:opacity-90 transition-opacity"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
      <div className="text-center">
        <div className="w-[32px] h-[32px] border-[3px] border-[#2596be] border-t-transparent rounded-full animate-spin mx-auto mb-[16px]" />
        <p className="text-[14px] text-[var(--color-muted-foreground)]">
          {verifying ? 'Verifying your identity...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}
