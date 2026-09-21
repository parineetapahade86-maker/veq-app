import { X, Check } from "lucide-react";

const without = [
  "New hire starts from zero",
  "Senior teammates re-explain everything",
  "Decisions get re-litigated, reasoning lost",
  "Documents scattered, context missing",
];

const withVeq = [
  "New hire continues from where work left off",
  "Team stays heads-down on new work",
  "Every decision keeps its reasoning attached",
  "One organized record of how work happens",
];

export default function WhyVeq() {
  return (
    <section id="why-veq" className="px-6 py-28 bg-black-rich text-cream">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-gold mb-3 text-center">
          Why VEQ?
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-center mb-16 italic">
          The cost of a departure, with and without VEQ
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 p-8">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-deep mb-6">
              Without VEQ
            </p>
            <ul className="space-y-4">
              {without.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-cream/80">
                  <X size={16} className="text-muted-deep mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-gold/30 bg-gold/[0.05] p-8">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-gold mb-6">
              With VEQ
            </p>
            <ul className="space-y-4">
              {withVeq.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-cream">
                  <Check size={16} className="text-gold mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
