"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: "Workspace",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Work", href: "/dashboard/my-work", icon: Briefcase },
      { label: "Meetings", href: "/dashboard/meetings", icon: Video },
      { label: "Documents", href: "/dashboard/documents", icon: FileText },
      { label: "Videos", href: "/dashboard/videos", icon: PlayCircle },
      { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
      { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
      { label: "Knowledge", href: "/dashboard/knowledge", icon: BookOpen },
      { label: "AI Guide", href: "/dashboard/ai-guide", icon: Sparkles },
    ],
  },
  {
    title: "Integrations",
    items: [{ label: "Plugins", href: "/dashboard/plugins", icon: Plug }],
  },
  {
    title: "People",
    items: [{ label: "Employees", href: "/dashboard/employees", icon: Users }],
  },
  {
    title: "System",
    items: [{ label: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col shrink-0 border-r hairline bg-cream-deep/40 h-screen sticky top-0">
      <div className="h-16 flex items-center gap-2.5 px-6 border-b hairline">
        <span className="w-2 h-2 rounded-full bg-gold" />
        <span className="font-display text-lg tracking-tight text-brown">
          VEQ
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-7">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted px-3 mb-2">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active
                      ? "bg-brown text-cream shadow-sm"
                      : "text-brown/70 hover:bg-brown/5 hover:text-brown"
                      }`}
                  >
                    <Icon
                      size={17}
                      className={active ? "text-gold" : "text-muted group-hover:text-brown"}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}