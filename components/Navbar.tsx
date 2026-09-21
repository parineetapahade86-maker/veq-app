"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "What is VEQ", href: "#what-is-veq" },
  { label: "Why VEQ", href: "#why-veq" },
  { label: "How it works", href: "#how-it-works" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-cream/85 backdrop-blur-md border-b hairline">
      <nav className="max-w-6xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-gold" />
          <span className="font-display text-xl tracking-tight text-brown">
            VEQ
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted hover:text-brown transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-brown hover:text-gold-deep transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-brown text-cream px-5 py-2.5 rounded-full hover:bg-black-rich transition-colors"
          >
            Try VEQ
          </Link>
        </div>

        <button
          className="md:hidden text-brown"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t hairline bg-cream px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm text-muted"
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2">
            <Link href="/sign-in" className="text-sm text-brown">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-brown text-cream px-5 py-2.5 rounded-full text-center"
            >
              Try VEQ
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
