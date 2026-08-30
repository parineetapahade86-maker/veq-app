import { User, Brain, Sparkles, FolderKanban, UserCheck } from "lucide-react";

const flow = [
  { icon: User, label: "Old employee", sub: "does the work" },
  { icon: Brain, label: "Work + knowledge", sub: "created along the way" },
  { icon: Sparkles, label: "VEQ", sub: "captures & connects it", brand: true },
  { icon: FolderKanban, label: "Organized knowledge", sub: "structured, searchable" },
  { icon: UserCheck, label: "New employee", sub: "continues, not restarts" },
];

export default function WhatIsVeq() {
  return (
    <section id="what-is-veq" className="px-6 py-28 border-t hairline">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-3 text-center">
          What is VEQ?
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-brown text-center mb-16 italic">
          Where the work goes, when the person does
        </h2>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 md:gap-2">
          {flow.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 md:gap-0 md:flex-col md:flex-1">
              <div className="flex md:flex-col items-center gap-4 md:gap-3 flex-1 md:flex-none">
                <div
                  className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border ${
                    step.brand
                      ? "bg-brown border-brown text-gold"
                      : "bg-cream-deep border-brown/10 text-brown"
                  }`}
                >
                  <step.icon size={22} />
                </div>
                <div className="md:text-center">
                  <p className="text-sm font-medium text-brown">{step.label}</p>
                  <p className="text-xs text-muted mt-0.5">{step.sub}</p>
                </div>
              </div>
              {i < flow.length - 1 && (
                <div className="hidden md:block flex-1 h-px bg-brown/15 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
