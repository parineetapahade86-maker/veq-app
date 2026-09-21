import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FinalCta() {
  return (
    <section className="px-6 py-32 border-t hairline">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-display text-4xl md:text-5xl text-brown mb-6 italic">
          Don&apos;t let valuable knowledge walk away.
        </h2>
        <p className="text-muted mb-10">
          Every exit is a small institutional memory loss. VEQ makes sure it
          isn&apos;t.
        </p>
        <Link
          href="/sign-up"
          className="group inline-flex items-center gap-2 bg-brown text-cream px-8 py-4 rounded-full text-sm font-medium hover:bg-black-rich transition-colors"
        >
          Try VEQ
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  );
}
