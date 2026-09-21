import type { LucideIcon } from "lucide-react";

export default function PlaceholderPage({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
        {eyebrow}
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
        {title}
      </h1>
      <p className="text-muted max-w-xl mb-12">{description}</p>

      <div className="rounded-2xl border hairline border-dashed bg-cream-deep/30 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-xl bg-brown/5 flex items-center justify-center mb-4">
          <Icon size={22} className="text-gold-deep" />
        </div>
        <p className="text-sm text-muted">
          This section is coming soon — it&apos;ll connect once the VEQ
          backend is wired up.
        </p>
      </div>
    </section>
  );
}
