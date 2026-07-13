import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Activity, Droplets, CalendarClock, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  return (
    <div className="flex-1 min-h-screen bg-surface-0 relative pb-20">
      {/* Subtle radial glow at top */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-64 bg-glow opacity-60" />

      <div className="relative z-10 max-w-5xl mx-auto p-6 lg:p-10 space-y-8 animate-fade-up">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="section-label mb-2 text-teal-400">Patient Dashboard</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome, {session.user.name || 'Patient'}</h1>
            <p className="text-gray-400 mt-1">Here is the latest update on your hormone optimization journey.</p>
          </div>
          <Link href="/explain" className="btn-ghost text-sm py-2">
            View TRT Guide
          </Link>
        </div>

        {/* ── Action Required Alert ── */}
        <div className="glass-panel p-5 border-l-4 border-l-amber-500/70 flex items-start gap-4">
          <CalendarClock className="text-amber-400 shrink-0 mt-1" />
          <div>
            <h3 className="text-white font-semibold">Upcoming Lab Work Due</h3>
            <p className="text-sm text-gray-400 mt-1">Your next blood panel is scheduled for next week. Please ensure you visit the clinic before Friday.</p>
          </div>
        </div>

        {/* ── Active Protocols ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Droplets className="text-teal-400" size={20} /> Your Protocols
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="panel p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-teal-500/10 group-hover:text-teal-500/20 transition-colors">
                <Activity size={80} className="-mr-4 -mt-4" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold mb-3 border border-teal-500/20">
                  <CheckCircle2 size={12} /> Active
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Testosterone Cypionate</h3>
                <p className="text-sm text-gray-400 mb-4">200mg/mL</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-500">Dose</span>
                    <span className="text-white">100mg</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-500">Frequency</span>
                    <span className="text-white">Twice Weekly</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-gray-500">Next Dose</span>
                    <span className="text-teal-400 font-medium">Tomorrow</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="panel p-5 flex flex-col items-center justify-center text-center border-dashed border-2 border-surface-300 hover:border-surface-400 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-surface-200 flex items-center justify-center text-gray-400 group-hover:text-teal-400 group-hover:bg-teal-500/10 transition-colors mb-3">
                <CalendarClock size={24} />
              </div>
              <h3 className="text-white font-medium">Request Refill</h3>
              <p className="text-xs text-gray-500 mt-1">Running low? Request a new prescription.</p>
            </div>
          </div>
        </section>

        {/* ── Recent Labs ── */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="text-teal-400" size={20} /> Recent Lab Results
            </h2>
            <button className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>
          
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
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}

