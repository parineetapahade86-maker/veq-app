import { currentUser } from "@clerk/nextjs/server"
import { getSupabase } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Sidebar from "@/components/dashboard/Sidebar"
import MobileNav from "@/components/dashboard/MobileNav"
import { UserButton } from "@clerk/nextjs"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ No try-catch: Agar error hua, toh Next.js humein exact error dikhayega
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const supabase = getSupabase()
  let hasCompany = false

  if (supabase) {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("company_id")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("Supabase Error:", error)
    }

    if (data?.company_id) {
      hasCompany = true
    }
  }

  if (!hasCompany) {
    redirect("/create-company")
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <header className="h-16 border-b border-neon-purple/20 bg-dark-800/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-6">
          <MobileNav />
          <div className="hidden md:block" />
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 border-2 border-neon-purple",
              }
            }}
          />
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}