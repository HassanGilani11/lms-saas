import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminHeader } from "@/components/shared/admin-header";
import { AdminRightSidebar } from "@/components/shared/admin-right-sidebar";
import { SidebarProvider } from "@/hooks/use-sidebar";
import { AdminLayoutWrapper } from "./_components/admin-layout-wrapper";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth();

    if (!session?.user) {
        return redirect("/auth/login");
    }

    if (session.user.role !== "ADMIN") {
        return redirect("/dashboard");
    }

    return (
        <SidebarProvider>
            <AdminLayoutWrapper>
                <AdminHeader />
                <div className="flex h-full overflow-hidden">
                    {/* Main Scrollable Content */}
                    <main className="flex-1 overflow-y-auto px-8 py-6">
                        {children}
                    </main>

                    {/* Right Supplementary Panel */}
                    <div className="hidden lg:block w-[300px] h-full shrink-0 sticky top-16">
                        <AdminRightSidebar />
                    </div>
                </div>
            </AdminLayoutWrapper>
        </SidebarProvider>
    );
};

export default AdminLayout;
