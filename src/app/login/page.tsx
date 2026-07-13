'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { Activity, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setError('Invalid email or password.');
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-glow" />

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-20"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />

      <div className="w-full max-w-sm relative z-10 animate-fade-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">TRT Portal</span>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 border-t-2 border-t-teal-500">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-gray-400 text-sm leading-relaxed">Sign in to access your dashboard, track labs, and manage your protocols.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <input id="email" name="email" type="email" required
                className="field" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" name="password" type="password" required
                className="field" placeholder="••••••••" />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl
                bg-teal-500 text-white font-bold text-sm mt-2
                hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20 disabled:opacity-70 disabled:hover:bg-teal-500"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/signup" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
              Don't have an account? Sign up here
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-500 tracking-wide">
              Secure, HIPAA-compliant patient portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <Loader2 className="animate-spin text-teal-500 w-8 h-8" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}


