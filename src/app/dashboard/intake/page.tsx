'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronRight, ChevronLeft, CheckCircle, ArrowRight } from 'lucide-react';

const COMPOUNDS = [
  { value: 'testosterone_cypionate', label: 'Testosterone Cypionate 200mg/mL' },
  { value: 'testosterone_enanthate', label: 'Testosterone Enanthate 200mg/mL' },
  { value: 'sermorelin',             label: 'Sermorelin 2mg/vial' },
  { value: 'pt141',                  label: 'PT-141 (Bremelanotide) 10mg' },
  { value: 'anastrozole',            label: 'Anastrozole 1mg' },
  { value: 'hcg',                    label: 'HCG 10,000 IU/vial' },
];
const FREQUENCIES = [
  { value: 'daily',        label: 'Daily' },
  { value: 'twice_weekly', label: 'Twice Weekly' },
  { value: 'weekly',       label: 'Weekly' },
  { value: 'biweekly',     label: 'Every 2 Weeks' },
  { value: 'monthly',      label: 'Monthly' },
  { value: 'nightly',      label: 'Nightly' },
  { value: 'as_needed',    label: 'As Needed' },
];
const LAB_MARKERS = [
  { marker: 'total_T',    label: 'Total Testosterone', unit: 'ng/dL', refMin: 400,  refMax: 1000 },
  { marker: 'free_T',     label: 'Free Testosterone',  unit: 'pg/mL', refMin: 9,    refMax: 30   },
  { marker: 'hematocrit', label: 'Hematocrit',          unit: '%',     refMin: 38.5, refMax: 50   },
  { marker: 'estradiol',  label: 'Estradiol',           unit: 'pg/mL', refMin: 10,   refMax: 40   },
  { marker: 'psa',        label: 'PSA',                 unit: 'ng/mL', refMin: 0,    refMax: 4    },
  { marker: 'igf1',       label: 'IGF-1',               unit: 'ng/mL', refMin: 100,  refMax: 300  },
];

const STEP_LABELS = ['Patient Info', 'Protocol', 'Baseline Labs', 'Consent'];

export default function IntakePage() {
  const router = useRouter();
  const [step, setStep]     = useState(0);
  const [submitting, setSub] = useState(false);
  const [error, setError]   = useState('');
  const [done, setDone]     = useState(false);
  const [newId, setNewId]   = useState('');

  // Step 0
  const [name, setName]   = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob]     = useState('');
  const [notes, setNotes] = useState('');

  // Step 1
  const [addProtocol, setAddProtocol] = useState(true);
  const [compound, setCompound]       = useState('testosterone_cypionate');
  const [dose, setDose]               = useState('100mg');
  const [frequency, setFreq]          = useState('twice_weekly');
  const [route, setRoute]             = useState('IM injection');
  const [prescriber, setPrescriber]   = useState('');
  const [startDate, setStart]         = useState(new Date().toISOString().slice(0,10));

  // Step 2
  const [labValues, setLab] = useState<Record<string,string>>({});
  const [labName, setLabName] = useState('LabCorp');

  // Step 3
  const [consent, setConsent] = useState(false);

  async function submit() {
    setSub(true); setError('');
    const labs = LAB_MARKERS
      .filter(m => labValues[m.marker] && !isNaN(parseFloat(labValues[m.marker])))
      .map(m => ({
        marker: m.marker, markerLabel: m.label,
        value: parseFloat(labValues[m.marker]),
        unit: m.unit, referenceMin: m.refMin, referenceMax: m.refMax, labName,
      }));
    const compDef = COMPOUNDS.find(c => c.value === compound);
    const body = {
      name, phone, email: email || undefined, dateOfBirth: dob || undefined,
      notes: notes || undefined, consentSigned: consent,
      ...(addProtocol && { protocol: { compound, compoundLabel: compDef?.label ?? compound, dose, frequency, route, prescriber: prescriber || undefined, startDate } }),
      ...(labs.length > 0 && { labs }),
    };
    const res = await fetch('/api/patients', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    if (!res.ok) { setError('Failed to create patient.'); setSub(false); }
    else { const p = await res.json(); setNewId(p.id); setDone(true); }
  }

  if (done) return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-6">
      <div className="text-center max-w-sm animate-fade-up">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-7 h-7 text-teal-400" />
        </div>
        <p className="section-label mb-2">Success</p>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">{name} added</h2>
        <p className="text-gray-500 text-[13px] mb-7">Protocol and baseline labs have been recorded.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push(`/dashboard/patients/${newId}`)} className="btn-teal">
            View Patient <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => { setDone(false); setStep(0); setName(''); setPhone(''); setEmail(''); }} className="btn-ghost">
            Add Another
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-0 relative">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-48 bg-glow opacity-40" />

      <div className="relative z-10 p-7 lg:p-10 animate-fade-up">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <p className="section-label mb-2">Patient Management</p>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">New Patient Intake</h1>
          <p className="text-gray-500 text-[13px] mb-8">Register a new patient and configure their initial protocol.</p>

          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all',
                    i < step  ? 'bg-teal-500 border-teal-500 text-white' :
                    i === step ? 'bg-surface-300 border-teal-500/60 text-teal-400' :
                                 'bg-surface-200 border-surface-400 text-gray-600'
                  )}>
                    {i < step ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium whitespace-nowrap ${
                    i === step ? 'text-teal-400' : i < step ? 'text-gray-500' : 'text-gray-700'
                  }`}>{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 mb-5 ${i < step ? 'bg-teal-500/40' : 'bg-surface-400'}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 0: Patient Info ── */}
          {step === 0 && (
            <div className="panel p-6 space-y-4 animate-fade-in">
              <h2 className="text-base font-semibold text-white mb-1">Patient Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Full Name <span className="text-red-400">*</span></label>
                  <input type="text" value={name} onChange={e=>setName(e.target.value)}
                    placeholder="John Smith" className="field" />
                </div>
                <div>
                  <label className="label">Phone <span className="text-red-400">*</span></label>
                  <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)}
                    placeholder="+1 555 000 0000" className="field" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="patient@email.com" className="field" />
                </div>
                <div>
                  <label className="label">Date of Birth</label>
                  <input type="date" value={dob} onChange={e=>setDob(e.target.value)} className="field" />
                </div>
                <div className="col-span-2">
                  <label className="label">Clinical Notes</label>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3}
                    placeholder="Chief complaints, history, goals…"
                    className="field resize-none" />
                </div>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex justify-end pt-1">
                <button onClick={() => { if (!name || !phone) { setError('Name and phone required'); return; } setError(''); setStep(1); }}
                  className="btn-teal">Next <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* ── Step 1: Protocol ── */}
          {step === 1 && (
            <div className="panel p-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-semibold text-white">Initial Protocol</h2>
                <label className="flex items-center gap-2 text-[13px] text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={addProtocol} onChange={e=>setAddProtocol(e.target.checked)}
                    className="rounded border-surface-400 bg-surface-200 text-teal-500 focus:ring-teal-500/40" />
                  Add now
                </label>
              </div>
              {addProtocol && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Compound</label>
                    <select value={compound} onChange={e=>setCompound(e.target.value)} className="field">
                      {COMPOUNDS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Dose</label>
                    <input type="text" value={dose} onChange={e=>setDose(e.target.value)} placeholder="100mg" className="field" />
                  </div>
                  <div>
                    <label className="label">Frequency</label>
                    <select value={frequency} onChange={e=>setFreq(e.target.value)} className="field">
                      {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Route</label>
                    <input type="text" value={route} onChange={e=>setRoute(e.target.value)} className="field" />
                  </div>
                  <div>
                    <label className="label">Start Date</label>
                    <input type="date" value={startDate} onChange={e=>setStart(e.target.value)} className="field" />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Prescriber</label>
                    <input type="text" value={prescriber} onChange={e=>setPrescriber(e.target.value)}
                      placeholder="Dr. Sarah Mitchell, MD" className="field" />
                  </div>
                </div>
              )}
              <div className="flex justify-between pt-1">
                <button onClick={() => { setStep(0); setError(''); }} className="btn-ghost">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => { setError(''); setStep(2); }} className="btn-teal">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Labs ── */}
          {step === 2 && (
            <div className="panel p-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-semibold text-white">Baseline Labs</h2>
                <select value={labName} onChange={e=>setLabName(e.target.value)} className="field py-1.5 text-[13px] w-auto">
                  {['LabCorp','Quest Diagnostics','BioReference','Other'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <p className="text-[12px] text-gray-600">Leave blank to skip. Flagging is automatic based on reference ranges.</p>
              <div className="space-y-3">
                {LAB_MARKERS.map(m => (
                  <div key={m.marker} className="flex items-center gap-3">
                    <span className="w-36 text-[13px] text-gray-400 shrink-0">{m.label}</span>
                    <input type="number" step="0.01" value={labValues[m.marker] ?? ''}
                      onChange={e => setLab(p => ({...p, [m.marker]: e.target.value}))}
                      placeholder="Value" className="field flex-1 py-2 text-[13px]" />
                    <span className="text-[12px] text-gray-600 w-14 shrink-0">{m.unit}</span>
                    <span className="text-[11px] text-gray-700 shrink-0">{m.refMin}–{m.refMax}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-1">
                <button onClick={() => { setStep(1); setError(''); }} className="btn-ghost">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => { setError(''); setStep(3); }} className="btn-teal">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Consent ── */}
          {step === 3 && (
            <div className="panel p-6 space-y-4 animate-fade-in">
              <h2 className="text-base font-semibold text-white mb-1">Review & Consent</h2>

              {/* Summary */}
              <div className="panel-sm p-4 space-y-2">
                {[
                  ['Name',          name],
                  ['Phone',         phone],
                  ...(email ? [['Email', email]] : []),
                  ...(addProtocol ? [['Protocol', `${COMPOUNDS.find(c=>c.value===compound)?.label} · ${dose}`]] : []),
                  ['Baseline Labs', `${Object.values(labValues).filter(v=>v).length} values`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[13px]">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}
                  className="mt-0.5 rounded border-surface-400 bg-surface-200 text-teal-500 focus:ring-teal-500/40" />
                <span className="text-[13px] text-gray-400 leading-relaxed">
                  Patient has reviewed and signed the consent form, HIPAA acknowledgment, and treatment agreement.
                  Physical signature is on file.
                </span>
              </label>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex justify-between pt-1">
                <button onClick={() => { setStep(2); setError(''); }} className="btn-ghost">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={submit} disabled={submitting} id="intake-submit"
                  className="btn-teal">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {submitting ? 'Creating…' : 'Create Patient'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
