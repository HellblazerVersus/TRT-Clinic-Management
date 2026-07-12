'use client';

import { useState } from 'react';
import { Bell, ArrowRight, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

export default function RemindersPage() {
  const [running, setRunning]   = useState(false);
  const [result, setResult]     = useState<any>(null);
  const [error, setError]       = useState('');

  async function triggerReminders() {
    setRunning(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/reminders/run', {
        headers: { 'x-cron-secret': 'cron-secret-change-in-prod' },
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Failed');
      else setResult(data.results);
    } catch (e) {
      setError('Request failed');
    }
    setRunning(false);
  }

  return (
    <div className="min-h-screen bg-surface-0 relative">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-48 bg-glow opacity-40" />

      <div className="relative z-10 p-7 lg:p-10 animate-fade-up max-w-2xl">
        <p className="section-label mb-2">Automated Outreach</p>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Reminder Engine</h1>
        <p className="text-gray-500 text-[13px] mb-8">
          Triggers SMS reminders for patients with a dose or renewal due within 3 days.
          In dev mode, messages are logged to the console and written to the ReminderLog table.
        </p>

        {/* Trigger card */}
        <div className="panel p-6 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-white">Run Reminder Job</h2>
                <p className="text-[12px] text-gray-500 mt-0.5">Checks all active protocols and pending renewals</p>
              </div>
            </div>
            <button onClick={triggerReminders} disabled={running}
              className="btn-teal shrink-0">
              {running
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Running…</>
                : <><RefreshCw className="w-4 h-4" /> Run Now</>
              }
            </button>
          </div>

          {result && (
            <div className="mt-5 pt-4 border-t border-surface-300">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-400 mb-3">Run Results</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Dose Reminders Sent',   value: result.doseReminders },
                  { label: 'Refill Reminders Sent', value: result.refillReminders },
                  { label: 'Skipped (24h dedup)',   value: result.skipped },
                  { label: 'Errors',                 value: result.errors },
                ].map(({ label, value }) => (
                  <div key={label} className="panel-sm p-3 flex items-center justify-between">
                    <span className="text-[12px] text-gray-500">{label}</span>
                    <span className="text-base font-bold text-white">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[13px] text-teal-400">
                <CheckCircle className="w-4 h-4" />
                Job completed. Check server console for mocked SMS messages.
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-4 py-3">{error}</p>
          )}
        </div>

        {/* Info panel */}
        <div className="panel p-5">
          <p className="section-label mb-3">Automation Setup</p>
          <div className="space-y-4 text-[13px]">
            <div>
              <p className="text-white font-medium mb-1">Vercel Cron (vercel.json)</p>
              <pre className="bg-surface-200 rounded-lg px-4 py-3 text-teal-300 font-mono text-[12px] overflow-x-auto">
{`{
  "crons": [{
    "path": "/api/reminders/run",
    "schedule": "0 9 * * *"
  }]
}`}
              </pre>
            </div>
            <div>
              <p className="text-white font-medium mb-1">Required Header</p>
              <pre className="bg-surface-200 rounded-lg px-4 py-3 text-teal-300 font-mono text-[12px]">
{`x-cron-secret: <CRON_SECRET env var>`}
              </pre>
            </div>
            <div>
              <p className="text-white font-medium mb-1">Logic</p>
              <ul className="space-y-1.5 text-gray-500">
                <li className="flex items-start gap-2"><ArrowRight className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />Finds ACTIVE protocols with nextDoseDate ≤ now+3d</li>
                <li className="flex items-start gap-2"><ArrowRight className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />Finds PENDING renewals with renewalDueDate ≤ now+3d</li>
                <li className="flex items-start gap-2"><ArrowRight className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />Deduplicates: skips if same type sent in last 24h</li>
                <li className="flex items-start gap-2"><ArrowRight className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />All sends logged to ReminderLog table</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
