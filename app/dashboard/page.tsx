import { currentUser } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase/server"; // 👈 matches your actual file
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // always fetch fresh counts, never cache this page

export default async function DashboardOverviewPage() {
  // 1. Check the user
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const name =
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "there";

  // 2. Get Supabase client
  const supabase = getSupabase();

  // Default values (0)
  let activeTasks = 0;
  let meetingsThisWeek = 0;
  let knowledgeItems = 0;

  // 3. If Supabase is connected, fetch the data
  if (supabase) {
    // Note: The Service Role key bypasses RLS, so we manually filter
    // by 'created_by' to make sure each user only sees their own data.

    const [tasksResult, meetingsResult, docsResult] = await Promise.all([
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("created_by", user.id),
      supabase
        .from("meetings")
        .select("*", { count: "exact", head: true })
        .eq("created_by", user.id),
      supabase
        .from("documents") // Change this to 'knowledge_items' if that's your table's actual name
        .select("*", { count: "exact", head: true })
        .eq("created_by", user.id),
    ]);

    if (tasksResult.error) console.error("Tasks count error:", tasksResult.error.message);
    if (meetingsResult.error) console.error("Meetings count error:", meetingsResult.error.message);
    if (docsResult.error) console.error("Docs count error:", docsResult.error.message);

    activeTasks = tasksResult.count ?? 0;
    meetingsThisWeek = meetingsResult.count ?? 0;
    knowledgeItems = docsResult.count ?? 0;
  } else {
    console.error("Supabase client not configured — check env vars");
  }

  return (
    <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
        Workspace · Overview
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
        Welcome, {name}.
      </h1>
      <p className="text-muted max-w-xl mb-12">
        Your real-time workspace summary. Here is what you have been working on.
      </p>
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Real Tasks Count */}
        <div className="rounded-2xl border hairline bg-cream-deep/40 p-6">
          <p className="font-display text-3xl text-brown italic">{activeTasks}</p>
          <p className="text-xs text-muted mt-1">Active tasks</p>
        </div>
        {/* Real Meetings Count */}
        <div className="rounded-2xl border hairline bg-cream-deep/40 p-6">
          <p className="font-display text-3xl text-brown italic">{meetingsThisWeek}</p>
          <p className="text-xs text-muted mt-1">Meetings logged</p>
        </div>
        {/* Real Documents/Knowledge Count */}
        <div className="rounded-2xl border hairline bg-cream-deep/40 p-6">
          <p className="font-display text-3xl text-brown italic">{knowledgeItems}</p>
          <p className="text-xs text-muted mt-1">Knowledge items</p>
        </div>
      </div>
    </section>
  );
}