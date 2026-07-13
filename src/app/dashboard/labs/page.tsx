import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LineChart, Activity, ClipboardList, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default async function LabsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  // Mocked historical lab data
  const historicalLabs = [
    { date: 'Jan 2023', totalT: 320, e2: 15 },
    { date: 'Apr 2023', totalT: 650, e2: 28 },
    { date: 'Jul 2023', totalT: 780, e2: 32 },
    { date: 'Oct 2023', totalT: 850, e2: 35 },
  ];

  return (
    <div className="flex-1 min-h-screen bg-surface-0 relative pb-20">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-64 bg-glow opacity-60" />

      <div className="relative z-10 max-w-5xl mx-auto p-6 lg:p-10 space-y-8 animate-fade-up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="section-label mb-2 text-teal-400">Clinical Data</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">My Labs & Symptoms</h1>
            <p className="text-gray-400 mt-1">Track your hormone optimization progress over time.</p>
          </div>
        </div>

        {/* ── Symptom Tracker ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ClipboardList className="text-teal-400" size={20} /> Weekly Check-In
          </h2>
          <div className="glass-panel p-6">
            <p className="text-sm text-gray-400 mb-6">Log your subjective well-being so your provider can adjust your protocol accordingly.</p>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { id: 'energy', label: 'Energy Levels' },
                  { id: 'mood', label: 'Mood / Mental Clarity' },
                  { id: 'libido', label: 'Libido' },
                  { id: 'sleep', label: 'Sleep Quality' }
                ].map(metric => (
                  <div key={metric.id} className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">{metric.label}</label>
                    <select className="w-full bg-surface-200 border border-surface-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors" defaultValue="3">
                      <option value="1">1 - Very Poor</option>
                      <option value="2">2 - Poor</option>
                      <option value="3">3 - Average</option>
                      <option value="4">4 - Good</option>
                      <option value="5">5 - Excellent</option>
                    </select>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Additional Notes (Optional)</label>
                <textarea 
                  className="w-full bg-surface-200 border border-surface-300 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
                  rows={3}
                  placeholder="Any new side effects, changes in routine, etc..."
                ></textarea>
              </div>
              <button type="button" className="btn-primary">
                Submit Weekly Log
              </button>
            </form>
          </div>
        </section>

        {/* ── Lab History Charts (Mocked) ── */}
        <section className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <LineChart className="text-teal-400" size={20} /> Testosterone Trends
          </h2>
          <div className="panel p-6 h-64 flex items-end justify-between gap-2 border-t-0 bg-gradient-to-t from-teal-900/10 to-transparent">
            {historicalLabs.map((lab, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-3 relative group">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-surface-400 text-white text-xs px-2 py-1 rounded transition-opacity whitespace-nowrap z-20">
                  {lab.totalT} ng/dL
                </div>
                
                {/* Bar */}
                <div 
                  className="w-full max-w-[64px] bg-teal-500/30 border-t-2 border-teal-400 rounded-t-sm transition-all group-hover:bg-teal-500/50"
                  style={{ height: `${(lab.totalT / 1000) * 100}%`, minHeight: '4px' }}
                ></div>
                <span className="text-xs text-gray-500 font-medium">{lab.date}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── All Recent Labs ── */}
        <section className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="text-teal-400" size={20} /> Comprehensive Panel History
          </h2>
          <div className="panel overflow-hidden">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Marker</th>
                  <th>Value</th>
                  <th>Reference Range</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Testosterone</td>
                  <td className="font-semibold text-white">850 ng/dL</td>
                  <td className="text-gray-500">300 - 1000</td>
                  <td className="text-gray-500">Oct 12, 2023</td>
                  <td><span className="pill bg-teal-500/10 text-teal-400 border border-teal-500/20">Optimal</span></td>
                </tr>
                <tr>
                  <td>Free Testosterone</td>
                  <td className="font-semibold text-white">22 pg/mL</td>
                  <td className="text-gray-500">9 - 30</td>
                  <td className="text-gray-500">Oct 12, 2023</td>
                  <td><span className="pill bg-teal-500/10 text-teal-400 border border-teal-500/20">Optimal</span></td>
                </tr>
                <tr>
                  <td>Estradiol (E2)</td>
                  <td className="font-semibold text-white">35 pg/mL</td>
                  <td className="text-gray-500">10 - 40</td>
                  <td className="text-gray-500">Oct 12, 2023</td>
                  <td><span className="pill bg-teal-500/10 text-teal-400 border border-teal-500/20">Optimal</span></td>
                </tr>
                <tr className="bg-amber-950/20 border-l-2 border-l-amber-500/60">
                  <td>Hematocrit</td>
                  <td className="font-semibold text-amber-400">51%</td>
                  <td className="text-gray-500">38 - 50</td>
                  <td className="text-gray-500">Oct 12, 2023</td>
                  <td><span className="pill bg-amber-500/10 text-amber-400 border border-amber-500/20">High</span></td>
                </tr>
                <tr>
                  <td>SHBG</td>
                  <td className="font-semibold text-white">32 nmol/L</td>
                  <td className="text-gray-500">16.5 - 55.9</td>
                  <td className="text-gray-500">Oct 12, 2023</td>
                  <td><span className="pill bg-teal-500/10 text-teal-400 border border-teal-500/20">Optimal</span></td>
                </tr>
                <tr>
                  <td>PSA, Serum</td>
                  <td className="font-semibold text-white">1.2 ng/mL</td>
                  <td className="text-gray-500">0.0 - 4.0</td>
                  <td className="text-gray-500">Oct 12, 2023</td>
                  <td><span className="pill bg-teal-500/10 text-teal-400 border border-teal-500/20">Optimal</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
