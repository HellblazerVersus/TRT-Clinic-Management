'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowRight, Activity } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  const [email, setEmail] = useState('admin@clinic.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) { setError('Invalid credentials.'); setLoading(false); }
    else router.push(callbackUrl);
  }

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-glow" />

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />

      <div className="w-full max-w-sm relative z-10 animate-fade-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold tracking-tight">TRT Clinic</span>
        </div>

        {/* Card */}
        <div className="panel p-8">
          {/* Section label */}
          <p className="section-label mb-3">Provider Access</p>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Sign in</h1>
          <p className="text-gray-500 text-sm mb-7">Access your clinic management dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="field" placeholder="admin@clinic.com" />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                className="field" placeholder="••••••••" />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} id="login-submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full
                bg-white text-surface-0 font-semibold text-sm
                hover:bg-gray-100 transition-colors disabled:opacity-50 mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 pt-5 border-t border-surface-300">
            <p className="text-[11px] text-gray-600 text-center tracking-wide uppercase">Demo credentials pre-filled</p>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-700 mt-6 tracking-wide uppercase">
          TRT Clinic MSO · Not a certified EHR
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-0" />}>
      <LoginForm />
    </Suspense>
  );
}
