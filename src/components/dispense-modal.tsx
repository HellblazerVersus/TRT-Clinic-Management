'use client';

import { useState } from 'react';
import { X, Loader2, Package, ArrowRight } from 'lucide-react';

interface RxRenewal {
  id: string; compoundLabel: string; quantity: string;
  prescriber: string; scheduleClass: string; renewalDueDate: string;
}
interface Props { renewal: RxRenewal; onClose: () => void; onSuccess: () => void; }

export function DispenseModal({ renewal, onClose, onSuccess }: Props) {
  const [deaLotNumber, setDeaLotNumber] = useState('');
  const [pharmacyName, setPharmacyName] = useState('Empower Pharmacy');
  const [notes, setNotes]               = useState('');
  const [nextDays, setNextDays]         = useState(90);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!deaLotNumber.trim()) { setError('DEA Lot Number required'); return; }
    setLoading(true); setError('');
    const res = await fetch('/api/renewals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ renewalId: renewal.id, deaLotNumber, pharmacyName, notes, nextRenewalDays: nextDays }),
    });
    if (!res.ok) { setError('Failed to log. Please retry.'); setLoading(false); }
    else onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md panel p-6 animate-fade-up shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="section-label mb-1">DEA Schedule {renewal.scheduleClass}</p>
            <h2 className="text-lg font-bold text-white tracking-tight">Log Dispensed Rx</h2>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compound info */}
        <div className="panel-sm p-4 mb-5">
          <p className="text-[13px] font-medium text-white">{renewal.compoundLabel}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Qty: {renewal.quantity} · {renewal.prescriber}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">DEA Lot Number <span className="text-red-400">*</span></label>
            <input type="text" value={deaLotNumber} onChange={e => setDeaLotNumber(e.target.value)}
              placeholder="e.g. LOT-48291" required className="field" />
          </div>

          <div>
            <label className="label">Pharmacy</label>
            <input type="text" value={pharmacyName} onChange={e => setPharmacyName(e.target.value)} className="field" />
          </div>

          <div>
            <label className="label">Next Renewal</label>
            <select value={nextDays} onChange={e => setNextDays(Number(e.target.value))} className="field">
              {[30,60,90,120].map(d => <option key={d} value={d}>{d} days</option>)}
            </select>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="field resize-none" placeholder="Optional…" />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-4 py-3">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-ghost justify-center">
              Cancel
            </button>
            <button type="submit" disabled={loading} id="dispense-submit"
              className="flex-1 btn-teal justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
              {loading ? 'Logging…' : 'Log Dispensed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
