// app/dashboard/team/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShieldCheck, AlertTriangle, Users, Trophy, TrendingUp, TrendingDown, BookOpen, Calendar } from "lucide-react";

export default async function TeamControlRoomPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const supabase = getSupabase();
    if (!supabase) {
        return <div className="p-10 text-center text-red-600">Supabase Not Connected</div>;
    }

    let employees: any[] = [];
    let hasCompany = false;
    let currentProfile: any = null;

    // 1. Find the current user's profile
    const { data: profileData } = await supabase
        .from("user_profiles")
        .select("company_id, role")
        .eq("id", user.id)
        .single();

    currentProfile = profileData;

    // 🔒 This dashboard is only for founders/admins
    if (currentProfile && currentProfile.role !== "founder" && currentProfile.role !== "admin") {
        redirect("/dashboard");
    }

    // 2. Fetch all employees in the same company
    if (currentProfile?.company_id) {
        hasCompany = true;
        const { data } = await supabase
            .from("user_profiles")
            .select("id, email, role, created_at")
            .eq("company_id", currentProfile.company_id);
        employees = data || [];
    }

    // 3. Real calculation logic — work out each employee's score
    let realFullySynced = 0;
    let realNeedsAttention = 0;
    let realKnowledgeGap = 0;
    let totalScore = 0;

    const employeesWithStats = await Promise.all(
        employees.map(async (emp: any) => {
            // 🧠 FIX: Query "employee_knowledge" instead of "documents"
            const [knowledgeResult, taskResult, meetingResult] = await Promise.all([
                supabase
                    .from("employee_knowledge")
                    .select("*", { count: "exact", head: true })
                    .eq("company_id", currentProfile.company_id)
                    .eq("employee_id", emp.id),

                supabase
                    .from("tasks")
                    .select("*", { count: "exact", head: true })
                    .eq("assigned_to", emp.id), // Or "created_by" depending on your tasks table

                supabase
                    .from("employee_knowledge")
                    .select("*", { count: "exact", head: true })
                    .eq("company_id", currentProfile.company_id)
                    .eq("employee_id", emp.id)
                    .eq("source_type", "meeting")
            ]);

            const knowledgeCount = knowledgeResult.count ?? 0;
            const meetingCount = meetingResult.count ?? 0;
            const taskCount = taskResult.count ?? 0;

            // 🧠 NEW SCORE FORMULA:
            // Knowledge Items = 10 pts each (max 60)
            // Meetings = 15 pts each (max 30)
            // Base Activity = 10 pts
            let knowledgeScore = Math.min(knowledgeCount * 10, 60);
            let meetingScore = Math.min(meetingCount * 15, 30);
            let activityScore = 10;

            let score = knowledgeScore + meetingScore + activityScore;
            if (score > 100) score = 100;

            totalScore += score;

            // Decide status
            let status = "red";
            if (score >= 70) {
                status = "green";
                realFullySynced++;
            } else if (score >= 40) {
                status = "yellow";
                realNeedsAttention++;
            } else {
                realKnowledgeGap++;
            }

            return {
                ...emp,
                score,
                status,
                knowledgeCount,
                meetingCount,
                taskCount
            };
        })
    );

    // Overall team score (average)
    const overallScore = employeesWithStats.length > 0 ? Math.round(totalScore / employeesWithStats.length) : 0;

    return (
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                Workspace · Control Room
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                Team Knowledge Health
            </h1>
            <p className="text-muted max-w-xl mb-12">
                A real-time overview of your team's knowledge contribution and collaboration.
            </p>

            {!hasCompany ? (
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center">
                    <h3 className="font-display text-2xl text-yellow-900 italic mb-2">No Company Found</h3>
                    <p className="text-yellow-800">Please create your company profile first.</p>
                </div>
            ) : (
                <>
                    {/* Top stats cards (real data) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <div className="rounded-2xl border hairline bg-cream-deep/40 p-6 flex flex-col items-center justify-center text-center">
                            <Trophy className="w-8 h-8 text-brown mb-2" />
                            <p className="font-display text-5xl text-brown italic">{overallScore}</p>
                            <p className="text-xs text-muted mt-2 font-mono uppercase tracking-wider">Overall Score</p>
                        </div>
                        <div className="rounded-2xl border hairline bg-cream-deep/40 p-6 flex flex-col items-center justify-center text-center">
                            <ShieldCheck className="w-8 h-8 text-green-600 mb-2" />
                            <p className="font-display text-5xl text-green-700 italic">{realFullySynced}</p>
                            <p className="text-xs text-muted mt-2 font-mono uppercase tracking-wider">Fully Synced</p>
                        </div>
                        <div className="rounded-2xl border hairline bg-cream-deep/40 p-6 flex flex-col items-center justify-center text-center">
                            <AlertTriangle className="w-8 h-8 text-yellow-600 mb-2" />
                            <p className="font-display text-5xl text-yellow-700 italic">{realNeedsAttention}</p>
                            <p className="text-xs text-muted mt-2 font-mono uppercase tracking-wider">Needs Attention</p>
                        </div>
                        <div className="rounded-2xl border hairline bg-cream-deep/40 p-6 flex flex-col items-center justify-center text-center">
                            <Users className="w-8 h-8 text-red-600 mb-2" />
                            <p className="font-display text-5xl text-red-700 italic">{realKnowledgeGap}</p>
                            <p className="text-xs text-muted mt-2 font-mono uppercase tracking-wider">Knowledge Gap</p>
                        </div>
                    </div>

                    {/* Employee list (real scores) */}
                    <div className="rounded-2xl border hairline bg-white p-8 shadow-sm">
                        <h2 className="font-display text-2xl text-brown italic mb-6">
                            Employee Breakdown ({employeesWithStats.length})
                        </h2>

                        <div className="space-y-4">
                            {employeesWithStats.map((emp: any) => (
                                <div
                                    key={emp.id}
                                    className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border hairline bg-cream-deep/20 hover:bg-cream-deep/40 transition-colors"
                                >
                                    <div className="flex items-center gap-4 mb-3 md:mb-0 flex-1">
                                        <div className="w-12 h-12 rounded-full bg-brown text-cream flex items-center justify-center font-bold text-lg shrink-0">
                                            {emp.email ? emp.email.charAt(0).toUpperCase() : "?"}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-brown text-lg">{emp.email || "Unknown User"}</h3>
                                            <p className="text-xs text-muted capitalize">{emp.role || "Employee"}</p>

                                            {/* Mini Stats for this employee */}
                                            <div className="flex gap-4 mt-2 text-xs font-mono text-muted">
                                                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {emp.knowledgeCount} Docs</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {emp.meetingCount} Meetings</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            {emp.score >= 70 ? (
                                                <TrendingUp className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <TrendingDown className="w-5 h-5 text-yellow-600" />
                                            )}
                                            <span className="font-mono text-xl text-brown font-bold">{emp.score}/100</span>
                                        </div>

                                        <span
                                            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${emp.status === "green"
                                                ? "bg-green-100 text-green-800 border-green-200"
                                                : emp.status === "yellow"
                                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                    : "bg-red-100 text-red-800 border-red-200"
                                                }`}
                                        >
                                            {emp.status === "green"
                                                ? "Fully Synced"
                                                : emp.status === "yellow"
                                                    ? "Needs Attention"
                                                    : "Knowledge Gap"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}