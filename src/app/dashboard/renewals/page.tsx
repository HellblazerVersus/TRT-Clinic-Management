'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowRight, AlertTriangle, Clock, CheckCircle, Loader2, Filter } from 'lucide-react';
import { cn, formatDate, daysFromNow } from '@/lib/utils';
import { DispenseModal } from '@/components/dispense-modal';

interface Renewal {
  id: string; compound: string; compoundLabel: string; quantity: string;
  prescriber: string; scheduleClass: string; renewalDueDate: string; status: string;
  dispenseDate: string | null; deaLotNumber: string | null; pharmacyName: string | null;
  patient: { id: string; name: string; phone: string; subscriptionStatus: string; };
}

const COMPOUNDS = [
  { value: '', label: 'All compounds' },
  { value: 'testosterone_cypionate', label: 'Testosterone Cypionate' },
  { value: 'testosterone_enanthate', label: 'Testosterone Enanthate' },
  { value: 'sermorelin',             label: 'Sermorelin' },
  { value: 'pt141',                  label: 'PT-141' },
  { value: 'anastrozole',            label: 'Anastrozole' },
  { value: 'hcg',                    label: 'HCG' },
];

function SubPill({ status }: { status: string }) {
  const map: Record<string,string> = {
    ACTIVE: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    PAST_DUE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    CANCELED: 'bg-gray-700/30 text-gray-500 border-gray-700/20',
    UNPAID: 'bg-red-500/10 text-red-400 border-red-500/20',
    TRIALING: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    NONE: 'bg-gray-700/30 text-gray-600 border-gray-700/20',
  };
  return <span className={cn('pill border', map[status] ?? map.NONE)}>{status}</span>;
}

function RenewPill({ status }: { status: string }) {
  const map: Record<string,string> = {
    PENDING:   'bg-sky-500/10 text-sky-400 border-sky-500/20',
    OVERDUE:   'bg-red-500/10 text-red-400 border-red-500/20',
    DISPENSED: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    CANCELED:  'bg-gray-700/30 text-gray-500 border-gray-700/20',
  };
  return <span className={cn('pill border', map[status] ?? '')}>{status}</span>;
}

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading]   = useState(true);
  const [days, setDays]         = useState(30);
  const [compound, setCompound] = useState('');
  const [dispenseTarget, setDispenseTarget] = useState<Renewal | null>(null);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams({ days: String(days) });
    if (compound) p.set('compound', compound);
    fetch(`/api/renewals?${p}`).then(r => r.json()).then(d => { setRenewals(d); setLoading(false); });
  };
  useEffect(() => { load(); }, [days, compound]);

  const overdue = renewals.filter(r => r.status === 'OVERDUE').length;
  const pending = renewals.filter(r => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-surface-0 relative">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-48 bg-glow opacity-40" />

      <div className="relative z-10 p-7 lg:p-10 animate-fade-up space-y-7">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="section-label mb-2">Controlled Substances</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">Rx Renewal Queue</h1>
            <p className="text-gray-500 text-[13px] mt-1">DEA Schedule III tracking · one-click dispense logging</p>
          </div>
          <button onClick={load} className="btn-ghost text-[13px] py-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="stat-card border-t-2 border-t-red-500/50">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" /> Overdue
            </div>
            <div className="text-4xl font-bold text-white tracking-tight mt-1">{overdue}</div>
          </div>
          <div className="stat-card border-t-2 border-t-amber-500/50">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              <Clock className="w-3.5 h-3.5" /> Pending
            </div>
            <div className="text-4xl font-bold text-white tracking-tight mt-1">{pending}</div>
          </div>
          <div className="stat-card border-t-2 border-t-surface-400">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Total in window</div>
            <div className="text-4xl font-bold text-white tracking-tight mt-1">{renewals.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="panel p-4 flex flex-wrap items-center gap-4">
          <Filter className="w-4 h-4 text-gray-600 shrink-0" />
          <div className="flex items-center gap-2">
            <label className="text-[13px] text-gray-500">Window:</label>
            <select value={days} onChange={e => setDays(Number(e.target.value))} className="field py-1.5 text-[13px] w-auto">
              {[7,14,30,60,90].map(d => <option key={d} value={d}>{d} days</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[13px] text-gray-500">Compound:</label>
            <select value={compound} onChange={e => setCompound(e.target.value)} className="field py-1.5 text-[13px] w-auto">
              {COMPOUNDS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="panel overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
            </div>
          ) : renewals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <CheckCircle className="w-8 h-8 text-teal-500" />
              <p className="text-gray-500 text-sm">No renewals due in this window</p>
            </div>
          ) : (
            <table className="w-full data-table">
              <thead>
                <tr>
                  {['Patient','Compound','Qty','Renewal Due','Prescriber','Sched.','Billing','Status',''].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {renewals.map(r => {
                  const daysAway = Math.ceil((new Date(r.renewalDueDate).getTime() - Date.now()) / 86400000);
                  const isOverdue = daysAway < 0;
                  const isUrgent  = !isOverdue && daysAway <= 3;
                  return (
                    <tr key={r.id} className={cn(isOverdue ? 'row-overdue' : isUrgent ? 'row-warning' : '')}>
                      <td>
                        <div>
                          <p className="text-[13px] font-medium text-white">{r.patient.name}</p>
                          <p className="text-[11px] text-gray-600">{r.patient.phone}</p>
                        </div>
                      </td>
                      <td className="text-gray-300 text-[13px]">{r.compoundLabel}</td>
                      <td className="text-gray-500 text-[13px]">{r.quantity}</td>
                      <td>
                        <div className={cn('text-[13px] font-medium',
                          isOverdue ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-gray-300')}>
                          {formatDate(r.renewalDueDate)}
                          <span className={cn('block text-[11px]',
                            isOverdue ? 'text-red-500/70' : isUrgent ? 'text-amber-500/70' : 'text-gray-600')}>
                            {daysFromNow(r.renewalDueDate)}
                          </span>
                        </div>
                      </td>
                      <td className="text-gray-500 text-[12px]">{r.prescriber}</td>
                      <td>
                        <span className="pill border bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
                          DEA-{r.scheduleClass}
                        </span>
                      </td>
                      <td><SubPill status={r.patient.subscriptionStatus} /></td>
                      <td><RenewPill status={r.status} /></td>
                      <td>
                        <div className="flex items-center gap-2">
                          {['PENDING','OVERDUE'].includes(r.status) && (
                            <button onClick={() => setDispenseTarget(r)} className="btn-ghost text-[12px] py-1 px-3">
                              Log Dispensed
                            </button>
                          )}
                          <Link href={`/dashboard/patients/${r.patient.id}`}
                            className="text-gray-600 hover:text-teal-400 transition-colors">
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {dispenseTarget && (
        <DispenseModal
          renewal={dispenseTarget}
          onClose={() => setDispenseTarget(null)}
          onSuccess={() => { setDispenseTarget(null); load(); }}
        />
      )}
    </div>
  );
}
