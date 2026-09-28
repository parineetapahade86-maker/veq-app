"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  PlayCircle,
  Calendar,
  CheckSquare,
  BookOpen,
  UserPlus,
  Brain,
  Network,
  MessageCircle,
  Ghost,
  Mic,
  TrendingUp,
  Zap,
  Activity,
  ShieldCheck,
  Plug,
  Users,
  LogOut,
  Mail,
  Settings,
  Webhook,
  ScrollText,
  Code, // ✅ NEW: Code icon imported safely
  CreditCard,
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
      { label: "My Work", href: "/dashboard/my-work", icon: Briefcase },
      { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
      { label: "Continuity Vault", href: "/dashboard/knowledge", icon: BookOpen },
    ],
  },
  {
    title: "Continuity",
    items: [
      { label: "Onboarding Portal", href: "/dashboard/onboarding-portal", icon: UserPlus },
      { label: "Exit Brain Dump", href: "/dashboard/exit-brain-dump", icon: Brain },
      { label: "Knowledge Graph", href: "/dashboard/brain-map", icon: Network },
      { label: "Reverse Handover", href: "/dashboard/reverse-handover", icon: MessageCircle },
      { label: "Chat with Ghost", href: "/dashboard/ghost-chat", icon: Ghost },
    ],
  },
  {
    title: "Intelligence & Ops",
    items: [
      { label: "Automations", href: "/dashboard/automations", icon: Zap },
      { label: "VEQ Autopilot", href: "/dashboard/autopilot", icon: Zap },
      { label: "Meeting Intelligence", href: "/dashboard/meeting-intelligence", icon: Mic },
      { label: "Knowledge Health", href: "/dashboard/knowledge-health", icon: Activity },
      { label: "Market Intelligence", href: "/dashboard/market-intelligence", icon: TrendingUp },
      { label: "CEO Dashboard", href: "/dashboard/ceo", icon: ShieldCheck, founderOnly: true },
    ],
  },
  {
    title: "Integrations",
    items: [
      { label: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
      { label: "Plugins", href: "/dashboard/plugins", icon: Plug },
      // ✅ NEW: Developer API Link Added Safely (Nothing Removed)
      { label: "Developer API", href: "/dashboard/developer", icon: Code },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Knowledge Carriers", href: "/dashboard/employees", icon: Users },
      { label: "HR Offboarding", href: "/dashboard/hr-offboarding", icon: LogOut },
      { label: "HR Email Composer", href: "/dashboard/hr-email-composer", icon: Mail },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
      // ✅ AUDIT LOGS ADDED HERE (NOTHING REMOVED, 100% SAFE)
      { label: "Audit Logs", href: "/dashboard/audit-logs", icon: ScrollText },
      // ✅ YE RAHA TUMHARA NAYA SECURITY & TRUST LINK! (100% SAFE ADDITION)
      { label: "Security & Trust", href: "/dashboard/security", icon: ShieldCheck },
      { label: "Pricing & Billing", href: "/dashboard/pricing", icon: CreditCard }, // (CreditCard import mat bhoolna lucide-react se!)
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const role = (user?.publicMetadata as { role?: string } | undefined)?.role;
  const isFounder = role === "founder";

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col shrink-0 border-r border-[#E9DED0] bg-[#F4EDE1] h-screen sticky top-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-[#E9DED0]">
        <span className="w-2 h-2 rounded-full bg-[#C6A15B]" />
        <span className="font-display text-lg tracking-tight text-[#3A2418]">
          VEQ
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
        {sections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.founderOnly || isFounder
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#806B58] px-3 mb-2">
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
                        ? "bg-[#3A2418] text-[#F4EDE1] shadow-sm"
                        : "text-[#806B58] hover:bg-[#3A2418]/5 hover:text-[#3A2418]"
                        }`}
                    >
                      <Icon
                        size={17}
                        className={active ? "text-[#C6A15B]" : "text-[#806B58] group-hover:text-[#3A2418]"}
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