const steps = [
  { title: "Sign up your team", desc: "Create a VEQ workspace and add the people whose work matters." },
  { title: "Connect what you already use", desc: "Link meetings, documents, and calendars — VEQ works alongside your tools." },
  { title: "Let VEQ run in the background", desc: "It quietly organizes work into context as your team operates normally." },
  { title: "Someone leaves", desc: "VEQ has already preserved their meetings, decisions, and open work." },
  { title: "The next person continues", desc: "New hires ask VEQ where things stand and pick up immediately." },
];

export default function HowToUse() {
  return (
    <section className="px-6 py-28 bg-cream-deep/60 border-t hairline">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-3 text-center">
          How to use VEQ
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-brown text-center mb-16 italic">
          From first login to seamless handover
        </h2>

        <ol className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-brown/15" />
          {steps.map((s, i) => (
            <li key={s.title} className="relative flex gap-6 pb-10 last:pb-0">
              <div className="shrink-0 w-8 h-8 rounded-full bg-brown text-cream text-xs font-mono flex items-center justify-center z-10">
                {i + 1}
              </div>
              <div className="pt-0.5">
                <h3 className="text-brown font-medium mb-1">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
