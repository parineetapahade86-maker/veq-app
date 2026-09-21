import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t hairline bg-cream-deep/40 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Left: Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold" />
              <span className="font-display text-lg tracking-tight text-brown">
                VEQ
              </span>
            </div>
            <p className="text-xs text-muted font-mono">
              Knowledge that stays. Work that continues.
            </p>
          </div>

          {/* Center: Legal Links */}
          <div className="flex items-center gap-8 text-sm font-mono text-muted">
            <Link href="/privacy" className="hover:text-brown transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-brown transition-colors">
              Terms of Service
            </Link>
          </div>

          {/* Right: Copyright */}
          <p className="text-xs text-muted font-mono">
            © {new Date().getFullYear()} VEQ. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}