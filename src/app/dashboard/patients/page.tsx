'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Users } from 'lucide-react';
import { cn, formatDate, getSubscriptionBadgeColor } from '@/lib/utils';

interface Patient {
  id: string; name: string; phone: string; email: string | null;
  intakeDate: string; subscriptionStatus: string; consentSigned: boolean;
  doseAlert: string; renewalAlert: string; hasFlaggedLab: boolean;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch(`/api/patients?search=${encodeURIComponent(search)}`)
        .then(r => r.json())
        .then(d => { setPatients(d); setLoading(false); });
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="p-6 lg:p-8 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Patients</h1>
          <p className="text-sm text-slate-400 mt-0.5">{patients.length} patients in system</p>
        </div>
        <Link href="/dashboard/intake"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-trt-600 hover:bg-trt-500 text-white text-sm font-medium transition-all shadow-lg shadow-trt-600/20">
          + New Patient Intake
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone…"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-800/70 border border-slate-700 text-white text-sm
            placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-trt-500 transition-all"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="skeleton h-5 w-32 rounded" />
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p) => {
            const hasAlert = p.doseAlert === 'overdue' || p.renewalAlert === 'overdue';
            const hasWarning = p.doseAlert === 'warning' || p.renewalAlert === 'warning';
            return (
              <Link key={p.id} href={`/dashboard/patients/${p.id}`}
                className={cn(
                  'glass-card p-5 hover:bg-slate-800/50 transition-all group border',
                  hasAlert ? 'border-red-800/50 bg-red-950/20' :
                  hasWarning ? 'border-amber-800/40 bg-amber-950/10' :
                  'border-slate-800/60'
                )}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-trt-800 flex items-center justify-center text-trt-200 text-sm font-bold shrink-0">
                      {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-trt-300 transition-colors">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.phone}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-trt-400 transition-colors shrink-0 mt-1" />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className={cn('badge', getSubscriptionBadgeColor(p.subscriptionStatus))}>
                    {p.subscriptionStatus}
                  </span>
                  {!p.consentSigned && (
                    <span className="badge bg-purple-500/20 text-purple-300 border-purple-500/30">
                      Consent Pending
                    </span>
                  )}
                  {p.hasFlaggedLab && (
                    <span className="badge bg-orange-500/20 text-orange-300 border-orange-500/30">
                      Flagged Lab
                    </span>
                  )}
                  {hasAlert && (
                    <span className="badge bg-red-500/20 text-red-300 border-red-500/30">
                      Overdue
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-3">Intake: {formatDate(p.intakeDate)}</p>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && patients.length === 0 && (
        <div className="flex flex-col items-center justify-center h-60 gap-3">
          <Users className="w-12 h-12 text-slate-700" />
          <p className="text-slate-400">No patients found</p>
          <Link href="/dashboard/intake"
            className="px-4 py-2 rounded-lg bg-trt-600 hover:bg-trt-500 text-white text-sm font-medium transition-all">
            Add first patient
          </Link>
        </div>
      )}
    </div>
  );
}
