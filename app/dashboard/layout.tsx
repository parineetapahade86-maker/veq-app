import { UserButton } from "@clerk/nextjs";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileNav from "@/components/dashboard/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <header className="h-16 border-b hairline bg-cream/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-6">
          <MobileNav />
          <div className="hidden md:block" />
          <UserButton />
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
