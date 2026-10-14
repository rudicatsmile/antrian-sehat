import { StaffSidebar, StaffMobileNav } from "@/components/layouts/staff-sidebar";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-surface/50">
      <StaffSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <StaffMobileNav />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
