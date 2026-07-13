import Link from 'next/link';
import { 
  ShieldCheck, 
  Activity, 
  ChevronRight, 
  CheckCircle2, 
  Zap, 
  Brain, 
  Dumbbell, 
  Bed,
  Stethoscope,
  TestTube,
  ClipboardList,
  LineChart,
  User,
  Quote
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Reclaim Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-200">Energy, Strength,</span><br className="hidden md:block"/> and Vitality
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Medically supervised Testosterone Replacement Therapy tailored to your unique biology. Experience peak performance with FDA-approved protocols and ongoing expert monitoring.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-teal-500 hover:bg-teal-400 text-white font-semibold text-lg transition-all shadow-lg shadow-teal-500/20 hover:scale-105">
            Get Started
            <ChevronRight size={20} />
          </Link>
          <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-surface-400 hover:border-surface-300 hover:bg-surface-200 text-white font-semibold text-lg transition-all">
            Log In
          </Link>
        </div>
        
        {/* Trust Badges */}
        <div className="pt-16 flex flex-wrap justify-center gap-8 md:gap-12 opacity-70">
          <div className="flex items-center gap-2 text-sm font-medium tracking-wide uppercase text-gray-400">
            <ShieldCheck className="text-teal-500" size={20} /> HIPAA Compliant
          </div>
          <div className="flex items-center gap-2 text-sm font-medium tracking-wide uppercase text-gray-400">
            <Stethoscope className="text-teal-500" size={20} /> Licensed Physicians
          </div>
          <div className="flex items-center gap-2 text-sm font-medium tracking-wide uppercase text-gray-400">
            <CheckCircle2 className="text-teal-500" size={20} /> FDA-Approved Protocols
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-20 bg-surface-100 border-y border-white/5 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/5">
          <div className="flex flex-col items-center text-center px-4 py-4 md:py-0">
            <div className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter">40%+</div>
            <p className="text-teal-400 font-medium mb-1">[STAT]</p>
            <p className="text-sm text-gray-400 leading-snug">of men over 45 have low testosterone <br/><span className="text-[10px] opacity-50">[SOURCE]</span></p>
          </div>
          <div className="flex flex-col items-center text-center px-4 py-4 md:py-0">
            <div className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter">90%</div>
            <p className="text-teal-400 font-medium mb-1">[STAT]</p>
            <p className="text-sm text-gray-400 leading-snug">of patients report improved energy within 6 weeks <br/><span className="text-[10px] opacity-50">[SOURCE]</span></p>
          </div>
          <div className="flex flex-col items-center text-center px-4 py-4 md:py-0">
            <div className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter">10k+</div>
            <p className="text-teal-400 font-medium mb-1">[STAT]</p>
            <p className="text-sm text-gray-400 leading-snug">patients successfully treated <br/><span className="text-[10px] opacity-50">[SOURCE]</span></p>
          </div>
          <div className="flex flex-col items-center text-center px-4 py-4 md:py-0">
            <div className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter">48h</div>
            <p className="text-teal-400 font-medium mb-1">[STAT]</p>
            <p className="text-sm text-gray-400 leading-snug">average lab-to-treatment time <br/><span className="text-[10px] opacity-50">[SOURCE]</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: 1, title: 'Free Hormone Panel', desc: 'Get a comprehensive blood test at a local lab to check your baseline hormone levels.', icon: TestTube },
    { num: 2, title: 'Doctor Consultation', desc: 'Review your results via telehealth with a licensed physician specializing in TRT.', icon: Stethoscope },
    { num: 3, title: 'Personalized Plan', desc: 'Receive a tailored treatment protocol shipped directly and discreetly to your door.', icon: ClipboardList },
    { num: 4, title: 'Ongoing Monitoring', desc: 'Regular lab work and follow-ups ensure your levels remain optimal and safe.', icon: LineChart },
  ];

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">A seamless, data-driven process designed to get you back to your best safely and efficiently.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Desktop connecting line */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-surface-300 via-teal-500/50 to-surface-300 -z-10" />
          
          {steps.map((step) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-surface-100 border-2 border-surface-300 flex items-center justify-center mb-6 shadow-xl relative z-10 group hover:border-teal-500 hover:bg-surface-200 transition-colors">
                <step.icon className="text-teal-400 w-10 h-10 group-hover:scale-110 transition-transform" />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {step.num}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed px-4">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  return (
    <section className="py-24 px-6 bg-surface-100/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Impact of TRT</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">See how optimizing your testosterone levels transforms your daily life.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          {/* Untreated Side */}
          <div className="bg-surface-200 p-8 md:p-12 space-y-8">
            <h3 className="text-2xl font-bold text-gray-300 border-b border-white/5 pb-4">Untreated Low T</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <Zap className="text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Chronic Fatigue</h4>
                  <p className="text-sm text-gray-400">Constant lethargy and reliance on caffeine just to get through the day.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Brain className="text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Brain Fog & Mood Drops</h4>
                  <p className="text-sm text-gray-400">Difficulty focusing, irritability, and a general lack of motivation.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Dumbbell className="text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Muscle Loss & Fat Gain</h4>
                  <p className="text-sm text-gray-400">Working out yields minimal results while stubborn belly fat increases.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Bed className="text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Poor Sleep Quality</h4>
                  <p className="text-sm text-gray-400">Restless nights leading to poor recovery and compounding fatigue.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* On TRT Side */}
          <div className="bg-gradient-to-br from-teal-900/40 to-surface-100 p-8 md:p-12 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-[80px] -z-10 rounded-full" />
            <h3 className="text-2xl font-bold text-teal-400 border-b border-white/10 pb-4">On Optimized TRT</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <Zap className="text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Sustained Energy</h4>
                  <p className="text-sm text-gray-300">Wake up refreshed and maintain steady, clean energy throughout the day.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Brain className="text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Mental Clarity & Drive</h4>
                  <p className="text-sm text-gray-300">Sharper focus, stabilized mood, and a renewed sense of ambition.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Dumbbell className="text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Lean Muscle Retention</h4>
                  <p className="text-sm text-gray-300">Your workouts finally pay off with improved strength and fat loss.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Bed className="text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Deep, Restorative Sleep</h4>
                  <p className="text-sm text-gray-300">Experience high-quality REM sleep that optimizes your body's recovery.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { name: "[Patient Name 1]", quote: "[Placeholder for actual patient testimonial detailing their positive experience with energy levels and clinic support.]", age: "42" },
    { name: "[Patient Name 2]", quote: "[Placeholder for actual patient testimonial focusing on ease of process, lab transparency, and muscle recovery.]", age: "51" },
    { name: "[Patient Name 3]", quote: "[Placeholder for actual patient testimonial describing life before and after starting treatment, emphasizing mood improvements.]", age: "47" }
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-teal-500/5 blur-[100px] -z-10 rounded-full" />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Patient Success Stories</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Real results from men who decided to take control of their health.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="glass-panel p-8 relative group">
              <Quote className="absolute top-6 right-6 text-white/5 w-12 h-12" />
              <div className="flex gap-1 mb-6 text-teal-400">
                {[1, 2, 3, 4, 5].map(star => <span key={star}>★</span>)}
              </div>
              <p className="text-gray-300 mb-8 italic relative z-10 leading-relaxed">
                "{review.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-300 flex items-center justify-center text-gray-400">
                  <User size={18} />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{review.name}</h4>
                  <p className="text-teal-400/70 text-xs">Patient, Age {review.age}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-32 px-6 bg-surface-100 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-gradient-to-b from-teal-500/10 to-transparent blur-[80px] -z-10" />
      
      <div className="max-w-3xl mx-auto text-center relative z-10 space-y-8">
        <h2 className="text-4xl md:text-5xl font-black text-white">Ready to take control?</h2>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          Start your journey today with a comprehensive hormone panel and expert consultation.
        </p>
        <div className="flex flex-col items-center gap-4 pt-4">
          <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-full bg-teal-500 hover:bg-teal-400 text-white font-bold text-lg transition-all shadow-xl shadow-teal-500/20 hover:scale-105">
            Start Your Free Assessment
          </Link>
          <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors underline underline-offset-4">
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const session = await auth();

  // If already logged in, they can go straight to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-surface-0 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      <Hero />
      <StatsSection />
      <HowItWorks />
      <Comparison />
      <Testimonials />
      <FinalCTA />
    </main>
  );
}

