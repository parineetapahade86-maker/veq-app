"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Video,
  PlayCircle,
  Calendar,
  CheckSquare,
  ClipboardList,
  BookOpen,
  Plug,
  Users,
  Settings,
  ShieldCheck,
  Brain,
  UserPlus,
  Network,
  MessageCircle,
  Ghost,
  Activity,
  Zap,
  TrendingUp,
  Mic,
  Mail,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  founderOnly?: boolean;
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
      { label: "Team Control", href: "/dashboard/team", icon: ShieldCheck, founderOnly: true },
      { label: "My Work", href: "/dashboard/my-work", icon: Briefcase },
      { label: "My Handover Tasks", href: "/dashboard/my-handover-tasks", icon: ClipboardList },
      { label: "Meetings", href: "/dashboard/meetings", icon: Video },
      { label: "Videos", href: "/dashboard/videos", icon: PlayCircle },
      { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
      { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
      { label: "Continuity Vault", href: "/dashboard/knowledge", icon: BookOpen },
      { label: "Continuity Onboarding", href: "/dashboard/onboarding-portal", icon: UserPlus },
      { label: "Continuity Handover", href: "/dashboard/exit-brain-dump", icon: Brain },
      { label: "Knowledge Graph", href: "/dashboard/brain-map", icon: Network },
      { label: "Reverse Handover", href: "/dashboard/reverse-handover", icon: MessageCircle },
      { label: "Chat with Ghost", href: "/dashboard/ghost-chat", icon: Ghost },
      { label: "Meeting Intelligence", href: "/dashboard/meeting-intelligence", icon: Mic },
    ],
  },
  {
    title: "Intelligence & Ops",
    items: [
      { label: "Market Intelligence", href: "/dashboard/market-intelligence", icon: TrendingUp }, // ✅ ICON FIX
      { label: "VEQ Autopilot", href: "/dashboard/autopilot", icon: Zap },
      { label: "Knowledge Health", href: "/dashboard/knowledge-health", icon: Activity },
      { label: "CEO Dashboard", href: "/dashboard/ceo", icon: TrendingUp, founderOnly: true },
    ],
  },
  {
    title: "Integrations",
    items: [{ label: "Plugins", href: "/dashboard/plugins", icon: Plug }],
  },
  {
    title: "People",
    items: [
      { label: "Knowledge Carriers", href: "/dashboard/employees", icon: Users },
      { label: "HR Offboarding", href: "/dashboard/hr-offboarding", icon: LogOut },
      { label: "HR Email Composer", href: "/dashboard/hr-email-composer", icon: Mail }, // ✅ SIRF YAHAN (People mein)
    ],
  },
  {
    title: "System",
    items: [{ label: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const role = (user?.publicMetadata as { role?: string } | undefined)?.role;
  const isFounder = role === "founder";

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col shrink-0 border-r hairline bg-cream-deep/40 h-screen sticky top-0">
      <div className="h-16 flex items-center gap-2.5 px-6 border-b hairline">
        <span className="w-2 h-2 rounded-full bg-gold" />
        <span className="font-display text-lg tracking-tight text-brown">
          VEQ
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-7">
        {sections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.founderOnly || isFounder
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted px-3 mb-2">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
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
          );
        })}
      </nav>
    </aside>
  );
}