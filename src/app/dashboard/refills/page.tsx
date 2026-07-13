import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Package, Truck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function RefillsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  // Mocked shipping stages
  const shippingStages = [
    { title: 'Prescription Sent', date: 'Oct 15, 2023 10:00 AM', status: 'completed' },
    { title: 'Pharmacy Processing', date: 'Oct 16, 2023 09:30 AM', status: 'completed' },
    { title: 'Shipped', date: 'Oct 17, 2023 02:15 PM', status: 'current', tracking: '1Z9999999999999999' },
    { title: 'Delivered', date: 'Expected Oct 19', status: 'upcoming' },
  ];

  return (
    <div className="flex-1 min-h-screen bg-surface-0 relative pb-20">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-64 bg-glow opacity-60" />

      <div className="relative z-10 max-w-5xl mx-auto p-6 lg:p-10 space-y-8 animate-fade-up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="section-label mb-2 text-teal-400">Pharmacy & Delivery</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">Prescriptions & Refills</h1>
            <p className="text-gray-400 mt-1">Manage your active protocols and track shipments.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Prescription Details */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Package className="text-teal-400" size={20} /> Current Fulfillment
              </h2>
              <div className="panel p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold mb-2 border border-teal-500/20">
                      <CheckCircle2 size={12} /> Active
                    </div>
                    <h3 className="text-lg font-bold text-white">Testosterone Cypionate 200mg/mL</h3>
                    <p className="text-sm text-gray-400 mt-1">10mL multi-dose vial. Take 100mg (0.5mL) twice weekly.</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Prescriber</p>
                    <p className="text-sm text-white">Dr. Sarah Mitchell, MD</p>
                  </div>
                </div>

                {/* Shipping Timeline */}
                <div className="relative pl-4 space-y-8">
                  {/* Vertical Line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-surface-300"></div>

                  {shippingStages.map((stage, i) => (
                    <div key={i} className="relative flex items-start gap-4">
                      {/* Node indicator */}
                      <div className={`absolute -left-[23px] mt-1 w-5 h-5 rounded-full flex items-center justify-center border-2
                        ${stage.status === 'completed' ? 'bg-teal-500 border-teal-500' : 
                          stage.status === 'current' ? 'bg-surface-0 border-teal-400' : 'bg-surface-0 border-surface-300'}
                      `}>
                        {stage.status === 'completed' && <CheckCircle2 size={12} className="text-surface-0" />}
                        {stage.status === 'current' && <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />}
                      </div>
                      
                      <div className="flex-1 -mt-0.5">
                        <h4 className={`font-semibold ${stage.status === 'upcoming' ? 'text-gray-500' : 'text-white'}`}>{stage.title}</h4>
                        <p className={`text-sm mt-0.5 ${stage.status === 'upcoming' ? 'text-gray-600' : 'text-gray-400'}`}>{stage.date}</p>
                        
                        {stage.tracking && (
                          <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-teal-500/10 border border-teal-500/20 rounded-md text-sm text-teal-400 cursor-pointer hover:bg-teal-500/20 transition-colors">
                            <Truck size={14} /> Tracking: {stage.tracking}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertCircle className="text-teal-400" size={20} /> Need Assistance?
              </h2>
              <div className="glass-panel p-6 space-y-4">
                <h3 className="text-white font-medium">Request Early Refill</h3>
                <p className="text-sm text-gray-400">Lost or damaged medication? You can request an early refill subject to physician approval.</p>
                
                <form className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</label>
                    <select className="mt-1 w-full bg-surface-200 border border-surface-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors">
                      <option>Lost medication</option>
                      <option>Damaged/Spilled vial</option>
                      <option>Traveling/Vacation</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Explanation</label>
                    <textarea 
                      className="mt-1 w-full bg-surface-200 border border-surface-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors"
                      rows={2}
                    ></textarea>
                  </div>
                  <button type="button" className="w-full btn-primary py-2 text-sm">
                    Submit Request
                  </button>
                </form>
              </div>
            </section>

            <div className="glass-panel p-5 border-t-2 border-t-teal-500 flex items-start gap-4">
              <Clock className="text-teal-400 shrink-0" />
              <div>
                <h4 className="text-white font-medium text-sm">Auto-Refill Enrolled</h4>
                <p className="text-xs text-gray-400 mt-1">Your next standard refill will automatically process on Nov 15, 2023.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
