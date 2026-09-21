"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase/server";
import { draftTaskFromText } from "@/lib/ai";

/**
 * Looks up the employees row for the signed-in Clerk user, creating one
 * on first use. This is what lets VEQ later say "assigned to Priya" or
 * "previous employee" instead of just a raw Clerk ID.
 */
async function getOrCreateEmployeeId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in.");

  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured yet.");

  const { data: existing } = await supabase
    .from("employees")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (existing) return existing.id as string;

  const user = await currentUser();
  const { data: created, error } = await supabase
    .from("employees")
    .insert({
      clerk_user_id: userId,
      full_name: user?.fullName ?? user?.firstName ?? null,
      email: user?.emailAddresses?.[0]?.emailAddress ?? null,
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Could not create employee record.");
  }
  return created.id as string;
}

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) return;

  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured yet.");

  const employeeId = await getOrCreateEmployeeId();

  await supabase.from("tasks").insert({
    title,
    description: description || null,
    created_by: employeeId,
  });

  await supabase.from("activity_log").insert({
    employee_id: employeeId,
    action: "created_task",
    summary: `Created task "${title}"`,
  });

  revalidatePath("/dashboard/tasks");
}

export async function createTaskWithAI(formData: FormData) {
  const spoken = String(formData.get("spoken") ?? "").trim();
  if (!spoken) return;

  const drafted = await draftTaskFromText(spoken);

  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured yet.");

  const employeeId = await getOrCreateEmployeeId();

  await supabase.from("tasks").insert({
    title: drafted.title,
    description: drafted.description,
    ai_generated: true,
    created_by: employeeId,
  });

  await supabase.from("activity_log").insert({
    employee_id: employeeId,
    action: "created_task",
    summary: `AI drafted task "${drafted.title}" from: "${spoken}"`,
  });

  revalidatePath("/dashboard/tasks");
}

export async function toggleTaskStatus(
  taskId: string,
  nextStatus: "open" | "in_progress" | "done",
) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured yet.");

  await supabase
    .from("tasks")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  revalidatePath("/dashboard/tasks");
}
