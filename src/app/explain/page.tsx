import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Activity, Heart, Shield } from 'lucide-react';

export default function ExplainPage() {
  return (
    <div className="min-h-screen bg-surface-0 text-white pb-20">
      {/* Header */}
      <div className="bg-surface-100/50 border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <div className="font-semibold text-teal-400 flex items-center gap-2">
            <Activity size={18} /> TRT Portal
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-12 space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
        
        {/* Intro */}
        <section className="space-y-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Understanding <span className="text-teal-400">TRT</span></h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Testosterone Replacement Therapy (TRT) is a medical treatment for individuals with symptomatic low testosterone. 
            This guide will help you understand the basics, the benefits, and how to track your progress.
          </p>
        </section>

        {/* What is TRT */}
        <section className="glass-panel p-8 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-teal-500/10">
            <Activity size={120} />
          </div>
          <h2 className="text-2xl font-semibold flex items-center gap-3 relative z-10">
            <Heart className="text-teal-400" /> What is TRT?
          </h2>
          <p className="text-gray-300 leading-relaxed relative z-10">
            Testosterone is a crucial hormone responsible for muscle mass, bone density, red blood cell production, and overall well-being.
            When your body stops producing enough, it can lead to fatigue, depression, and loss of physical strength. 
            TRT aims to restore your testosterone to healthy, optimal levels through carefully managed doses.
          </p>
        </section>

        {/* Benefits & Expectations */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <Shield className="text-teal-400" /> Benefits & Expectations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Increased energy and reduced fatigue",
              "Improved mood and cognitive function",
              "Enhanced muscle mass and strength",
              "Better bone density",
              "Improved libido and sexual function",
              "Cardiovascular health support"
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-surface-100 border border-surface-200">
                <CheckCircle2 className="text-teal-400 shrink-0 mt-0.5" size={18} />
                <span className="text-gray-300 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Tracking Your Health */}
        <section className="glass-panel p-8 space-y-6">
          <h2 className="text-2xl font-semibold">How We Track Your Health</h2>
          <p className="text-gray-300 leading-relaxed">
            Safety and optimization are our top priorities. Once you login to the portal, you will be able to monitor:
          </p>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></div>
              <div>
                <strong className="text-white block mb-1">Blood Markers</strong>
                <span className="text-sm text-gray-400">Regular labs checking Total/Free T, Estradiol, Hematocrit, and Lipids to ensure you remain in a healthy range.</span>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></div>
              <div>
                <strong className="text-white block mb-1">Dosing Protocols</strong>
                <span className="text-sm text-gray-400">View your exact prescription, injection frequency, and reminders for your next dose.</span>
              </div>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="text-center pt-8 border-t border-white/5">
          <h2 className="text-2xl font-semibold mb-6">Ready to take control?</h2>
          <Link href="/" className="btn-primary">
            Go to Login
          </Link>
        </section>

      </div>
    </div>
  );
}
