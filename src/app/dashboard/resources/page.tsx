import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BookOpen, PlayCircle, HelpCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export default async function ResourcesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const videos = [
    { id: 1, title: 'How to perform a Subcutaneous (SubQ) Injection', duration: '4:20', thumb: 'bg-surface-300' },
    { id: 2, title: 'Drawing medication from a multi-dose vial', duration: '2:15', thumb: 'bg-surface-300' },
    { id: 3, title: 'Intramuscular (IM) Injection Guide', duration: '5:45', thumb: 'bg-surface-300' },
  ];

  const faqs = [
    { q: 'What if I miss a dose?', a: 'If you miss a dose by 1 day, take it as soon as you remember. If it has been more than 2 days, skip the missed dose and resume your normal schedule. Do not double up.' },
    { q: 'Is it normal to feel soreness at the injection site?', a: 'Mild soreness for 24-48 hours is normal, especially when starting. Ensuring the alcohol has fully dried before injecting and rotating sites can help.' },
    { q: 'When should I get my next blood work done?', a: 'Blood work should typically be drawn in the morning, before your scheduled injection (the "trough"). Check your Labs page for your specific due date.' },
    { q: 'Can I travel with my medication?', a: 'Yes. Keep your medication in its original prescription box with your name on it. Check TSA guidelines for traveling with syringes.' },
  ];

  return (
    <div className="flex-1 min-h-screen bg-surface-0 relative pb-20">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-64 bg-glow opacity-60" />

      <div className="relative z-10 max-w-5xl mx-auto p-6 lg:p-10 space-y-8 animate-fade-up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="section-label mb-2 text-teal-400">Knowledge Base</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">TRT Resources & Guides</h1>
            <p className="text-gray-400 mt-1">Everything you need to know to safely manage your therapy.</p>
          </div>
        </div>

        {/* Video Tutorials */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <PlayCircle className="text-teal-400" size={20} /> Video Tutorials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((vid) => (
              <div key={vid.id} className="panel overflow-hidden group cursor-pointer hover:border-teal-500/50 transition-colors">
                <div className={`h-36 ${vid.thumb} relative flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <PlayCircle size={40} className="text-white/70 group-hover:text-white transition-colors relative z-10" />
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    {vid.duration}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-teal-400 transition-colors">{vid.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HelpCircle className="text-teal-400" size={20} /> Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="glass-panel p-5 group cursor-pointer [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between font-medium text-white outline-none">
                  {faq.q}
                  <span className="text-teal-400 group-open:rotate-180 transition-transform duration-300">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </summary>
                <div className="pt-4 mt-4 border-t border-white/5 text-sm text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Documents */}
        <section className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="text-teal-400" size={20} /> Clinic Documents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="panel p-4 flex items-center justify-between hover:bg-surface-200 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-teal-500/10 text-teal-400">
                  <FileText size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">Informed Consent</h4>
                  <p className="text-xs text-gray-500">Signed Oct 10, 2023</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-teal-400 uppercase">View</span>
            </div>
            <div className="panel p-4 flex items-center justify-between hover:bg-surface-200 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-teal-500/10 text-teal-400">
                  <FileText size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">Privacy Policy (HIPAA)</h4>
                  <p className="text-xs text-gray-500">Last updated Aug 2023</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-teal-400 uppercase">View</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
