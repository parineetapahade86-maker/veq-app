// app/dashboard/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Activity, AlertTriangle, Zap } from "lucide-react";
import AIBuddy from "@/components/AIBuddy";
import ActivityFeed from "@/components/ActivityFeed";
import AgentInbox from "@/components/AgentInbox";
// ✅ ADDITION 1: Import the new AI Gap Detector Widget
import KnowledgeGapWidget from "@/components/KnowledgeGapWidget";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  // 1. Check the user
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const name =
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "there";

  const supabase = getSupabase();

  let activeTasks = 0;
  let meetingsThisWeek = 0;
  let knowledgeItemsCount = 0; // Renamed slightly to avoid conflict with array
  let hasCompletedOnboarding = false;
  let companyName = "Your Company";
  let companyId: string | null = null;

  // NEW: State to hold predictive risk alerts
  let riskAlerts: any[] = [];
  // ✅ ADDITION 2: State to hold actual knowledge items for the AI Scanner
  let actualKnowledgeItems: any[] = [];

  if (supabase) {
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("company_id, has_completed_onboarding")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    // If no profile exists, redirect to onboarding
    if (!profile) {
      console.log("No profile found for user, redirecting to onboarding...");
      redirect("/onboarding");
    }

    companyId = profile.company_id;
    hasCompletedOnboarding = profile.has_completed_onboarding ?? false;

    // Fetch counts, company name, and risk alerts only if companyId exists
    if (companyId) {
      const { data: companyData } = await supabase
        .from("companies")
        .select("name")
        .eq("id", companyId)
        .single();

      if (companyData?.name) {
        companyName = companyData.name;
      }

      // Fetch dashboard metrics in parallel
      const [tasksResult, meetingsResult, docsResult, alertsResult, knowledgeItemsResult] = await Promise.all([
        supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("company_id", companyId)
          .eq("status", "pending"),

        supabase
          .from("meetings")
          .select("*", { count: "exact", head: true })
          .eq("company_id", companyId),

        supabase
          .from("knowledge_items")
          .select("*", { count: "exact", head: true })
          .eq("company_id", companyId),

        // NEW: Fetch top Critical/Medium risk alerts for this company
        supabase
          .from("knowledge_risk_alerts")
          .select("user_name, risk_level, risk_score, reason")
          .eq("company_id", companyId)
          .in("risk_level", ["Critical", "Medium"])
          .order("risk_score", { ascending: false })
          .limit(1),

        // ✅ ADDITION 3: Fetch actual items (source_reference, content, metadata) for the AI Gap Scanner
        supabase
          .from("knowledge_items")
          .select("source_reference, content, metadata")
          .eq("company_id", companyId)
      ]);

      activeTasks = tasksResult.count ?? 0;
      meetingsThisWeek = meetingsResult.count ?? 0;
      knowledgeItemsCount = docsResult.count ?? 0;
      riskAlerts = alertsResult.data || [];
      actualKnowledgeItems = knowledgeItemsResult.data || []; // ✅ Store for the widget

      console.log("📊 Dashboard Data Live:", {
        activeTasks,
        meetingsThisWeek,
        knowledgeItemsCount,
        companyId,
        companyName,
        hasRisk: riskAlerts.length > 0,
        itemsScanned: actualKnowledgeItems.length
      });
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 md:py-24 relative">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
        Workspace · Overview
      </p>

      <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
        Welcome, {name}.
      </h1>

      <p className="text-muted max-w-xl mb-12">
        Your real-time workspace summary. Here is what you have been working on at {companyName}.
      </p>

      {/* ✅ EXISTING: AI PREDICTIVE RISK ALERT (With Action Button) */}
      {riskAlerts.length > 0 && (
        <div className="mb-8 p-6 rounded-2xl border-2 border-red-200 bg-red-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-full shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-display text-xl text-brown italic mb-1">
                Predictive Knowledge Risk Detected
              </h3>
              <p className="text-sm text-muted max-w-lg">
                VEQ AI identified that <span className="font-semibold text-brown">{riskAlerts[0].user_name}</span> holds critical knowledge with dropping activity.
                <span className="block mt-1 text-red-600 font-medium">Action Recommended: Initiate knowledge capture.</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/dashboard/knowledge-health"
              className="px-5 py-2.5 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold shadow-sm"
            >
              View Risk Radar
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={`/dashboard/exit-brain-dump?trigger=risk&user=${riskAlerts[0].user_name}`}
              className="px-5 py-2.5 border-2 border-brown text-brown bg-white rounded-xl hover:bg-brown/5 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold"
            >
              Auto-Generate Handover
              <Zap className="w-4 h-4 text-brown" />
            </Link>
          </div>
        </div>
      )}

      {/* GETTING STARTED CHECKLIST */}
      {!hasCompletedOnboarding && (
        <div className="mb-12 p-6 md:p-8 rounded-2xl border-2 border-dashed border-gold/40 bg-gold/5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl text-brown italic mb-2">
                Let's get your workspace ready!
              </h2>
              <p className="text-muted font-mono text-sm">
                Complete these quick steps to unlock the full power of VEQ.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="px-6 py-3 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold whitespace-nowrap shadow-sm"
            >
              Complete Setup
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-cream rounded-xl border hairline">
              <div className="w-6 h-6 rounded-full border-2 border-muted flex items-center justify-center text-xs font-bold text-muted">
                1
              </div>
              <span className="text-sm text-brown font-medium">Setup Company Profile</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-cream rounded-xl border hairline opacity-60">
              <div className="w-6 h-6 rounded-full border-2 border-muted flex items-center justify-center text-xs font-bold text-muted">
                2
              </div>
              <span className="text-sm text-brown font-medium">Invite Team Members</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-cream rounded-xl border hairline opacity-60">
              <div className="w-6 h-6 rounded-full border-2 border-muted flex items-center justify-center text-xs font-bold text-muted">
                3
              </div>
              <span className="text-sm text-brown font-medium">Create First Exit Brain Dump</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-cream rounded-xl border hairline opacity-60">
              <div className="w-6 h-6 rounded-full border-2 border-muted flex items-center justify-center text-xs font-bold text-muted">
                4
              </div>
              <span className="text-sm text-brown font-medium">Check Knowledge Risk</span>
            </div>
          </div>
        </div>
      )}

      {/* METRICS GRID */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border hairline bg-cream-deep/40 p-6 hover:border-gold/50 transition-colors">
          <p className="font-display text-3xl text-brown italic">{activeTasks}</p>
          <p className="text-xs text-muted mt-1 font-mono uppercase tracking-wide">
            Active tasks
          </p>
        </div>

        <div className="rounded-2xl border hairline bg-cream-deep/40 p-6 hover:border-gold/50 transition-colors">
          <p className="font-display text-3xl text-brown italic">
            {meetingsThisWeek}
          </p>
          <p className="text-xs text-muted mt-1 font-mono uppercase tracking-wide">
            Meetings logged
          </p>
        </div>

        <div className="rounded-2xl border hairline bg-cream-deep/40 p-6 hover:border-gold/50 transition-colors">
          <p className="font-display text-3xl text-brown italic">
            {knowledgeItemsCount}
          </p>
          <p className="text-xs text-muted mt-1 font-mono uppercase tracking-wide">
            Knowledge items
          </p>
        </div>
      </div>

      {/* ✅ ADDITION 4: THE NEW AI KNOWLEDGE GAP DETECTOR WIDGET */}
      <div className="mb-12">
        <KnowledgeGapWidget knowledgeItems={actualKnowledgeItems} />
      </div>

      {/* 🤖 AGENTIC AI: SELF-HEALING INBOX */}
      <AgentInbox companyId={companyId} />

      {/* RECENT ACTIVITY FEED SECTION */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-gold" />
          <h2 className="font-display text-2xl text-brown italic">Team Activity</h2>
        </div>
        <ActivityFeed />
      </div>

      {/* INTERNAL LINK TO LANDING PAGE */}
      <Link
        href="/knowledge-management-system"
        className="block mt-8 p-6 rounded-2xl border border-gold/40 bg-gold/5 hover:bg-gold/10 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl text-brown italic mb-1">
              Discover the Power of VEQ
            </h3>
            <p className="text-sm text-muted mb-3">
              Learn how our Knowledge Management System captures both Tacit and Explicit knowledge automatically.
            </p>
            <span className="text-xs font-mono text-gold font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              Read the Guide <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="hidden md:block w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-gold" />
          </div>
        </div>
      </Link>

      <AIBuddy />
    </section>
  );
}