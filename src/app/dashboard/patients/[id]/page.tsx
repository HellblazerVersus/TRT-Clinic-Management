'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, Phone, Mail, Calendar, ShieldCheck, Shield,
  FlaskConical, CreditCard, Loader2, AlertTriangle, CheckCircle,
  ExternalLink, ArrowRight, Activity
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from 'recharts';
import { cn, formatDate, formatDateTime, getProtocolStatusColor, getRenewalStatusColor } from '@/lib/utils';
import { DispenseModal } from '@/components/dispense-modal';

interface LabResult {
  id: string; marker: string; markerLabel: string; value: number;
  unit: string; date: string; flagged: boolean;
  referenceMin: number | null; referenceMax: number | null; labName: string | null;
}
interface Protocol {
  id: string; compound: string; compoundLabel: string; dose: string;
  frequency: string; route: string | null; startDate: string;
  nextDoseDate: string | null; status: string; prescriber: string | null;
}
interface RxRenewal {
  id: string; compoundLabel: string; quantity: string; prescriber: string;
  scheduleClass: string; renewalDueDate: string; status: string;
  dispenseDate: string | null; deaLotNumber: string | null; pharmacyName: string | null;
}
interface ReminderLog {
  id: string; type: string; channel: string; message: string; sentAt: string; status: string;
}
interface Patient {
  id: string; name: string; phone: string; email: string | null;
  intakeDate: string; dateOfBirth: string | null; consentSigned: boolean;
  consentSignedAt: string | null; notes: string | null;
  subscriptionStatus: string; nextBillingDate: string | null;
  stripeCustomerId: string | null; stripeSubscriptionId: string | null;
  labDueDate: string | null;
  protocols: Protocol[]; labResults: LabResult[];
  rxRenewals: RxRenewal[]; reminderLogs: ReminderLog[];
}

type TabId = 'overview' | 'labs' | 'protocols' | 'renewals' | 'billing' | 'reminders';
const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'labs', label: 'Labs' },
  { id: 'protocols', label: 'Protocols' },
  { id: 'renewals', label: 'Renewals' },
  { id: 'billing', label: 'Billing' },
  { id: 'reminders', label: 'Reminders' },
];

// ─── Lab Chart ─────────────────────────────────────────────────────────────
function LabChart({ labs, marker }: { labs: LabResult[]; marker: string }) {
  const data = labs.filter(l => l.marker === marker)
    .map(l => ({
      date: new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: l.value,
      flagged: l.flagged,
      unit: l.unit,
    }));

  if (!data.length) return (
    <div className="h-52 flex items-center justify-center text-gray-600 text-sm">No data</div>
  );

  const ref = labs.find(l => l.marker === marker && l.referenceMin !== null);
  const unit = data[0]?.unit ?? '';

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    return <circle cx={cx} cy={cy} r={4}
      fill={payload.flagged ? '#f87171' : '#14b8a6'}
      stroke={payload.flagged ? '#7f1d1d' : '#0d9488'} strokeWidth={1.5} />;
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1c1d23" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} unit={` ${unit}`} width={72} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#0f1014', border: '1px solid #1c1d23', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#6b7280' }}
          formatter={(v: number) => [`${v} ${unit}`, '']} />
        {ref?.referenceMin != null && ref?.referenceMax != null && (
          <ReferenceArea y1={ref.referenceMin} y2={ref.referenceMax} fill="#14b8a6" fillOpacity={0.06} />
        )}
        {ref?.referenceMin != null && <ReferenceLine y={ref.referenceMin} stroke="#14b8a6" strokeDasharray="4 4" strokeOpacity={0.3} />}
        {ref?.referenceMax != null && <ReferenceLine y={ref.referenceMax} stroke="#14b8a6" strokeDasharray="4 4" strokeOpacity={0.3} />}
        <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2}
          dot={<CustomDot />} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Status badges ──────────────────────────────────────────────────────────
function SubBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    TRIALING: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    PAST_DUE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    CANCELED: 'bg-gray-700/40 text-gray-500 border-gray-700/30',
    UNPAID: 'bg-red-500/10 text-red-400 border-red-500/20',
    NONE: 'bg-gray-700/30 text-gray-600 border-gray-700/20',
  };
  return <span className={cn('pill border', map[status] ?? map.NONE)}>{status}</span>;
}

function ProtoBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    PAUSED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    DISCONTINUED: 'bg-gray-700/30 text-gray-500 border-gray-700/20',
  };
  return <span className={cn('pill border', map[status] ?? '')}>{status}</span>;
}

function RenewBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    DISPENSED: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    OVERDUE: 'bg-red-500/10 text-red-400 border-red-500/20',
    CANCELED: 'bg-gray-700/30 text-gray-500 border-gray-700/20',
  };
  return <span className={cn('pill border', map[status] ?? '')}>{status}</span>;
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>('overview');
  const [dispenseRenewal, setDispense] = useState<RxRenewal | null>(null);
  const [chartMarker, setChartMarker] = useState('total_T');

  const refresh = () => {
    fetch(`/api/patients/${id}`).then(r => r.json()).then(d => { setPatient(d); setLoading(false); });
  };
  useEffect(() => { refresh(); }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-surface-0">
      <Loader2 className="w-7 h-7 animate-spin text-teal-500" />
    </div>
  );
  if (!patient) return <div className="p-10 text-red-400">Patient not found.</div>;

  const activeProtocols = patient.protocols.filter(p => p.status === 'ACTIVE');
  const pendingRenewals = patient.rxRenewals.filter(r => ['PENDING', 'OVERDUE'].includes(r.status));
  const flaggedLabs = patient.labResults.filter(l => l.flagged);
  const markers = [...new Set(patient.labResults.map(l => l.marker))];

  return (
    <div className="min-h-screen bg-surface-0 relative">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-48 bg-glow opacity-40" />

      <div className="relative z-10 p-7 lg:p-10 animate-fade-up max-w-7xl">
        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-white mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Dashboard
        </button>

        {/* ── Patient header ── */}
        <div className="panel p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-400 flex items-center justify-center text-white font-bold tracking-tight shrink-0">
                {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{patient.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-1 text-[13px] text-gray-500">
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{patient.phone}</span>
                  {patient.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{patient.email}</span>}
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Intake {formatDate(patient.intakeDate)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SubBadge status={patient.subscriptionStatus} />
              {patient.consentSigned
                ? <span className="pill border bg-teal-500/10 text-teal-400 border-teal-500/20"><ShieldCheck className="w-3 h-3" /> Consent</span>
                : <span className="pill border bg-red-500/10 text-red-400 border-red-500/20"><Shield className="w-3 h-3" /> No Consent</span>
              }
              {flaggedLabs.length > 0 && (
                <span className="pill border bg-orange-500/10 text-orange-400 border-orange-500/20">
                  <FlaskConical className="w-3 h-3" /> {flaggedLabs.length} Flagged
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-0.5 mb-5 border-b border-surface-300">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                'px-4 py-2.5 text-[13px] font-medium transition-all',
                tab === t.id
                  ? 'text-white border-b-2 border-teal-500 -mb-px'
                  : 'text-gray-600 hover:text-gray-300'
              )}>{t.label}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            <div className="panel p-5">
              <p className="section-label mb-3">Active Protocols</p>
              {activeProtocols.length === 0
                ? <p className="text-sm text-gray-600">None</p>
                : activeProtocols.map(p => (
                  <div key={p.id} className="mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-0 border-surface-300">
                    <p className="text-[13px] font-medium text-white">{p.compoundLabel}</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">{p.dose} · {p.frequency.replace(/_/g, ' ')}</p>
                    <p className="text-[12px] text-teal-400 mt-1">Next: {formatDate(p.nextDoseDate)}</p>
                  </div>
                ))
              }
            </div>
            <div className="panel p-5">
              <p className="section-label mb-3">Pending Renewals</p>
              {pendingRenewals.length === 0
                ? <p className="text-sm text-gray-600">None</p>
                : pendingRenewals.map(r => (
                  <div key={r.id} className="mb-3 last:mb-0 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-medium text-white">{r.compoundLabel}</p>
                      <p className="text-[12px] text-gray-500">Due {formatDate(r.renewalDueDate)}</p>
                    </div>
                    <RenewBadge status={r.status} />
                  </div>
                ))
              }
            </div>
            <div className="panel p-5">
              <p className="section-label mb-3">Recent Flags</p>
              {flaggedLabs.length === 0
                ? <div className="flex items-center gap-2 text-teal-400 text-[13px]"><CheckCircle className="w-4 h-4" /> All labs in range</div>
                : flaggedLabs.slice(0, 4).map(l => (
                  <div key={l.id} className="mb-3 last:mb-0 flex items-center justify-between">
                    <div>
                      <p className="text-[13px] text-orange-300 font-medium">{l.markerLabel}</p>
                      <p className="text-[11px] text-gray-500">{l.value} {l.unit} · {formatDate(l.date)}</p>
                    </div>
                    <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ── LABS ── */}
        {tab === 'labs' && (
          <div className="space-y-5 animate-fade-in">
            <div className="panel p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="section-label mb-1">Lab Trends</p>
                  <h2 className="text-lg font-bold text-white tracking-tight">Biomarker Over Time</h2>
                </div>
                <select value={chartMarker} onChange={e => setChartMarker(e.target.value)}
                  className="field py-1.5 text-[13px] w-auto">
                  {markers.map(m => (
                    <option key={m} value={m}>{m.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <LabChart labs={patient.labResults} marker={chartMarker} />
              <p className="text-[11px] text-gray-700 mt-3 text-center">
                Teal band = reference range · Red dots = flagged values
              </p>
            </div>

            <div className="panel overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-300">
                <p className="text-[13px] font-semibold text-white">All Lab Results</p>
              </div>
              <table className="w-full data-table">
                <thead>
                  <tr>
                    {['Date', 'Marker', 'Value', 'Reference', 'Lab', 'Status'].map(h =>
                      <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[...patient.labResults].reverse().map(l => (
                    <tr key={l.id} className={cn(l.flagged && 'bg-orange-950/10')}>
                      <td className="text-gray-500 text-[13px]">{formatDate(l.date)}</td>
                      <td className="text-white font-medium text-[13px]">{l.markerLabel}</td>
                      <td className={cn('font-semibold text-[13px]', l.flagged ? 'text-orange-300' : 'text-teal-400')}>
                        {l.value} {l.unit}
                      </td>
                      <td className="text-gray-500 text-[13px]">
                        {l.referenceMin != null ? `${l.referenceMin}–${l.referenceMax} ${l.unit}` : '—'}
                      </td>
                      <td className="text-gray-500 text-[13px]">{l.labName ?? '—'}</td>
                      <td>
                        {l.flagged
                          ? <span className="pill border bg-orange-500/10 text-orange-400 border-orange-500/20">
                            <AlertTriangle className="w-2.5 h-2.5" /> Flagged
                          </span>
                          : <span className="pill border bg-teal-500/10 text-teal-400 border-teal-500/20">
                            <CheckCircle className="w-2.5 h-2.5" /> OK
                          </span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PROTOCOLS ── */}
        {tab === 'protocols' && (
          <div className="panel overflow-hidden animate-fade-in">
            <div className="px-5 py-4 border-b border-surface-300">
              <p className="section-label mb-0.5">Protocol History</p>
            </div>
            <table className="w-full data-table">
              <thead>
                <tr>
                  {['Compound', 'Dose', 'Frequency', 'Route', 'Start', 'Next Dose', 'Prescriber', 'Status'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {patient.protocols.map(p => (
                  <tr key={p.id}>
                    <td className="text-white font-medium text-[13px]">{p.compoundLabel}</td>
                    <td className="text-gray-300 text-[13px]">{p.dose}</td>
                    <td className="text-gray-400 text-[13px] capitalize">{p.frequency.replace(/_/g, ' ')}</td>
                    <td className="text-gray-500 text-[13px]">{p.route ?? '—'}</td>
                    <td className="text-gray-500 text-[13px]">{formatDate(p.startDate)}</td>
                    <td className="text-gray-300 text-[13px]">{formatDate(p.nextDoseDate)}</td>
                    <td className="text-gray-500 text-[13px]">{p.prescriber ?? '—'}</td>
                    <td><ProtoBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── RENEWALS ── */}
        {tab === 'renewals' && (
          <div className="panel overflow-hidden animate-fade-in">
            <div className="px-5 py-4 border-b border-surface-300 flex items-center justify-between">
              <p className="section-label">Rx Renewal History</p>
              <span className="text-[11px] text-gray-600 uppercase tracking-wider">DEA Schedule III Tracking</span>
            </div>
            <table className="w-full data-table">
              <thead>
                <tr>
                  {['Compound', 'Qty', 'Renewal Due', 'Dispense Date', 'DEA Lot #', 'Prescriber', 'Sched.', 'Status', ''].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {patient.rxRenewals.map(r => (
                  <tr key={r.id}>
                    <td className="text-white font-medium text-[13px]">{r.compoundLabel}</td>
                    <td className="text-gray-500 text-[13px]">{r.quantity}</td>
                    <td className="text-gray-300 text-[13px]">{formatDate(r.renewalDueDate)}</td>
                    <td className="text-gray-500 text-[13px]">{formatDate(r.dispenseDate)}</td>
                    <td className="font-mono text-[12px] text-gray-500">{r.deaLotNumber ?? '—'}</td>
                    <td className="text-gray-500 text-[13px]">{r.prescriber}</td>
                    <td>
                      <span className="pill border bg-purple-500/10 text-purple-400 border-purple-500/20">
                        DEA-{r.scheduleClass}
                      </span>
                    </td>
                    <td><RenewBadge status={r.status} /></td>
                    <td>
                      {['PENDING', 'OVERDUE'].includes(r.status) && (
                        <button onClick={() => setDispense(r)}
                          className="btn-ghost text-[12px] py-1 px-3">
                          Log Dispensed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── BILLING ── */}
        {tab === 'billing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <div className="panel p-6">
              <p className="section-label mb-4">Subscription</p>
              <div className="space-y-3">
                {[
                  ['Status', <SubBadge status={patient.subscriptionStatus} />],
                  ['Customer ID', <span className="font-mono text-[12px] text-gray-400">{patient.stripeCustomerId ?? '—'}</span>],
                  ['Subscription ID', <span className="font-mono text-[12px] text-gray-400">{patient.stripeSubscriptionId ?? '—'}</span>],
                  ['Next Billing', <span className="text-gray-300 text-[13px]">{formatDate(patient.nextBillingDate)}</span>],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex items-center justify-between">
                    <span className="text-[13px] text-gray-500">{k}</span>
                    {v}
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-surface-300 flex gap-2">
                {['NONE', 'CANCELED'].includes(patient.subscriptionStatus) ? (
                  <button
                    onClick={async () => {
                      const res = await fetch('/api/stripe/checkout', { method: 'POST', body: JSON.stringify({ patientId: patient.id }), headers: { 'Content-Type': 'application/json' } });
                      const { url } = await res.json();
                      if (url) window.open(url, '_blank');
                    }}
                    className="btn-teal text-[13px]">
                    <CreditCard className="w-4 h-4" /> Start Subscription
                  </button>
                ) : (
                  <button className="btn-ghost text-[13px]">
                    <ExternalLink className="w-4 h-4" /> Billing Portal
                  </button>
                )}
              </div>
            </div>

            <div className="panel p-6">
              <p className="section-label mb-4">Membership Plan</p>
              <div className="rounded-xl border border-surface-400 bg-surface-200 p-5">
                <p className="text-3xl font-bold text-white tracking-tight">
                  $199<span className="text-base text-gray-500 font-normal">/mo</span>
                </p>
                <p className="text-[13px] text-gray-500 mt-1">TRT Optimization Membership</p>
                <ul className="mt-5 space-y-2">
                  {['Unlimited provider consultations', 'Protocol management', 'Lab trend analysis', 'DEA Rx tracking', 'SMS reminders'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-gray-400">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── REMINDERS ── */}
        {tab === 'reminders' && (
          <div className="panel overflow-hidden animate-fade-in">
            <div className="px-5 py-4 border-b border-surface-300">
              <p className="section-label">Reminder Log</p>
            </div>
            {patient.reminderLogs.length === 0
              ? <div className="p-10 text-center text-gray-600 text-sm">No reminders sent yet</div>
              : <div className="divide-y divide-surface-200/60">
                {patient.reminderLogs.map(r => (
                  <div key={r.id} className="px-5 py-4 flex items-start gap-4">
                    <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                      r.status === 'mocked' ? 'bg-gray-600' : r.status === 'sent' ? 'bg-teal-500' : 'bg-red-500')} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">{r.type}</span>
                        <span className="text-[11px] text-gray-600">via {r.channel}</span>
                        <span className={cn('text-[11px]',
                          r.status === 'mocked' ? 'text-gray-600' : r.status === 'sent' ? 'text-teal-500' : 'text-red-400')}>
                          [{r.status}]
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-400 break-words">{r.message}</p>
                      <p className="text-[11px] text-gray-700 mt-1">{formatDateTime(r.sentAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}
      </div>

      {dispenseRenewal && (
        <DispenseModal
          renewal={dispenseRenewal}
          onClose={() => setDispense(null)}
          onSuccess={() => { setDispense(null); refresh(); }}
        />
      )}
    </div>
  );
}
