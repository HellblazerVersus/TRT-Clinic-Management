'use client';

import { useState } from 'react';
import { Activity, Loader2, UserPlus, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/actions/auth';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await registerUser(null, formData);

    if (result?.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setLoading(false);
      setError(result?.message || 'Registration failed.');
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
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Create an Account</h1>
            <p className="text-gray-400 text-sm leading-relaxed">Start your journey today by setting up your secure patient profile.</p>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="text-teal-400 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Registration Complete!</h2>
              <p className="text-sm text-gray-400">Redirecting you to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="label">Full Name</label>
                <input id="name" name="name" type="text" required
                  className="field" placeholder="John Doe" />
              </div>
              <div>
                <label htmlFor="email" className="label">Email Address</label>
                <input id="email" name="email" type="email" required
                  className="field" placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="password" className="label">Password</label>
                <input id="password" name="password" type="password" required
                  className="field" placeholder="••••••••" minLength={6} />
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
                {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link href="/login" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
              Already have an account? Log in here
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-500 tracking-wide">
              By signing up, you agree to our Terms of Service and Privacy Policy. Secure, HIPAA-compliant patient portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
