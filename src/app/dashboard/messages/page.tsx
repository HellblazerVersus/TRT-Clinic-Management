import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MessageSquare, Video, Calendar, Send, Info } from 'lucide-react';

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  // Mocked messages
  const messages = [
    { id: 1, sender: 'Clinic', text: 'Welcome to TRT Clinic! Please let us know if you have any questions about your new protocol.', time: 'Oct 12, 10:00 AM', isPatient: false },
    { id: 2, sender: 'You', text: 'Thank you. The first injection went well. No issues.', time: 'Oct 13, 08:30 AM', isPatient: true },
    { id: 3, sender: 'Dr. Sarah Mitchell', text: 'Great to hear! Make sure to log your weekly symptoms on the Labs page.', time: 'Oct 13, 11:45 AM', isPatient: false },
  ];

  return (
    <div className="flex-1 min-h-screen bg-surface-0 relative pb-20 overflow-hidden">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-64 bg-glow opacity-60" />

      <div className="relative z-10 max-w-5xl mx-auto p-6 lg:p-10 space-y-8 animate-fade-up h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
          <div>
            <p className="section-label mb-2 text-teal-400">Communication</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">Messages & Telehealth</h1>
            <p className="text-gray-400 mt-1">Connect securely with your clinical team.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          
          {/* Chat Interface */}
          <div className="flex-1 glass-panel flex flex-col min-h-0">
            {/* Chat Header */}
            <div className="p-4 border-b border-surface-300 flex items-center justify-between bg-surface-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-white font-medium">Care Team</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Online
                  </p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Info size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isPatient ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl p-4 ${msg.isPatient ? 'bg-teal-600 text-white rounded-tr-sm' : 'bg-surface-200 text-gray-200 rounded-tl-sm border border-surface-300'}`}>
                    {!msg.isPatient && <p className="text-xs font-semibold text-teal-300 mb-1">{msg.sender}</p>}
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-2 ${msg.isPatient ? 'text-teal-200' : 'text-gray-500'} text-right`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-surface-300 bg-surface-200/30">
              <div className="relative">
                <textarea 
                  className="w-full bg-surface-300 border border-surface-400 rounded-2xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors resize-none"
                  rows={2}
                  placeholder="Type a secure message to your care team..."
                ></textarea>
                <button className="absolute right-3 bottom-3 p-2 rounded-xl bg-teal-500 text-white hover:bg-teal-400 transition-colors">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Telehealth Sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-6 overflow-y-auto">
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Video size={18} className="text-teal-400" /> Next Appointment
              </h2>
              <div className="panel p-5 text-center">
                <div className="w-16 h-16 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto mb-4 border-2 border-teal-500/20">
                  <Calendar size={28} />
                </div>
                <h3 className="text-white font-semibold">Follow-up Consultation</h3>
                <p className="text-sm text-gray-400 mt-1">Dr. Sarah Mitchell, MD</p>
                
                <div className="my-4 py-3 border-y border-white/5 space-y-1">
                  <p className="text-teal-400 font-medium">Nov 2, 2023</p>
                  <p className="text-sm text-gray-400">10:30 AM EST (30 mins)</p>
                </div>
                
                <button className="w-full btn-primary py-2 text-sm opacity-50 cursor-not-allowed">
                  Join Video Call
                </button>
                <p className="text-[10px] text-gray-500 mt-2">Button will activate 10 minutes before.</p>
              </div>
            </section>

            <section>
              <div className="glass-panel p-5 border-l-2 border-l-teal-500">
                <h3 className="text-sm font-semibold text-white mb-1">Book an Appointment</h3>
                <p className="text-xs text-gray-400 mb-3">Need to discuss your protocol sooner? Schedule a 15-minute check-in.</p>
                <button className="text-xs font-medium text-teal-400 hover:text-teal-300">
                  View Availability &rarr;
                </button>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
