"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles, Users } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-32 px-6 overflow-hidden">
      {/* Enhanced Background Effects */}
      <div
        className="pointer-events-none absolute -top-24 right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.15] blur-3xl"
        style={{ background: "var(--gold)" }}
      />
      <div
        className="pointer-events-none absolute top-1/2 left-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.05] blur-3xl"
        style={{ background: "var(--brown)" }}
      />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--hairline)_1px,transparent_1px),linear-gradient(to_bottom,var(--hairline)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 opacity-40" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Top Badge with Animation */}
        <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-muted border hairline rounded-full px-4 py-1.5 mb-8 bg-cream/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <Sparkles size={14} className="text-gold animate-pulse" />
          AI-Powered Knowledge Continuity
        </div>

        {/* Main Headline */}
        <h1 className="font-display text-[2.6rem] leading-[1.08] sm:text-6xl md:text-7xl text-brown mb-7 tracking-tight">
          Knowledge that stays.
          <br />
          <span className="italic text-gold-deep">Work that continues.</span>
        </h1>

        {/* Manifesto Paragraph */}
        <p className="text-muted text-lg max-w-2xl mx-auto mb-11 leading-relaxed">
          <span className="text-brown font-medium">
            Knowledge Management is for files. Knowledge Continuity is for people.
          </span>
          <br className="hidden sm:block" />
          Stop losing your company's tribal knowledge when employees leave.
          VEQ captures the "how" and "why" of your work.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-2 bg-brown text-cream px-8 py-4 rounded-full text-sm font-medium hover:bg-black-rich transition-all shadow-lg shadow-brown/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            Try VEQ Free
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="#what-is-veq"
            className="group inline-flex items-center gap-2 text-brown text-sm font-medium border hairline bg-cream/30 hover:bg-cream px-6 py-3.5 rounded-full transition-all hover:border-gold/50"
          >
            Explore VEQ
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/*  FLOATING UI PREVIEW */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Preview Card */}
          <div className="relative bg-cream border hairline rounded-2xl p-6 shadow-2xl shadow-brown/10">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b hairline">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
              <div className="w-3 h-3 rounded-full bg-green-400/60" />
              <div className="flex-1 text-center">
                <span className="text-xs text-muted font-mono">VEQ Dashboard</span>
              </div>
            </div>

            {/* Mock Dashboard Content */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-3">
                <div className="h-20 bg-white/60 rounded-xl border hairline p-3">
                  <div className="h-3 w-32 bg-brown/10 rounded mb-2" />
                  <div className="h-2 w-full bg-brown/5 rounded" />
                  <div className="h-2 w-2/3 bg-brown/5 rounded mt-1" />
                </div>
                <div className="h-20 bg-white/60 rounded-xl border hairline p-3">
                  <div className="h-3 w-32 bg-brown/10 rounded mb-2" />
                  <div className="h-2 w-full bg-brown/5 rounded" />
                  <div className="h-2 w-2/3 bg-brown/5 rounded mt-1" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-16 bg-gold/10 rounded-xl border border-gold/20 p-3">
                  <div className="h-3 w-20 bg-gold/30 rounded mb-2" />
                  <div className="h-2 w-full bg-gold/20 rounded" />
                </div>
                <div className="h-24 bg-white/60 rounded-xl border hairline p-3">
                  <div className="h-3 w-24 bg-brown/10 rounded mb-2" />
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-brown/5 rounded" />
                    <div className="h-2 w-3/4 bg-brown/5 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Badge 1 */}
          <div className="absolute -left-4 top-1/4 bg-white border hairline rounded-xl p-3 shadow-xl animate-[float_6s_ease-in-out_infinite]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                <Sparkles size={14} className="text-gold-deep" />
              </div>
              <div>
                <p className="text-xs font-semibold text-brown">AI Capture</p>
                <p className="text-[10px] text-muted">Auto-organized</p>
              </div>
            </div>
          </div>

          {/* Floating Badge 2 */}
          <div className="absolute -right-4 bottom-1/4 bg-white border hairline rounded-xl p-3 shadow-xl animate-[float_7s_ease-in-out_infinite_1s]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brown/10 flex items-center justify-center">
                <Users size={14} className="text-brown" />
              </div>
              <div>
                <p className="text-xs font-semibold text-brown">Team Sync</p>
                <p className="text-[10px] text-muted">Real-time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-brown/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-brown/60 rounded-full" />
          </div>
        </div>
      </div>

      {/* Custom animation keyframes */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </section>
  );
}