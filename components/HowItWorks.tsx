const steps = [
  {
    n: "01",
    title: "Capture",
    desc: "VEQ observes work as it happens — meetings, documents, tasks, decisions — without adding extra steps.",
  },
  {
    n: "02",
    title: "Organize",
    desc: "Everything is structured into a clear, searchable record: who did what, where, and why.",
  },
  {
    n: "03",
    title: "Understand",
    desc: "VEQ connects the dots between people, projects, and decisions to form real context, not just files.",
  },
  {
    n: "04",
    title: "Continue",
    desc: "The next person picks up exactly where the last one left off, guided step by step.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-28 border-t hairline">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-3 text-center">
          How VEQ works
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-brown text-center mb-16 italic">
          Four steps, always in this order
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-brown/10 rounded-2xl overflow-hidden border hairline">
          {steps.map((s) => (
            <div key={s.n} className="bg-cream p-8">
              <span className="font-mono text-xs text-gold-deep">{s.n}</span>
              <h3 className="font-display text-xl text-brown mt-4 mb-2 italic">
                {s.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
