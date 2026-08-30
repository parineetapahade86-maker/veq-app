"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Video,
  FileText,
  PlayCircle,
  Calendar,
  CheckSquare,
  BookOpen,
  Sparkles,
  Plug,
  Users,
  Settings,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: LucideIcon };

const items: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Work", href: "/dashboard/my-work", icon: Briefcase },
  { label: "Meetings", href: "/dashboard/meetings", icon: Video },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Videos", href: "/dashboard/videos", icon: PlayCircle },
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "Knowledge", href: "/dashboard/knowledge", icon: BookOpen },
  { label: "AI Guide", href: "/dashboard/ai-guide", icon: Sparkles },
  { label: "Plugins", href: "/dashboard/plugins", icon: Plug },
  { label: "Employees", href: "/dashboard/employees", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="text-brown"
      >
        <Menu size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black-rich/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-72 bg-cream h-full overflow-y-auto p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6 px-2">
              <span className="font-display text-lg text-brown">VEQ</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={20} className="text-brown" />
              </button>
            </div>
            <nav className="space-y-0.5">
              {items.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                      active
                        ? "bg-brown text-cream"
                        : "text-brown/70 hover:bg-brown/5"
                    }`}
                  >
                    <Icon size={17} className={active ? "text-gold" : "text-muted"} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
