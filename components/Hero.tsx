import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-40 pb-28 px-6 overflow-hidden">
      <div
        className="pointer-events-none absolute -top-24 right-[-10%] w-[560px] h-[560px] rounded-full opacity-[0.14] blur-3xl"
        style={{ background: "var(--gold)" }}
      />
      <div className="max-w-4xl mx-auto text-center relative">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-muted border hairline rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          AI-Powered Knowledge Continuity
        </span>

        <h1 className="font-display text-[2.6rem] leading-[1.08] sm:text-6xl md:text-7xl text-brown mb-7">
          Knowledge that stays.
          <br />
          <span className="italic text-muted">Work that continues.</span>
        </h1>

        <p className="text-muted text-lg max-w-xl mx-auto mb-11">
          When people leave, their context shouldn&apos;t. VEQ captures how
          the work actually got done — and hands it to whoever picks it up
          next.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-2 bg-brown text-cream px-7 py-3.5 rounded-full text-sm font-medium hover:bg-black-rich transition-colors"
          >
            Try VEQ
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <a
            href="#what-is-veq"
            className="inline-flex items-center gap-1.5 text-brown text-sm border-b border-brown/30 hover:border-gold-deep pb-0.5 transition-colors"
          >
            Explore VEQ
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
