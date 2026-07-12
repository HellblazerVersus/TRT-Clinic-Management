'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users, AlertTriangle, Clock, RefreshCw, ChevronUp, ChevronDown,
  ChevronsUpDown, FlaskConical, ArrowRight, Loader2, Activity
} from 'lucide-react';
import { cn, formatDate, daysFromNow, getSubscriptionBadgeColor } from '@/lib/utils';

interface Patient {
  id: string; name: string; phone: string; email: string | null;
  intakeDate: string; consentSigned: boolean; subscriptionStatus: string;
  nextDoseDate: string | null; doseDaysAway: number | null;
  renewalDueDate: string | null; renewalDaysAway: number | null;
  labDueDate: string | null; hasFlaggedLab: boolean;
  doseAlert: string; renewalAlert: string;
}

type SortKey = 'name' | 'nextDoseDate' | 'renewalDueDate' | 'labDueDate' | 'subscriptionStatus';
type SortDir = 'asc' | 'desc';

function AlertCell({ date, alert }: { date: string | null; alert: string }) {
  if (!date) return <span className="text-gray-700 text-sm">—</span>;
  return (
    <div className="flex flex-col">
      <span className={cn('text-sm font-medium',
        alert === 'overdue' ? 'text-red-400' : alert === 'warning' ? 'text-amber-400' : 'text-gray-300')}>
        {formatDate(date)}
      </span>
      <span className={cn('text-[11px]',
        alert === 'overdue' ? 'text-red-500/70' : alert === 'warning' ? 'text-amber-500/70' : 'text-gray-600')}>
        {daysFromNow(date)}
      </span>
    </div>
  );
}

function SortTh({ label, sortKey, current, dir, onSort }:
  { label: string; sortKey: SortKey; current: SortKey; dir: SortDir; onSort: (k: SortKey) => void }) {
  const active = current === sortKey;
  return (
    <th className="px-5 py-3.5 text-left">
      <button onClick={() => onSort(sortKey)}
        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-300 transition-colors">
        {label}
        {active
          ? (dir === 'asc' ? <ChevronUp className="w-3 h-3 text-teal-400" /> : <ChevronDown className="w-3 h-3 text-teal-400" />)
          : <ChevronsUpDown className="w-3 h-3 opacity-30" />}
      </button>
    </th>
  );
}

function SubBadge({ status }: { status: string }) {
  const base = 'pill border';
  const map: Record<string, string> = {
    ACTIVE:   'bg-teal-500/10 text-teal-400 border-teal-500/20',
    TRIALING: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    PAST_DUE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    CANCELED: 'bg-gray-700/40 text-gray-500 border-gray-700/40',
    UNPAID:   'bg-red-500/10 text-red-400 border-red-500/20',
    NONE:     'bg-gray-700/40 text-gray-600 border-gray-700/30',
  };
  return <span className={cn(base, map[status] ?? map.NONE)}>{status}</span>;
}

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const load = () => {
    setLoading(true);
    fetch('/api/patients').then(r => r.json()).then(d => { setPatients(d); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    totalActive:     patients.filter(p => p.subscriptionStatus === 'ACTIVE').length,
    overdueDoses:    patients.filter(p => p.doseAlert === 'overdue').length,
    renewalsWeek:    patients.filter(p => p.renewalDaysAway !== null && p.renewalDaysAway >= 0 && p.renewalDaysAway <= 7).length,
    flaggedLabs:     patients.filter(p => p.hasFlaggedLab).length,
  }), [patients]);

  const displayed = useMemo(() => {
    let list = patients.filter(p => !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search));
    return [...list].sort((a, b) => {
      let av: any, bv: any;
      if (sortKey === 'name')               { av = a.name; bv = b.name; }
      else if (sortKey === 'nextDoseDate')  { av = a.doseDaysAway ?? 9999; bv = b.doseDaysAway ?? 9999; }
      else if (sortKey === 'renewalDueDate'){ av = a.renewalDaysAway ?? 9999; bv = b.renewalDaysAway ?? 9999; }
      else if (sortKey === 'labDueDate')    { av = a.labDueDate ?? ''; bv = b.labDueDate ?? ''; }
      else                                  { av = a.subscriptionStatus; bv = b.subscriptionStatus; }
      return sortDir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
    });
  }, [patients, search, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };

  return (
    <div className="flex-1 min-h-screen bg-surface-0 relative">
      {/* Subtle radial glow at top */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-64 bg-glow opacity-60" />

      <div className="relative z-10 p-7 lg:p-10 space-y-7 animate-fade-up">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <p className="section-label mb-2">Overview</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">Provider Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load}
              className="btn-ghost text-[13px] py-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <Link href="/dashboard/intake" className="btn-teal text-[13px] py-1.5">
              + New Patient
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Active Patients', value: stats.totalActive, sub: `of ${patients.length} total`, icon: Users, color: 'text-gray-400' },
            { label: 'Overdue Doses',   value: stats.overdueDoses, sub: 'need attention', icon: AlertTriangle, color: 'text-red-400', accent: 'border-t-red-500/50' },
            { label: 'Renewals · 7d',  value: stats.renewalsWeek, sub: 'Rx due this week', icon: Clock,         color: 'text-amber-400', accent: 'border-t-amber-500/50' },
            { label: 'Flagged Labs',    value: stats.flaggedLabs, sub: 'out of range', icon: FlaskConical,    color: 'text-orange-400', accent: 'border-t-orange-500/40' },
          ].map(({ label, value, sub, icon: Icon, color, accent }) => (
            <div key={label} className={cn('stat-card border-t-2', accent ?? 'border-t-surface-400')}>
              <div className={cn('flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider', color)}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </div>
              <div className="text-4xl font-bold text-white tracking-tight mt-1">{loading ? '—' : value}</div>
              <div className="text-[12px] text-gray-600">{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Patient Table ── */}
        <div className="panel overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-surface-300 flex items-center gap-3">
            <input type="text" placeholder="Search patients…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="field max-w-xs py-2 text-[13px]" />
            <span className="text-[12px] text-gray-600 ml-auto">
              {displayed.length} patient{displayed.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <SortTh label="Patient"      sortKey="name"               current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortTh label="Next Dose"    sortKey="nextDoseDate"       current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortTh label="Lab Due"      sortKey="labDueDate"         current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortTh label="Renewal Due"  sortKey="renewalDueDate"     current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortTh label="Billing"      sortKey="subscriptionStatus" current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-600 text-left">Alerts</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-surface-200/40">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-5 py-4"><div className="skeleton h-3.5 w-20 rounded" /></td>
                        ))}
                      </tr>
                    ))
                  : displayed.length === 0
                  ? <tr><td colSpan={7} className="px-5 py-14 text-center text-gray-600 text-sm">No patients found</td></tr>
                  : displayed.map(p => {
                      const isOverdue = p.doseAlert === 'overdue' || p.renewalAlert === 'overdue';
                      const isWarn    = !isOverdue && (p.doseAlert === 'warning' || p.renewalAlert === 'warning');
                      return (
                        <tr key={p.id} className={cn(isOverdue ? 'row-overdue' : isWarn ? 'row-warning' : '')}>
                          {/* Patient */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-surface-400 flex items-center justify-center text-[10px] font-bold text-gray-300 shrink-0">
                                {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-[13px] font-medium text-white">{p.name}</p>
                                <p className="text-[11px] text-gray-600">{p.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4"><AlertCell date={p.nextDoseDate} alert={p.doseAlert} /></td>
                          <td className="px-5 py-4 text-sm text-gray-400">{formatDate(p.labDueDate)}</td>
                          <td className="px-5 py-4"><AlertCell date={p.renewalDueDate} alert={p.renewalAlert} /></td>
                          <td className="px-5 py-4"><SubBadge status={p.subscriptionStatus} /></td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1.5 flex-wrap">
                              {p.hasFlaggedLab && (
                                <span className="pill bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                  <FlaskConical className="w-2.5 h-2.5" /> Lab
                                </span>
                              )}
                              {!p.consentSigned && (
                                <span className="pill bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  Consent
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <Link href={`/dashboard/patients/${p.id}`}
                              className="inline-flex items-center gap-1 text-[12px] text-gray-600 hover:text-teal-400 transition-colors">
                              View <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
